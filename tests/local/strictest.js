import { log } from "console"
import { basename } from "path"

log(basename(import.meta.url))
