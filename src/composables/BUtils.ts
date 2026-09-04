/* eslint-disable @typescript-eslint/no-explicit-any */
export const B = {
  codeToText: {
    quoteStatus: (code: string) => {
      switch (code) {
        case "QUOTED": return "Quoted";
        case "READY": return "Ready";
        case "RATEREQ": return "Rates Requested";
        case "INPROG": return "In Progress";
        default: return code;
      }
    },
    nonstd: (code: string) => {
      switch (code) {
        case "N": return "Standard";
        case "Y": return "Non-Std";
        case "C": return "Custom";
        default: return code;
      }
    },
    qtype: (code: string) => {
      switch (code) {
        case "MED": return "Medical";
        case "DEN": return "Dental";
        case "VIS": return "Vision";
        case "WEL": return "Wellness";
        default: return code;
      }
    }
  },
  ifNull: (value: any, ifNull: string): string => {
    if (value == undefined) return ifNull
    if (value == null) return ifNull
    if (!value) return ifNull
    return value
  },
  calculateAge: (dob:Date | string, onDate:Date | string = new Date()):number => { // From Google AI
    const birthDate = (typeof dob == 'string' ? new Date(dob) : dob) as Date
    const asOfDate = (typeof onDate == 'string' ? new Date(onDate) : onDate) as Date

    // 1. Calculate the rough age by subtracting years
    let age = asOfDate.getFullYear() - birthDate.getFullYear() as number

    // 2. Adjust if the birthday hasn't occurred yet this year
    const monthDifference = asOfDate.getMonth() - birthDate.getMonth();
    const dayDifference = asOfDate.getDate() - birthDate.getDate();

    if (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)) {
      age--;
    }
    return age;
  },
  getHash: async (message:string) => {
    // Encode string as UTF-8 Uint8Array
    const msgBuffer = new TextEncoder().encode(message);
    let hashHex = ""
    // Hash the message
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
    // Convert ArrayBuffer to Array
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    // Convert bytes to hex string
    hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex.toString();
  },
  format: {
    effdat: (d: string | Date) => {
      if (!d) return "";
      const date = new Date(d);
      const formatter = new Intl.DateTimeFormat("en-US", {
        month: "short",
        year: "numeric",
      });
      let parts = null
      try {
        parts = formatter.formatToParts(date);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch(err) {
        return d
      }
      const p = Object.fromEntries(parts.map((item) => [item.type, item.value]));
      const finalString = `${p.month} ${p.year}`;
      return finalString;
    },
    ts: (d: string | Date) => {
      if (!d) return "";
      const date = new Date(d);
      const formatter = new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });

      // Break the date down into raw layout tokens
      let parts = null
      try {
        parts = formatter.formatToParts(date);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch(err) {
        return d
      }
      const p = Object.fromEntries(parts.map((item) => [item.type, item.value]));

      // Extract the first letter of AM/PM and lowercase it ("AM" -> "a")
      const amPmMarker = p.dayPeriod ? p.dayPeriod.charAt(0).toLowerCase() : "";

      // Assemble your exact pattern string
      const finalString = `${p.month} ${p.day}, ${p.year} ${p.hour}:${p.minute}:${p.second}${amPmMarker}`;

      return finalString;
      // Output: "Jul 30, 2026 08:12:10a"
    },

    plural: (n: number, singular: string, plural?: string) => {
      return n === 1 ? singular : plural || `${singular}s`;
    },

  }
};
