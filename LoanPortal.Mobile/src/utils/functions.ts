export function getDaysLeftInMonth() {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    const lastDay = new Date(year, month + 1, 0).getDate();

    return lastDay - today.getDate();
}

export function getFormattedDate() {
    const date = new Date();
    const iso = date.toISOString();

    return iso.replace(/(\.\d{2})\dZ$/, "$1Z");
}

export function formatDateOfBirth(dob: Date | undefined) {
    if (!dob) {
        return "";
    }
    const year = dob.getFullYear();
    const month = String(dob.getMonth() + 1).padStart(2, '0');
    const day = String(dob.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function generateUUID() {
    return crypto.randomUUID();
}