import { createTygaClient } from "@crymad/api-client";
import { tygaConfig } from "./env.js";

export const tyga = createTygaClient(tygaConfig);
