type PersonName = string;

type PercentageAssignment = {
	name: string;
	percentage: number;
};

type Item = {
	name: string;
	price: number;
};

type ItemAssignments = {
	[itemName: string]: string[];
};

type SplitResult = {
	[personName: string]: string;
};

// function for splitting total amount equally among everyone
function equalSplit(totalDollars: number, people: PersonName[]): SplitResult {
	if (typeof totalDollars !== "number" || isNaN(totalDollars) || totalDollars < 0) {
		throw new Error("totalDollars must be a valid non-negative number");
	}

	if (!Array.isArray(people) || people.length === 0) {
		throw new Error("people must be a non-empty array");
	}

	// convert dollars to cents
	const totalCents = Math.round(totalDollars * 100);

	// calculate base amount and remainder
	const n = people.length;
	const base = Math.floor(totalCents / n);
	const remainder = totalCents % n;

	const result: Record<string, number> = {};

	// everyone is charged the base amount
	for (let i = 0; i < n; i++) {
		if (typeof people[i] !== "string" || people[i].trim() === "") {
			throw new Error("each person must have a valid name");
		}

		result[people[i]] = base;
	}

	// distribute the leftover cents
	for (let i = 0; i < remainder; i++) {
		result[people[i]] += 1;
	}

	// convert cents back to dollars for output
	const resultDollars: SplitResult = {};
	for (const person of people) {
		resultDollars[person] = (result[person] / 100).toFixed(2);
	}

	return resultDollars;
}

// function for splitting total amount based on percentage assigned to each person
function percentageSplit(
	totalDollars: number,
	assignments: PercentageAssignment[]
): SplitResult {
	// validation
	if (typeof totalDollars !== "number" || isNaN(totalDollars) || totalDollars < 0) {
		throw new Error("totalDollars must be a valid non-negative number");
	}

	// assignments should be an array of objects with each person's name and percentage to be charged
	if (!Array.isArray(assignments) || assignments.length === 0) {
		throw new Error("assignments must be a non-empty array");
	}

	// convert dollars to cents
	const totalCents = Math.round(totalDollars * 100);
	const result: Record<string, string> = {};
	let totalPercentage = 0;
	let runningTotal = 0;

	// validate each assignment and calculate total percentage
	for (const person of assignments) {
		if (
			!person.name ||
			typeof person.name !== "string" ||
			person.name.trim() === "" ||
			typeof person.percentage !== "number" ||
			isNaN(person.percentage) ||
			person.percentage < 0
		) {
			throw new Error("each assignment must have a valid name and percentage");
		}

		totalPercentage += person.percentage;
	}

	// ensure total percentage adds up to 100
	if (Math.abs(totalPercentage - 100) > 0.01) {
		throw new Error("percentages must add up to 100");
	}

	// calculate how much each person owes
	for (let i = 0; i < assignments.length; i++) {
		const person = assignments[i];
		let amountCents: number;

		// last person gets remaining amount to avoid rounding issues
		if (i === assignments.length - 1) {
			amountCents = totalCents - runningTotal;
		} else {
			amountCents = Math.round(totalCents * (person.percentage / 100));
			runningTotal += amountCents;
		}

		// convert cents back to dollars for output
		result[person.name] = (amountCents / 100).toFixed(2);
	}

	return result;
}

// function for splitting total amount based on itemized assignments
function itemizedSplit(items: Item[], assignments: ItemAssignments): SplitResult {
	// validation
	if (!Array.isArray(items) || items.length === 0) {
		throw new Error("items must be a non-empty array");
	}

	if (!assignments || typeof assignments !== "object") {
		throw new Error("assignments must be an object");
	}

	const result: Record<string, number> = {};

	// initialize each person's total to 0 and validate assignments
	for (const itemName in assignments) {
		const assignedPeople = assignments[itemName];

		if (!Array.isArray(assignedPeople)) {
			throw new Error(`assignments for "${itemName}" must be an array`);
		}

		// add each person to result if not already present
		for (const person of assignedPeople) {
			if (typeof person !== "string" || person.trim() === "") {
				throw new Error(`invalid person assigned to "${itemName}"`);
			}

			if (!(person in result)) {
				result[person] = 0;
			}
		}
	}

	// process each item and split cost among assigned people
	for (const item of items) {
		// validate items
		if (
			!item.name ||
			typeof item.name !== "string" ||
			item.name.trim() === "" ||
			typeof item.price !== "number" ||
			isNaN(item.price) ||
			item.price < 0
		) {
			throw new Error("each item must have a valid name and price");
		}

		const assignedPeople = assignments[item.name];

		// throw an error if item is not assigned to anyone
		if (!Array.isArray(assignedPeople) || assignedPeople.length === 0) {
			throw new Error(`item "${item.name}" must be assigned to at least one person`);
		}

		// convert price to cents for accurate splitting
		const itemCents = Math.round(item.price * 100);

		// split item cost among assigned people
		const splitCount = assignedPeople.length;
		const base = Math.floor(itemCents / splitCount);
		const remainder = itemCents % splitCount;

		for (let i = 0; i < splitCount; i++) {
			result[assignedPeople[i]] += base;
		}

		// distribute leftover cents
		for (let i = 0; i < remainder; i++) {
			result[assignedPeople[i]] += 1;
		}
	}

	// convert cents back to dollars for output
	const resultDollars: SplitResult = {};
	for (const person in result) {
		resultDollars[person] = (result[person] / 100).toFixed(2);
	}

	return resultDollars;
}

export {
	equalSplit,
	percentageSplit,
	itemizedSplit
};

export type {
	PersonName,
	PercentageAssignment,
	Item,
	ItemAssignments,
	SplitResult
};
