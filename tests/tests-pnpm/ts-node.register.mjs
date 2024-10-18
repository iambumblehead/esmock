// https://github.com/TypeStrong/ts-node/issues/2100

import { pathToFileURL } from "node:url"
import { register } from "node:module"

register("ts-node/esm", pathToFileURL("./"))
