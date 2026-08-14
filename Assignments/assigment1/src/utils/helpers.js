// ============================================================================
// src/utils/helpers.js
//
// Chhote reusable functions. Har ek ka SIRF EK kaam.
// Rule: ek cheez 3 jagah repeat ho rahi ho -> helper bana do.
// ============================================================================

/**
 * escapeRegex(string)
 *
 * User ke input ko regex me daalne se PEHLE special characters escape karta hai.
 * Search API me ye SABSE IMPORTANT security line hai.
 *
 * Kaise kaam karta hai:
 *   [.*+?^${}()|[\]\\]  -> ye saare regex ke SPECIAL characters hain
 *   g flag              -> saare occurrences badlo, sirf pehla nahi
 *   $&                  -> jo match hua wahi wapas rakho
 *   '\\$&'              -> uske aage ek backslash laga do (escape kar do)
 *
 * Example: "c++"  ->  "c\+\+"   (ab + ka special meaning khatam, plain text ban gaya)
 *
 * ⚠️ 2 problems solve karta hai:
 *   1) GALAT RESULT: user "c++" search kare to bina escape ke regex me `+` ka
 *      matlab "ek ya zyada" ho jaata hai -> query hi galat ban jaati hai.
 *   2) ReDoS ATTACK: user `(a+)+$` jaisa pattern bhej de to regex engine
 *      exponential time lene lagta hai. Node SINGLE-THREADED hai, matlab
 *      ek hi request poore server ko FREEZE kar degi. Ye asli DoS bug hai.
 */
const escapeRegex = (string = "") => {
  return String(string).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

/**
 * buildSort("price:asc")            ->  { price: 1 }
 * buildSort("category:asc,price:desc") -> { category: 1, price: -1 }
 *
 * Query string ko Mongoose ke sort object me convert karta hai.
 *
 * ⚠️ Default sort `{ _id: -1 }` rakha hai. Kyun?
 *    Humare productSchema me `timestamps: true` NAHI hai, isliye `createdAt`
 *    field hai hi nahi. LEKIN MongoDB ke ObjectId ke andar hi creation ka
 *    timestamp chhupa hota hai! Isliye `_id: -1` = "naya product pehle".
 *    Ye ek badhiya trick hai jab schema me timestamps na ho.
 *
 * @param {string} sortBy       - "field:asc" ya "field:desc" (comma se multiple)
 * @param {Array}  allowedFields - sirf in fields pe sort allow karo (security)
 */
const buildSort = (sortBy, allowedFields = []) => {
  const defaultSort = { _id: -1 };
  if (!sortBy) return defaultSort;

  const sort = {};

  sortBy.split(",").forEach((part) => {
    const [field, order] = part.split(":");
    const cleanField = (field || "").trim();

    // Whitelist check: user koi bhi random field bhej ke DB pe bhaari
    // unindexed sort nahi karwa sakta.
    if (cleanField && allowedFields.includes(cleanField)) {
      sort[cleanField] = order === "desc" ? -1 : 1;
    }
  });

  // Agar user ne sirf galat fields bheje to default pe wapas
  return Object.keys(sort).length ? sort : defaultSort;
};

/**
 * buildPaginationMeta — frontend ko pagination ke liye jo-jo chahiye.
 *
 * totalPages ka `|| 1` kyun? Agar totalResults = 0 hai to Math.ceil(0/10) = 0
 * aayega, aur "Page 1 of 0" ajeeb lagta hai. Isliye minimum 1.
 */
const buildPaginationMeta = ({ page, limit, totalResults }) => {
  const totalPages = Math.ceil(totalResults / limit) || 1;

  return {
    page,
    limit,
    totalResults,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

module.exports = { escapeRegex, buildSort, buildPaginationMeta };
