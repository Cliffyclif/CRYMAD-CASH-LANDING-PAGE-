import { createTygaClient } from "./tyga-client/index.js";
import { tygaConfig } from "./env.js";

export const tyga = createTygaClient(tygaConfig);
