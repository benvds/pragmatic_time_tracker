import { makeWorker } from "@livestore/adapter-web/worker";
import { schema } from "./schema.js";

makeWorker({
    schema,
    // Local-only storage (no sync configuration)
});
