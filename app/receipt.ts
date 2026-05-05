import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "./firebase";
import { extractFirstCurrency } from "./utils/ocr";

export type ParsedReceiptItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

export async function uploadReceiptItem(uri: string, sessionId: string) {
  const response = await fetch(uri);
  const blob = await response.blob();

  const imageRef = ref(storage, `receipts/${sessionId}/receipt.jpg`);

  await uploadBytes(imageRef, blob);

  return await getDownloadURL(imageRef);
}

export function parseReceiptText(rawText: string) {
  const lines = rawText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const items: ParsedReceiptItem[] = [];

  for (const line of lines) {
    const price = extractFirstCurrency(line);

    if (price !== null) {
      const name = line
        .replace(/\$?\d+(\.\d{2})?/, "")
        .trim();

      if (name.length > 0) {
        items.push({
          id: `${Date.now()}-${items.length}`,
          name,
          price,
          quantity: 1,
        });
      }
    }
  }

  const totalLine = lines.find((line) =>
    line.toLowerCase().includes("total")
  );

  const total = totalLine ? extractFirstCurrency(totalLine) : null;

  return {
    rawText,
    items,
    total,
  };
}

export async function saveReceiptScanToSession(
  sessionId: string,
  imageUri: string,
  rawText: string
) {
  const receiptImageUrl = await uploadReceiptItem(imageUri, sessionId);
  const parsedReceipt = parseReceiptText(rawText);

  await updateDoc(doc(db, "sessions", sessionId), {
  receiptImageUrl,
  ocrResult: parsedReceipt,
  items: parsedReceipt.items.map((item) => ({
    ...item,
    selectedBy: [],
    selectedByUsername: [],
  })),
  total: parsedReceipt.total,
  stage: "editing",
  status: "scanning",
  updatedAt: serverTimestamp(),
});

  return {
    receiptImageUrl,
    ...parsedReceipt,
  }
};