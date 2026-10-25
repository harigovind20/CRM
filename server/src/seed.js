import "dotenv/config";
import mongoose from "mongoose";
import Contact from "./models/Contact.js";
import Deal from "./models/Deal.js";
import Task from "./models/Task.js";

const day = (n) => new Date(Date.now() + n * 864e5);

const contacts = [
  ["Priya Raman", "Orbit Labs", "Head of Ops", "Customer", "priya@orbitlabs.io", "Chennai", 48200, -2, "Asked about annual billing and an SSO add-on."],
  ["Daniel Okafor", "Brightpath", "CTO", "Lead", "daniel@brightpath.co", "Lagos", 0, 0, "Downloaded the security whitepaper."],
  ["Mei Tanaka", "Harbor & Co", "VP Sales", "Prospect", "mei@harbor.jp", "Osaka", 0, -5, "Demo booked for next Tuesday."],
  ["Lucas Meyer", "Kettle Systems", "Founder", "Customer", "lucas@kettle.de", "Berlin", 23900, -7, "Happy with onboarding, wants API docs."],
  ["Ana Souza", "Verde Foods", "COO", "Prospect", "ana@verde.com.br", "São Paulo", 0, -3, "Comparing us with two other vendors."],
  ["Ravi Menon", "Zephyr Cloud", "Eng Manager", "Lead", "ravi@zephyr.cloud", "Bengaluru", 0, -1, "Joined the webinar, replied to follow-up."],
  ["Hannah Cole", "Fieldnote", "Director", "Customer", "hannah@fieldnote.app", "Austin", 61500, 0, "Renewal due next month."],
  ["Omar Haddad", "Souk Digital", "CEO", "Churned", "omar@soukdigital.ae", "Dubai", 14400, -21, "Left after budget cuts. Revisit in Q1."],
  ["Sofia Rossi", "Lumen Studio", "Marketing Lead", "Lead", "sofia@lumen.it", "Milan", 0, -4, "Found us through a partner referral."],
  ["Tom Whitaker", "Crestline", "Procurement", "Prospect", "tom@crestline.co.uk", "Leeds", 0, -6, "Needs a legal review before signing."],
  ["Aisha Khan", "Nimbus Pay", "Product Lead", "Customer", "aisha@nimbuspay.com", "Karachi", 33100, -2, "Requested a custom dashboard."],
  ["Jonas Berg", "Fjord Energy", "IT Director", "Lead", "jonas@fjord.no", "Oslo", 0, -7, "Wants a data residency answer."],
].map(([name, company, title, status, email, city, value, d, note], i) => ({
  name, company, title, status, email, city, value, note, lastContact: day(d),
  phone: `+1 555 01${String(i + 10).padStart(2, "0")}`, // placeholder numbers
}));

const deals = [
  ["Orbit Labs – SSO expansion", 18000, "Priya Raman", "Negotiation", 7],
  ["Brightpath – Platform pilot", 9500, "Daniel Okafor", "Lead", 27],
  ["Harbor & Co – Team plan", 26000, "Mei Tanaka", "Qualified", 21],
  ["Verde Foods – Annual license", 32000, "Ana Souza", "Proposal", 14],
  ["Fieldnote – Renewal", 61500, "Hannah Cole", "Negotiation", 30],
  ["Zephyr Cloud – Starter", 7800, "Ravi Menon", "Qualified", 35],
  ["Nimbus Pay – Custom dashboard", 21000, "Aisha Khan", "Proposal", 25],
  ["Crestline – Enterprise", 44000, "Tom Whitaker", "Proposal", 45],
  ["Lumen Studio – Growth plan", 12600, "Sofia Rossi", "Lead", 40],
  // Won deals spread over past months so the revenue chart has data
  ["Kettle Systems – API add-on", 8400, "Lucas Meyer", "Won", -10],
  ["Orbit Labs – Annual plan", 24000, "Priya Raman", "Won", -35],
  ["Nimbus Pay – Core license", 33100, "Aisha Khan", "Won", -68],
  ["Fieldnote – Team plan", 29500, "Hannah Cole", "Won", -95],
  ["Souk Digital – Starter", 14400, "Omar Haddad", "Won", -125],
  ["Kettle Systems – Platform", 23900, "Lucas Meyer", "Won", -155],
].map(([title, value, owner, stage, d]) => ({ title, value, owner, stage, closeDate: day(d) }));

const tasks = [
  ["Send pricing sheet to Verde Foods", 0, false, "High"],
  ["Prepare demo for Harbor & Co", 1, false, "High"],
  ["Follow up with Brightpath on whitepaper", 0, false, "Medium"],
  ["Reply to Jonas about data residency", -2, false, "High"],
  ["Review Fieldnote renewal terms", 4, false, "Medium"],
  ["Book legal call with Crestline", 5, false, "Medium"],
  ["Log notes from Orbit Labs call", -1, true, "Low"],
  ["Update Q4 forecast", 6, false, "Low"],
].map(([text, d, done, priority]) => ({ text, due: day(d), done, priority }));

await mongoose.connect(process.env.MONGO_URI);
await Promise.all([Contact.deleteMany(), Deal.deleteMany(), Task.deleteMany()]);
await Promise.all([Contact.insertMany(contacts), Deal.insertMany(deals), Task.insertMany(tasks)]);
console.log(`Seeded ${contacts.length} contacts, ${deals.length} deals, ${tasks.length} tasks`);
await mongoose.disconnect();
