/* eslint-disable @typescript-eslint/no-explicit-any */
export const B = {
  dateFromYYYYMMDD: (yyyymmdd:string):Date => {
    const splitter = yyyymmdd.charAt(4)
    const parts:string[] = yyyymmdd.split(splitter)
    if (parts.length < 3) return new Date(yyyymmdd)
    const newd = new Date(parseInt(parts[0]!), parseInt(parts[1]!)-1, parseInt(parts[2]!))
    newd.setHours(0, 0, 0, 0)
    return newd
  },
  firstOfMonth: (month_offset:number = 0):Date => {
    const d = new Date()
    d.setDate(1)
    d.setHours(0, 0, 0, 0)
    if (month_offset != 0) d.setMonth(d.getMonth() + month_offset)
    return d
  },
  codeToText: {
    /**
     * converts Rating LOB code to object with descr and quote type (family)
     *
     * @param rlob - The rlob code to translate from
     * @returns The object with related data
     *
     * @example
     * ```typescript
     * const desc = B.codeToText.rlob('PPO1').descr // returns "Blue Options"
     * ```
     */
    rlob: (rlob: string) => {
      switch (rlob) {
        case 'PPO1': return 'Blue Options'
        case 'PPO3': return 'Blue Options 1-2-3'
        case 'HPN1': return 'Blue High Performance Network'
        case 'DTL1': return 'Dental Blue'
        case 'DTL2': return 'Dental Blue Select'
        case 'VIS1': return 'Blue 20/20'
        default: return 'Unknown'
      }
    },

    /**
     * converts quote status code to descriptive text
     *
     * @param code - The code to translate from
     * @returns The descriptive text, or the passed code if not found
     *
     * @example
     * ```typescript
     * const desc = B.codeToText.quoteStatus('INPROG') // returns "In Progress"
     * ```
     */
    quoteStatus: (code: string) => {
      switch (code) {
        case "QUOTED": return "Quoted";
        case "READY": return "Ready";
        case "RATEREQ": return "Rates Requested";
        case "PENDING": return "Pending Approval";
        case "INPROG": return "In Progress";
        case "ENROLLED": return "Enrolled";
        case "EXPIRED": return "Expired";
        default: return code;
      }
    },
    /**
     * converts quote nonstandard code to descriptive text
     *
     * @param code - The code to translate from
     * @returns The descriptive text, or the passed code if not found
     *
     * @example
     * ```typescript
     * const desc = B.codeToText.nonstd('C') // Custom
     * ```
     */
    nonstd: (code: string) => {
      switch (code) {
        case "N": return "Standard";
        case "Y": return "Non-Std";
        case "C": return "Custom";
        default: return code;
      }
    },
    /**
     * converts quote funding code to descriptive text
     *
     * @param code - The code to translate from
     * @returns The descriptive text, or the passed code if not found
     *
     * @example
     * ```typescript
     * const desc = B.codeToText.funding('BF') // Balanced
     * ```
     */
    funding: (code: string) => {
      switch (code) {
        case "FI": return "Fully Insured";
        case "ASO": return "ASO";
        case "BF": return "Balanced";
        default: return code;
      }
    },
    /**
     * converts quote type code to descriptive text
     *
     * @param code - The code to translate from
     * @returns The descriptive text, or the passed code if not found
     *
     * @example
     * ```typescript
     * const desc = B.codeToText.qtype('MED') // Medical
     * ```
     */
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
  ifNull: (value: any, ifNull:any) => {
    /**
     * checks value and returns. value or ifNull if value is undefined or null
     *
     * @param value - The value, which may be undefined or null
     * @param ifNull - the value to return if value is undefined or null
     * @returns Either value, or ifNull
     *
     * @example
     * ```typescript
     * let test = null
     * console.log(B.ifNull(test, 'Beef')) // Beef
     * test = "I'm good"
     * console.log(B.ifNull(test, 'Beef')) // I'm good
     * ```
     */
    if (value == undefined) return ifNull
    if (value == null) return ifNull
    if (!value) return ifNull
    return value
  },
  deleteProperties: (obj:any, ...props:string[]) => {
    /**
     * Deletes the specified list of properties from object
     *
     * @param obj - A JSON object
     * @param ...props - Any number of property names
     * @returns Nothing... this mutates the obj passed in
     *
     * @example
     * ```typescript
     * const test = {'a':'keep me', 'b':'remove me', 'c':'remove me too'}
     * B.deleteProperties(test, 'b', 'c')
     * console.log(test) // {'a':'keep me'}
     * ```
     */
    props.forEach(prop => delete obj[prop])
  },
  calculateAge: (dob:Date | string, onDate:Date | string = new Date()):number => { // From Google AI
    /**
     * Returns age attained for someone born on dob as of onDate
     * -- dob or onDate can be provided as Date object or strings that can be convertee to dates
     *
     * @param dob - The date the person was born
     * @param onDate - The date to check age for - Uses today's date if not provided
     * @returns The number of years that have passed between dob and onDate
     *
     * @example
     * ```typescript
     * console.log(B.calculateAge('9/1/1960', '8/1/2026')) // 65
     * console.log(B.calculateAge('9/1/1960', '9/1/2026')) // 66
     * ```
     */
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
    /**
     * Returns SHA-256 encoding of provided string
     *
     * @param message - The text to be encoded
     * @returns The encoded has string
     *
     * @example
     * ```typescript
     * console.log(B.getHash('beef') // 'S999DA0283' <or whatever it really is>
     * ```
     */
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
  statusIcon: (statusCode:string) => {
    if ('INPROG'.indexOf(statusCode) >= 0) return "#red hand_"
    if ('RATEREQ,PENDING'.indexOf(statusCode) >= 0) return "#sienna solid pause_"
    if ('READY'.indexOf(statusCode) >= 0) return "#forestgreen solid check_"
    if ('ENROLLED'.indexOf(statusCode) >= 0) return "#forestgreen solid thumbs-up_"
    if ('EXPIRED'.indexOf(statusCode) >= 0) return "#maroon solid x_"
    return "circle_"
  },

  format: {
    /**
     * Returns 3-char month and year of provided date
     * The day number is omitted since it can ONLY be the first of a month
     * -- date can be either a Date object or string that can be converted to a Date
     *
     * @param d - Date to be formatted
     * @returns a formatted date
     *
     * @example
     * ```typescript
     * console.log(B.format.effdat('3/1/2027') // Mar 2027
     * ```
     */
    effdat: (d: string | Date) => {
      if (!d) return "";
      let date:Date
      if (typeof d == "string") {
        date = B.dateFromYYYYMMDD(d)
      } else {
        date = d
      }
      // const date = new Date(d);
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
    /**
     * Returns a formatted timestamp string in 1hr format
     * -- date can be either a Date object or string that can be converted to a Date
     *
     * @param d - Date to be formatted
     * @returns a formatted date
     *
     * @example
     * ```typescript
     * console.log(B.format.ts(new Date()) // Sep 07, 2026 07:47:25a
     * ```
     */
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
    date: (d: string | Date = new Date()) => {
      if (!d) return "";
      const date = new Date(d);
      const formatter = new Intl.DateTimeFormat("en-US", {
        month: "numeric",
        day: "numeric",
        year: "numeric"
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

      // Assemble your exact pattern string
      const finalString = `${p.month}/${p.day}/${p.year}`;

      return finalString;
      // Output: "9/11/2026"
    },

    /**
     * Returns one of 2 strings depending on if the number is 1 or anything else
     *
     * @param n - number to be checked
     * @param singular - value to return if n = 1
     * @param plural - value to return if n != 1 (if not provided, an 's' is appended to singular)
     * @returns a formatted date
     *
     * @example
     * ```typescript
     * console.log(2, B.format.plural(2, 'person','people') // 2 people
     * console.log(2, B.format.plural(2, 'row') // 2 rows
     * ```
     */
    plural: (n: number, singular: string, plural?: string) => {
      return n === 1 ? singular : plural || `${singular}s`;
    },

    valueWithUnits: (n: number, singular: string, plural?: string) => {
      if (!n) n = 0
      const value = n == 0 ? 'No' : n.toString()
      const units = B.format.plural(n, singular, plural)
      return `${value} ${units}`
    }

  },
  getJsonDiff: (obj1:any, obj2:any) => {
    // If both are identical primitives or point to the same reference, no difference
    if (Object.is(obj1, obj2)) return undefined;

    // If either is not an object (or is null), return the new value (obj2)
    if (typeof obj1 !== 'object' || obj1 === null || typeof obj2 !== 'object' || obj2 === null) {
        return obj2;
    }

    // Handle arrays specifically if you need index-by-index comparison
    if (Array.isArray(obj1) || Array.isArray(obj2)) {
        if (JSON.stringify(obj1) === JSON.stringify(obj2)) return undefined;
        return obj2; // Return the updated array if they differ
    }

    const diff:any = {};
    const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);

    allKeys.forEach(key => {
        // Case 1: Key was deleted in obj2
        if (!(key in obj2)) {
            diff[key] = { __deleted: true, oldValue: obj1[key] };
        }
        // Case 2: Key was added in obj2
        else if (!(key in obj1)) {
            diff[key] = obj2[key];
        }
        // Case 3: Key exists in both, deep compare them
        else {
            const nestedDiff = B.getJsonDiff(obj1[key], obj2[key]);
            if (nestedDiff !== undefined) {
                diff[key] = nestedDiff;
            }
        }
    });
    console.dir(diff)
    return Object.keys(diff).length > 0 ? diff : undefined;
  }
};
