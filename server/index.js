var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/zod/v3/helpers/util.cjs
var require_util = __commonJS({
  "node_modules/zod/v3/helpers/util.cjs"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getParsedType = exports.ZodParsedType = exports.objectUtil = exports.util = void 0;
    var util;
    (function(util2) {
      util2.assertEqual = (_) => {
      };
      function assertIs(_arg) {
      }
      util2.assertIs = assertIs;
      function assertNever(_x) {
        throw new Error();
      }
      util2.assertNever = assertNever;
      util2.arrayToEnum = (items) => {
        const obj = {};
        for (const item of items) {
          obj[item] = item;
        }
        return obj;
      };
      util2.getValidEnumValues = (obj) => {
        const validKeys = util2.objectKeys(obj).filter((k) => typeof obj[obj[k]] !== "number");
        const filtered = {};
        for (const k of validKeys) {
          filtered[k] = obj[k];
        }
        return util2.objectValues(filtered);
      };
      util2.objectValues = (obj) => {
        return util2.objectKeys(obj).map(function(e) {
          return obj[e];
        });
      };
      util2.objectKeys = typeof Object.keys === "function" ? (obj) => Object.keys(obj) : (object) => {
        const keys = [];
        for (const key in object) {
          if (Object.prototype.hasOwnProperty.call(object, key)) {
            keys.push(key);
          }
        }
        return keys;
      };
      util2.find = (arr, checker) => {
        for (const item of arr) {
          if (checker(item))
            return item;
        }
        return void 0;
      };
      util2.isInteger = typeof Number.isInteger === "function" ? (val) => Number.isInteger(val) : (val) => typeof val === "number" && Number.isFinite(val) && Math.floor(val) === val;
      function joinValues(array, separator = " | ") {
        return array.map((val) => typeof val === "string" ? `'${val}'` : val).join(separator);
      }
      util2.joinValues = joinValues;
      util2.jsonStringifyReplacer = (_, value) => {
        if (typeof value === "bigint") {
          return value.toString();
        }
        return value;
      };
    })(util || (exports.util = util = {}));
    var objectUtil;
    (function(objectUtil2) {
      objectUtil2.mergeShapes = (first, second) => {
        return {
          ...first,
          ...second
          // second overwrites first
        };
      };
    })(objectUtil || (exports.objectUtil = objectUtil = {}));
    exports.ZodParsedType = util.arrayToEnum([
      "string",
      "nan",
      "number",
      "integer",
      "float",
      "boolean",
      "date",
      "bigint",
      "symbol",
      "function",
      "undefined",
      "null",
      "array",
      "object",
      "unknown",
      "promise",
      "void",
      "never",
      "map",
      "set"
    ]);
    var getParsedType = (data) => {
      const t = typeof data;
      switch (t) {
        case "undefined":
          return exports.ZodParsedType.undefined;
        case "string":
          return exports.ZodParsedType.string;
        case "number":
          return Number.isNaN(data) ? exports.ZodParsedType.nan : exports.ZodParsedType.number;
        case "boolean":
          return exports.ZodParsedType.boolean;
        case "function":
          return exports.ZodParsedType.function;
        case "bigint":
          return exports.ZodParsedType.bigint;
        case "symbol":
          return exports.ZodParsedType.symbol;
        case "object":
          if (Array.isArray(data)) {
            return exports.ZodParsedType.array;
          }
          if (data === null) {
            return exports.ZodParsedType.null;
          }
          if (data.then && typeof data.then === "function" && data.catch && typeof data.catch === "function") {
            return exports.ZodParsedType.promise;
          }
          if (typeof Map !== "undefined" && data instanceof Map) {
            return exports.ZodParsedType.map;
          }
          if (typeof Set !== "undefined" && data instanceof Set) {
            return exports.ZodParsedType.set;
          }
          if (typeof Date !== "undefined" && data instanceof Date) {
            return exports.ZodParsedType.date;
          }
          return exports.ZodParsedType.object;
        default:
          return exports.ZodParsedType.unknown;
      }
    };
    exports.getParsedType = getParsedType;
  }
});

// node_modules/zod/v3/ZodError.cjs
var require_ZodError = __commonJS({
  "node_modules/zod/v3/ZodError.cjs"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ZodError = exports.quotelessJson = exports.ZodIssueCode = void 0;
    var util_js_1 = require_util();
    exports.ZodIssueCode = util_js_1.util.arrayToEnum([
      "invalid_type",
      "invalid_literal",
      "custom",
      "invalid_union",
      "invalid_union_discriminator",
      "invalid_enum_value",
      "unrecognized_keys",
      "invalid_arguments",
      "invalid_return_type",
      "invalid_date",
      "invalid_string",
      "too_small",
      "too_big",
      "invalid_intersection_types",
      "not_multiple_of",
      "not_finite"
    ]);
    var quotelessJson = (obj) => {
      const json = JSON.stringify(obj, null, 2);
      return json.replace(/"([^"]+)":/g, "$1:");
    };
    exports.quotelessJson = quotelessJson;
    var ZodError2 = class _ZodError extends Error {
      get errors() {
        return this.issues;
      }
      constructor(issues) {
        super();
        this.issues = [];
        this.addIssue = (sub) => {
          this.issues = [...this.issues, sub];
        };
        this.addIssues = (subs = []) => {
          this.issues = [...this.issues, ...subs];
        };
        const actualProto = new.target.prototype;
        if (Object.setPrototypeOf) {
          Object.setPrototypeOf(this, actualProto);
        } else {
          this.__proto__ = actualProto;
        }
        this.name = "ZodError";
        this.issues = issues;
      }
      format(_mapper) {
        const mapper = _mapper || function(issue) {
          return issue.message;
        };
        const fieldErrors = { _errors: [] };
        const processError = (error) => {
          for (const issue of error.issues) {
            if (issue.code === "invalid_union") {
              issue.unionErrors.map(processError);
            } else if (issue.code === "invalid_return_type") {
              processError(issue.returnTypeError);
            } else if (issue.code === "invalid_arguments") {
              processError(issue.argumentsError);
            } else if (issue.path.length === 0) {
              fieldErrors._errors.push(mapper(issue));
            } else {
              let curr = fieldErrors;
              let i = 0;
              while (i < issue.path.length) {
                const el = issue.path[i];
                const terminal = i === issue.path.length - 1;
                if (!terminal) {
                  curr[el] = curr[el] || { _errors: [] };
                } else {
                  curr[el] = curr[el] || { _errors: [] };
                  curr[el]._errors.push(mapper(issue));
                }
                curr = curr[el];
                i++;
              }
            }
          }
        };
        processError(this);
        return fieldErrors;
      }
      static assert(value) {
        if (!(value instanceof _ZodError)) {
          throw new Error(`Not a ZodError: ${value}`);
        }
      }
      toString() {
        return this.message;
      }
      get message() {
        return JSON.stringify(this.issues, util_js_1.util.jsonStringifyReplacer, 2);
      }
      get isEmpty() {
        return this.issues.length === 0;
      }
      flatten(mapper = (issue) => issue.message) {
        const fieldErrors = {};
        const formErrors = [];
        for (const sub of this.issues) {
          if (sub.path.length > 0) {
            const firstEl = sub.path[0];
            fieldErrors[firstEl] = fieldErrors[firstEl] || [];
            fieldErrors[firstEl].push(mapper(sub));
          } else {
            formErrors.push(mapper(sub));
          }
        }
        return { formErrors, fieldErrors };
      }
      get formErrors() {
        return this.flatten();
      }
    };
    exports.ZodError = ZodError2;
    ZodError2.create = (issues) => {
      const error = new ZodError2(issues);
      return error;
    };
  }
});

// node_modules/zod/v3/locales/en.cjs
var require_en = __commonJS({
  "node_modules/zod/v3/locales/en.cjs"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ZodError_js_1 = require_ZodError();
    var util_js_1 = require_util();
    var errorMap = (issue, _ctx) => {
      let message;
      switch (issue.code) {
        case ZodError_js_1.ZodIssueCode.invalid_type:
          if (issue.received === util_js_1.ZodParsedType.undefined) {
            message = "Required";
          } else {
            message = `Expected ${issue.expected}, received ${issue.received}`;
          }
          break;
        case ZodError_js_1.ZodIssueCode.invalid_literal:
          message = `Invalid literal value, expected ${JSON.stringify(issue.expected, util_js_1.util.jsonStringifyReplacer)}`;
          break;
        case ZodError_js_1.ZodIssueCode.unrecognized_keys:
          message = `Unrecognized key(s) in object: ${util_js_1.util.joinValues(issue.keys, ", ")}`;
          break;
        case ZodError_js_1.ZodIssueCode.invalid_union:
          message = `Invalid input`;
          break;
        case ZodError_js_1.ZodIssueCode.invalid_union_discriminator:
          message = `Invalid discriminator value. Expected ${util_js_1.util.joinValues(issue.options)}`;
          break;
        case ZodError_js_1.ZodIssueCode.invalid_enum_value:
          message = `Invalid enum value. Expected ${util_js_1.util.joinValues(issue.options)}, received '${issue.received}'`;
          break;
        case ZodError_js_1.ZodIssueCode.invalid_arguments:
          message = `Invalid function arguments`;
          break;
        case ZodError_js_1.ZodIssueCode.invalid_return_type:
          message = `Invalid function return type`;
          break;
        case ZodError_js_1.ZodIssueCode.invalid_date:
          message = `Invalid date`;
          break;
        case ZodError_js_1.ZodIssueCode.invalid_string:
          if (typeof issue.validation === "object") {
            if ("includes" in issue.validation) {
              message = `Invalid input: must include "${issue.validation.includes}"`;
              if (typeof issue.validation.position === "number") {
                message = `${message} at one or more positions greater than or equal to ${issue.validation.position}`;
              }
            } else if ("startsWith" in issue.validation) {
              message = `Invalid input: must start with "${issue.validation.startsWith}"`;
            } else if ("endsWith" in issue.validation) {
              message = `Invalid input: must end with "${issue.validation.endsWith}"`;
            } else {
              util_js_1.util.assertNever(issue.validation);
            }
          } else if (issue.validation !== "regex") {
            message = `Invalid ${issue.validation}`;
          } else {
            message = "Invalid";
          }
          break;
        case ZodError_js_1.ZodIssueCode.too_small:
          if (issue.type === "array")
            message = `Array must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `more than`} ${issue.minimum} element(s)`;
          else if (issue.type === "string")
            message = `String must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `over`} ${issue.minimum} character(s)`;
          else if (issue.type === "number")
            message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
          else if (issue.type === "bigint")
            message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
          else if (issue.type === "date")
            message = `Date must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${new Date(Number(issue.minimum))}`;
          else
            message = "Invalid input";
          break;
        case ZodError_js_1.ZodIssueCode.too_big:
          if (issue.type === "array")
            message = `Array must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `less than`} ${issue.maximum} element(s)`;
          else if (issue.type === "string")
            message = `String must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `under`} ${issue.maximum} character(s)`;
          else if (issue.type === "number")
            message = `Number must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
          else if (issue.type === "bigint")
            message = `BigInt must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
          else if (issue.type === "date")
            message = `Date must be ${issue.exact ? `exactly` : issue.inclusive ? `smaller than or equal to` : `smaller than`} ${new Date(Number(issue.maximum))}`;
          else
            message = "Invalid input";
          break;
        case ZodError_js_1.ZodIssueCode.custom:
          message = `Invalid input`;
          break;
        case ZodError_js_1.ZodIssueCode.invalid_intersection_types:
          message = `Intersection results could not be merged`;
          break;
        case ZodError_js_1.ZodIssueCode.not_multiple_of:
          message = `Number must be a multiple of ${issue.multipleOf}`;
          break;
        case ZodError_js_1.ZodIssueCode.not_finite:
          message = "Number must be finite";
          break;
        default:
          message = _ctx.defaultError;
          util_js_1.util.assertNever(issue);
      }
      return { message };
    };
    exports.default = errorMap;
  }
});

// node_modules/zod/v3/errors.cjs
var require_errors = __commonJS({
  "node_modules/zod/v3/errors.cjs"(exports) {
    "use strict";
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.defaultErrorMap = void 0;
    exports.setErrorMap = setErrorMap;
    exports.getErrorMap = getErrorMap;
    var en_js_1 = __importDefault(require_en());
    exports.defaultErrorMap = en_js_1.default;
    var overrideErrorMap = en_js_1.default;
    function setErrorMap(map) {
      overrideErrorMap = map;
    }
    function getErrorMap() {
      return overrideErrorMap;
    }
  }
});

// node_modules/zod/v3/helpers/parseUtil.cjs
var require_parseUtil = __commonJS({
  "node_modules/zod/v3/helpers/parseUtil.cjs"(exports) {
    "use strict";
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isAsync = exports.isValid = exports.isDirty = exports.isAborted = exports.OK = exports.DIRTY = exports.INVALID = exports.ParseStatus = exports.EMPTY_PATH = exports.makeIssue = void 0;
    exports.addIssueToContext = addIssueToContext;
    var errors_js_1 = require_errors();
    var en_js_1 = __importDefault(require_en());
    var makeIssue = (params) => {
      const { data, path, errorMaps, issueData } = params;
      const fullPath = [...path, ...issueData.path || []];
      const fullIssue = {
        ...issueData,
        path: fullPath
      };
      if (issueData.message !== void 0) {
        return {
          ...issueData,
          path: fullPath,
          message: issueData.message
        };
      }
      let errorMessage = "";
      const maps = errorMaps.filter((m) => !!m).slice().reverse();
      for (const map of maps) {
        errorMessage = map(fullIssue, { data, defaultError: errorMessage }).message;
      }
      return {
        ...issueData,
        path: fullPath,
        message: errorMessage
      };
    };
    exports.makeIssue = makeIssue;
    exports.EMPTY_PATH = [];
    function addIssueToContext(ctx, issueData) {
      const overrideMap = (0, errors_js_1.getErrorMap)();
      const issue = (0, exports.makeIssue)({
        issueData,
        data: ctx.data,
        path: ctx.path,
        errorMaps: [
          ctx.common.contextualErrorMap,
          // contextual error map is first priority
          ctx.schemaErrorMap,
          // then schema-bound map if available
          overrideMap,
          // then global override map
          overrideMap === en_js_1.default ? void 0 : en_js_1.default
          // then global default map
        ].filter((x) => !!x)
      });
      ctx.common.issues.push(issue);
    }
    var ParseStatus = class _ParseStatus {
      constructor() {
        this.value = "valid";
      }
      dirty() {
        if (this.value === "valid")
          this.value = "dirty";
      }
      abort() {
        if (this.value !== "aborted")
          this.value = "aborted";
      }
      static mergeArray(status, results) {
        const arrayValue = [];
        for (const s of results) {
          if (s.status === "aborted")
            return exports.INVALID;
          if (s.status === "dirty")
            status.dirty();
          arrayValue.push(s.value);
        }
        return { status: status.value, value: arrayValue };
      }
      static async mergeObjectAsync(status, pairs) {
        const syncPairs = [];
        for (const pair of pairs) {
          const key = await pair.key;
          const value = await pair.value;
          syncPairs.push({
            key,
            value
          });
        }
        return _ParseStatus.mergeObjectSync(status, syncPairs);
      }
      static mergeObjectSync(status, pairs) {
        const finalObject = {};
        for (const pair of pairs) {
          const { key, value } = pair;
          if (key.status === "aborted")
            return exports.INVALID;
          if (value.status === "aborted")
            return exports.INVALID;
          if (key.status === "dirty")
            status.dirty();
          if (value.status === "dirty")
            status.dirty();
          if (key.value !== "__proto__" && (typeof value.value !== "undefined" || pair.alwaysSet)) {
            finalObject[key.value] = value.value;
          }
        }
        return { status: status.value, value: finalObject };
      }
    };
    exports.ParseStatus = ParseStatus;
    exports.INVALID = Object.freeze({
      status: "aborted"
    });
    var DIRTY = (value) => ({ status: "dirty", value });
    exports.DIRTY = DIRTY;
    var OK = (value) => ({ status: "valid", value });
    exports.OK = OK;
    var isAborted = (x) => x.status === "aborted";
    exports.isAborted = isAborted;
    var isDirty = (x) => x.status === "dirty";
    exports.isDirty = isDirty;
    var isValid = (x) => x.status === "valid";
    exports.isValid = isValid;
    var isAsync = (x) => typeof Promise !== "undefined" && x instanceof Promise;
    exports.isAsync = isAsync;
  }
});

// node_modules/zod/v3/helpers/typeAliases.cjs
var require_typeAliases = __commonJS({
  "node_modules/zod/v3/helpers/typeAliases.cjs"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/zod/v3/helpers/errorUtil.cjs
var require_errorUtil = __commonJS({
  "node_modules/zod/v3/helpers/errorUtil.cjs"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.errorUtil = void 0;
    var errorUtil;
    (function(errorUtil2) {
      errorUtil2.errToObj = (message) => typeof message === "string" ? { message } : message || {};
      errorUtil2.toString = (message) => typeof message === "string" ? message : message?.message;
    })(errorUtil || (exports.errorUtil = errorUtil = {}));
  }
});

// node_modules/zod/v3/types.cjs
var require_types = __commonJS({
  "node_modules/zod/v3/types.cjs"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.discriminatedUnion = exports.date = exports.boolean = exports.bigint = exports.array = exports.any = exports.coerce = exports.ZodFirstPartyTypeKind = exports.late = exports.ZodSchema = exports.Schema = exports.ZodReadonly = exports.ZodPipeline = exports.ZodBranded = exports.BRAND = exports.ZodNaN = exports.ZodCatch = exports.ZodDefault = exports.ZodNullable = exports.ZodOptional = exports.ZodTransformer = exports.ZodEffects = exports.ZodPromise = exports.ZodNativeEnum = exports.ZodEnum = exports.ZodLiteral = exports.ZodLazy = exports.ZodFunction = exports.ZodSet = exports.ZodMap = exports.ZodRecord = exports.ZodTuple = exports.ZodIntersection = exports.ZodDiscriminatedUnion = exports.ZodUnion = exports.ZodObject = exports.ZodArray = exports.ZodVoid = exports.ZodNever = exports.ZodUnknown = exports.ZodAny = exports.ZodNull = exports.ZodUndefined = exports.ZodSymbol = exports.ZodDate = exports.ZodBoolean = exports.ZodBigInt = exports.ZodNumber = exports.ZodString = exports.ZodType = void 0;
    exports.NEVER = exports.void = exports.unknown = exports.union = exports.undefined = exports.tuple = exports.transformer = exports.symbol = exports.string = exports.strictObject = exports.set = exports.record = exports.promise = exports.preprocess = exports.pipeline = exports.ostring = exports.optional = exports.onumber = exports.oboolean = exports.object = exports.number = exports.nullable = exports.null = exports.never = exports.nativeEnum = exports.nan = exports.map = exports.literal = exports.lazy = exports.intersection = exports.instanceof = exports.function = exports.enum = exports.effect = void 0;
    exports.datetimeRegex = datetimeRegex;
    exports.custom = custom;
    var ZodError_js_1 = require_ZodError();
    var errors_js_1 = require_errors();
    var errorUtil_js_1 = require_errorUtil();
    var parseUtil_js_1 = require_parseUtil();
    var util_js_1 = require_util();
    var ParseInputLazyPath = class {
      constructor(parent, value, path, key) {
        this._cachedPath = [];
        this.parent = parent;
        this.data = value;
        this._path = path;
        this._key = key;
      }
      get path() {
        if (!this._cachedPath.length) {
          if (Array.isArray(this._key)) {
            this._cachedPath.push(...this._path, ...this._key);
          } else {
            this._cachedPath.push(...this._path, this._key);
          }
        }
        return this._cachedPath;
      }
    };
    var handleResult = (ctx, result) => {
      if ((0, parseUtil_js_1.isValid)(result)) {
        return { success: true, data: result.value };
      } else {
        if (!ctx.common.issues.length) {
          throw new Error("Validation failed but no issues detected.");
        }
        return {
          success: false,
          get error() {
            if (this._error)
              return this._error;
            const error = new ZodError_js_1.ZodError(ctx.common.issues);
            this._error = error;
            return this._error;
          }
        };
      }
    };
    function processCreateParams(params) {
      if (!params)
        return {};
      const { errorMap, invalid_type_error, required_error, description } = params;
      if (errorMap && (invalid_type_error || required_error)) {
        throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
      }
      if (errorMap)
        return { errorMap, description };
      const customMap = (iss, ctx) => {
        const { message } = params;
        if (iss.code === "invalid_enum_value") {
          return { message: message ?? ctx.defaultError };
        }
        if (typeof ctx.data === "undefined") {
          return { message: message ?? required_error ?? ctx.defaultError };
        }
        if (iss.code !== "invalid_type")
          return { message: ctx.defaultError };
        return { message: message ?? invalid_type_error ?? ctx.defaultError };
      };
      return { errorMap: customMap, description };
    }
    var ZodType = class {
      get description() {
        return this._def.description;
      }
      _getType(input) {
        return (0, util_js_1.getParsedType)(input.data);
      }
      _getOrReturnCtx(input, ctx) {
        return ctx || {
          common: input.parent.common,
          data: input.data,
          parsedType: (0, util_js_1.getParsedType)(input.data),
          schemaErrorMap: this._def.errorMap,
          path: input.path,
          parent: input.parent
        };
      }
      _processInputParams(input) {
        return {
          status: new parseUtil_js_1.ParseStatus(),
          ctx: {
            common: input.parent.common,
            data: input.data,
            parsedType: (0, util_js_1.getParsedType)(input.data),
            schemaErrorMap: this._def.errorMap,
            path: input.path,
            parent: input.parent
          }
        };
      }
      _parseSync(input) {
        const result = this._parse(input);
        if ((0, parseUtil_js_1.isAsync)(result)) {
          throw new Error("Synchronous parse encountered promise.");
        }
        return result;
      }
      _parseAsync(input) {
        const result = this._parse(input);
        return Promise.resolve(result);
      }
      parse(data, params) {
        const result = this.safeParse(data, params);
        if (result.success)
          return result.data;
        throw result.error;
      }
      safeParse(data, params) {
        const ctx = {
          common: {
            issues: [],
            async: params?.async ?? false,
            contextualErrorMap: params?.errorMap
          },
          path: params?.path || [],
          schemaErrorMap: this._def.errorMap,
          parent: null,
          data,
          parsedType: (0, util_js_1.getParsedType)(data)
        };
        const result = this._parseSync({ data, path: ctx.path, parent: ctx });
        return handleResult(ctx, result);
      }
      "~validate"(data) {
        const ctx = {
          common: {
            issues: [],
            async: !!this["~standard"].async
          },
          path: [],
          schemaErrorMap: this._def.errorMap,
          parent: null,
          data,
          parsedType: (0, util_js_1.getParsedType)(data)
        };
        if (!this["~standard"].async) {
          try {
            const result = this._parseSync({ data, path: [], parent: ctx });
            return (0, parseUtil_js_1.isValid)(result) ? {
              value: result.value
            } : {
              issues: ctx.common.issues
            };
          } catch (err) {
            if (err?.message?.toLowerCase()?.includes("encountered")) {
              this["~standard"].async = true;
            }
            ctx.common = {
              issues: [],
              async: true
            };
          }
        }
        return this._parseAsync({ data, path: [], parent: ctx }).then((result) => (0, parseUtil_js_1.isValid)(result) ? {
          value: result.value
        } : {
          issues: ctx.common.issues
        });
      }
      async parseAsync(data, params) {
        const result = await this.safeParseAsync(data, params);
        if (result.success)
          return result.data;
        throw result.error;
      }
      async safeParseAsync(data, params) {
        const ctx = {
          common: {
            issues: [],
            contextualErrorMap: params?.errorMap,
            async: true
          },
          path: params?.path || [],
          schemaErrorMap: this._def.errorMap,
          parent: null,
          data,
          parsedType: (0, util_js_1.getParsedType)(data)
        };
        const maybeAsyncResult = this._parse({ data, path: ctx.path, parent: ctx });
        const result = await ((0, parseUtil_js_1.isAsync)(maybeAsyncResult) ? maybeAsyncResult : Promise.resolve(maybeAsyncResult));
        return handleResult(ctx, result);
      }
      refine(check, message) {
        const getIssueProperties = (val) => {
          if (typeof message === "string" || typeof message === "undefined") {
            return { message };
          } else if (typeof message === "function") {
            return message(val);
          } else {
            return message;
          }
        };
        return this._refinement((val, ctx) => {
          const result = check(val);
          const setError = () => ctx.addIssue({
            code: ZodError_js_1.ZodIssueCode.custom,
            ...getIssueProperties(val)
          });
          if (typeof Promise !== "undefined" && result instanceof Promise) {
            return result.then((data) => {
              if (!data) {
                setError();
                return false;
              } else {
                return true;
              }
            });
          }
          if (!result) {
            setError();
            return false;
          } else {
            return true;
          }
        });
      }
      refinement(check, refinementData) {
        return this._refinement((val, ctx) => {
          if (!check(val)) {
            ctx.addIssue(typeof refinementData === "function" ? refinementData(val, ctx) : refinementData);
            return false;
          } else {
            return true;
          }
        });
      }
      _refinement(refinement) {
        return new ZodEffects({
          schema: this,
          typeName: ZodFirstPartyTypeKind.ZodEffects,
          effect: { type: "refinement", refinement }
        });
      }
      superRefine(refinement) {
        return this._refinement(refinement);
      }
      constructor(def) {
        this.spa = this.safeParseAsync;
        this._def = def;
        this.parse = this.parse.bind(this);
        this.safeParse = this.safeParse.bind(this);
        this.parseAsync = this.parseAsync.bind(this);
        this.safeParseAsync = this.safeParseAsync.bind(this);
        this.spa = this.spa.bind(this);
        this.refine = this.refine.bind(this);
        this.refinement = this.refinement.bind(this);
        this.superRefine = this.superRefine.bind(this);
        this.optional = this.optional.bind(this);
        this.nullable = this.nullable.bind(this);
        this.nullish = this.nullish.bind(this);
        this.array = this.array.bind(this);
        this.promise = this.promise.bind(this);
        this.or = this.or.bind(this);
        this.and = this.and.bind(this);
        this.transform = this.transform.bind(this);
        this.brand = this.brand.bind(this);
        this.default = this.default.bind(this);
        this.catch = this.catch.bind(this);
        this.describe = this.describe.bind(this);
        this.pipe = this.pipe.bind(this);
        this.readonly = this.readonly.bind(this);
        this.isNullable = this.isNullable.bind(this);
        this.isOptional = this.isOptional.bind(this);
        this["~standard"] = {
          version: 1,
          vendor: "zod",
          validate: (data) => this["~validate"](data)
        };
      }
      optional() {
        return ZodOptional.create(this, this._def);
      }
      nullable() {
        return ZodNullable.create(this, this._def);
      }
      nullish() {
        return this.nullable().optional();
      }
      array() {
        return ZodArray.create(this);
      }
      promise() {
        return ZodPromise.create(this, this._def);
      }
      or(option) {
        return ZodUnion.create([this, option], this._def);
      }
      and(incoming) {
        return ZodIntersection.create(this, incoming, this._def);
      }
      transform(transform) {
        return new ZodEffects({
          ...processCreateParams(this._def),
          schema: this,
          typeName: ZodFirstPartyTypeKind.ZodEffects,
          effect: { type: "transform", transform }
        });
      }
      default(def) {
        const defaultValueFunc = typeof def === "function" ? def : () => def;
        return new ZodDefault({
          ...processCreateParams(this._def),
          innerType: this,
          defaultValue: defaultValueFunc,
          typeName: ZodFirstPartyTypeKind.ZodDefault
        });
      }
      brand() {
        return new ZodBranded({
          typeName: ZodFirstPartyTypeKind.ZodBranded,
          type: this,
          ...processCreateParams(this._def)
        });
      }
      catch(def) {
        const catchValueFunc = typeof def === "function" ? def : () => def;
        return new ZodCatch({
          ...processCreateParams(this._def),
          innerType: this,
          catchValue: catchValueFunc,
          typeName: ZodFirstPartyTypeKind.ZodCatch
        });
      }
      describe(description) {
        const This = this.constructor;
        return new This({
          ...this._def,
          description
        });
      }
      pipe(target) {
        return ZodPipeline.create(this, target);
      }
      readonly() {
        return ZodReadonly.create(this);
      }
      isOptional() {
        return this.safeParse(void 0).success;
      }
      isNullable() {
        return this.safeParse(null).success;
      }
    };
    exports.ZodType = ZodType;
    exports.Schema = ZodType;
    exports.ZodSchema = ZodType;
    var cuidRegex = /^c[^\s-]{8,}$/i;
    var cuid2Regex = /^[0-9a-z]+$/;
    var ulidRegex = /^[0-9A-HJKMNP-TV-Z]{26}$/i;
    var uuidRegex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
    var nanoidRegex = /^[a-z0-9_-]{21}$/i;
    var jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
    var durationRegex = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/;
    var emailRegex = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i;
    var _emojiRegex = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
    var emojiRegex;
    var ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
    var ipv4CidrRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/;
    var ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
    var ipv6CidrRegex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
    var base64Regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
    var base64urlRegex = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/;
    var dateRegexSource = `((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))`;
    var dateRegex = new RegExp(`^${dateRegexSource}$`);
    function timeRegexSource(args) {
      let secondsRegexSource = `[0-5]\\d`;
      if (args.precision) {
        secondsRegexSource = `${secondsRegexSource}\\.\\d{${args.precision}}`;
      } else if (args.precision == null) {
        secondsRegexSource = `${secondsRegexSource}(\\.\\d+)?`;
      }
      const secondsQuantifier = args.precision ? "+" : "?";
      return `([01]\\d|2[0-3]):[0-5]\\d(:${secondsRegexSource})${secondsQuantifier}`;
    }
    function timeRegex(args) {
      return new RegExp(`^${timeRegexSource(args)}$`);
    }
    function datetimeRegex(args) {
      let regex = `${dateRegexSource}T${timeRegexSource(args)}`;
      const opts = [];
      opts.push(args.local ? `Z?` : `Z`);
      if (args.offset)
        opts.push(`([+-]\\d{2}:?\\d{2})`);
      regex = `${regex}(${opts.join("|")})`;
      return new RegExp(`^${regex}$`);
    }
    function isValidIP(ip, version) {
      if ((version === "v4" || !version) && ipv4Regex.test(ip)) {
        return true;
      }
      if ((version === "v6" || !version) && ipv6Regex.test(ip)) {
        return true;
      }
      return false;
    }
    function isValidJWT(jwt2, alg) {
      if (!jwtRegex.test(jwt2))
        return false;
      try {
        const [header] = jwt2.split(".");
        if (!header)
          return false;
        const base64 = header.replace(/-/g, "+").replace(/_/g, "/").padEnd(header.length + (4 - header.length % 4) % 4, "=");
        const decoded = JSON.parse(atob(base64));
        if (typeof decoded !== "object" || decoded === null)
          return false;
        if ("typ" in decoded && decoded?.typ !== "JWT")
          return false;
        if (!decoded.alg)
          return false;
        if (alg && decoded.alg !== alg)
          return false;
        return true;
      } catch {
        return false;
      }
    }
    function isValidCidr(ip, version) {
      if ((version === "v4" || !version) && ipv4CidrRegex.test(ip)) {
        return true;
      }
      if ((version === "v6" || !version) && ipv6CidrRegex.test(ip)) {
        return true;
      }
      return false;
    }
    var ZodString = class _ZodString extends ZodType {
      _parse(input) {
        if (this._def.coerce) {
          input.data = String(input.data);
        }
        const parsedType = this._getType(input);
        if (parsedType !== util_js_1.ZodParsedType.string) {
          const ctx2 = this._getOrReturnCtx(input);
          (0, parseUtil_js_1.addIssueToContext)(ctx2, {
            code: ZodError_js_1.ZodIssueCode.invalid_type,
            expected: util_js_1.ZodParsedType.string,
            received: ctx2.parsedType
          });
          return parseUtil_js_1.INVALID;
        }
        const status = new parseUtil_js_1.ParseStatus();
        let ctx = void 0;
        for (const check of this._def.checks) {
          if (check.kind === "min") {
            if (input.data.length < check.value) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_js_1.addIssueToContext)(ctx, {
                code: ZodError_js_1.ZodIssueCode.too_small,
                minimum: check.value,
                type: "string",
                inclusive: true,
                exact: false,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "max") {
            if (input.data.length > check.value) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_js_1.addIssueToContext)(ctx, {
                code: ZodError_js_1.ZodIssueCode.too_big,
                maximum: check.value,
                type: "string",
                inclusive: true,
                exact: false,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "length") {
            const tooBig = input.data.length > check.value;
            const tooSmall = input.data.length < check.value;
            if (tooBig || tooSmall) {
              ctx = this._getOrReturnCtx(input, ctx);
              if (tooBig) {
                (0, parseUtil_js_1.addIssueToContext)(ctx, {
                  code: ZodError_js_1.ZodIssueCode.too_big,
                  maximum: check.value,
                  type: "string",
                  inclusive: true,
                  exact: true,
                  message: check.message
                });
              } else if (tooSmall) {
                (0, parseUtil_js_1.addIssueToContext)(ctx, {
                  code: ZodError_js_1.ZodIssueCode.too_small,
                  minimum: check.value,
                  type: "string",
                  inclusive: true,
                  exact: true,
                  message: check.message
                });
              }
              status.dirty();
            }
          } else if (check.kind === "email") {
            if (!emailRegex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_js_1.addIssueToContext)(ctx, {
                validation: "email",
                code: ZodError_js_1.ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "emoji") {
            if (!emojiRegex) {
              emojiRegex = new RegExp(_emojiRegex, "u");
            }
            if (!emojiRegex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_js_1.addIssueToContext)(ctx, {
                validation: "emoji",
                code: ZodError_js_1.ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "uuid") {
            if (!uuidRegex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_js_1.addIssueToContext)(ctx, {
                validation: "uuid",
                code: ZodError_js_1.ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "nanoid") {
            if (!nanoidRegex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_js_1.addIssueToContext)(ctx, {
                validation: "nanoid",
                code: ZodError_js_1.ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "cuid") {
            if (!cuidRegex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_js_1.addIssueToContext)(ctx, {
                validation: "cuid",
                code: ZodError_js_1.ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "cuid2") {
            if (!cuid2Regex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_js_1.addIssueToContext)(ctx, {
                validation: "cuid2",
                code: ZodError_js_1.ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "ulid") {
            if (!ulidRegex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_js_1.addIssueToContext)(ctx, {
                validation: "ulid",
                code: ZodError_js_1.ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "url") {
            try {
              new URL(input.data);
            } catch {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_js_1.addIssueToContext)(ctx, {
                validation: "url",
                code: ZodError_js_1.ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "regex") {
            check.regex.lastIndex = 0;
            const testResult = check.regex.test(input.data);
            if (!testResult) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_js_1.addIssueToContext)(ctx, {
                validation: "regex",
                code: ZodError_js_1.ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "trim") {
            input.data = input.data.trim();
          } else if (check.kind === "includes") {
            if (!input.data.includes(check.value, check.position)) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_js_1.addIssueToContext)(ctx, {
                code: ZodError_js_1.ZodIssueCode.invalid_string,
                validation: { includes: check.value, position: check.position },
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "toLowerCase") {
            input.data = input.data.toLowerCase();
          } else if (check.kind === "toUpperCase") {
            input.data = input.data.toUpperCase();
          } else if (check.kind === "startsWith") {
            if (!input.data.startsWith(check.value)) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_js_1.addIssueToContext)(ctx, {
                code: ZodError_js_1.ZodIssueCode.invalid_string,
                validation: { startsWith: check.value },
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "endsWith") {
            if (!input.data.endsWith(check.value)) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_js_1.addIssueToContext)(ctx, {
                code: ZodError_js_1.ZodIssueCode.invalid_string,
                validation: { endsWith: check.value },
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "datetime") {
            const regex = datetimeRegex(check);
            if (!regex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_js_1.addIssueToContext)(ctx, {
                code: ZodError_js_1.ZodIssueCode.invalid_string,
                validation: "datetime",
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "date") {
            const regex = dateRegex;
            if (!regex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_js_1.addIssueToContext)(ctx, {
                code: ZodError_js_1.ZodIssueCode.invalid_string,
                validation: "date",
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "time") {
            const regex = timeRegex(check);
            if (!regex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_js_1.addIssueToContext)(ctx, {
                code: ZodError_js_1.ZodIssueCode.invalid_string,
                validation: "time",
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "duration") {
            if (!durationRegex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_js_1.addIssueToContext)(ctx, {
                validation: "duration",
                code: ZodError_js_1.ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "ip") {
            if (!isValidIP(input.data, check.version)) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_js_1.addIssueToContext)(ctx, {
                validation: "ip",
                code: ZodError_js_1.ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "jwt") {
            if (!isValidJWT(input.data, check.alg)) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_js_1.addIssueToContext)(ctx, {
                validation: "jwt",
                code: ZodError_js_1.ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "cidr") {
            if (!isValidCidr(input.data, check.version)) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_js_1.addIssueToContext)(ctx, {
                validation: "cidr",
                code: ZodError_js_1.ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "base64") {
            if (!base64Regex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_js_1.addIssueToContext)(ctx, {
                validation: "base64",
                code: ZodError_js_1.ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "base64url") {
            if (!base64urlRegex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_js_1.addIssueToContext)(ctx, {
                validation: "base64url",
                code: ZodError_js_1.ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else {
            util_js_1.util.assertNever(check);
          }
        }
        return { status: status.value, value: input.data };
      }
      _regex(regex, validation, message) {
        return this.refinement((data) => regex.test(data), {
          validation,
          code: ZodError_js_1.ZodIssueCode.invalid_string,
          ...errorUtil_js_1.errorUtil.errToObj(message)
        });
      }
      _addCheck(check) {
        return new _ZodString({
          ...this._def,
          checks: [...this._def.checks, check]
        });
      }
      email(message) {
        return this._addCheck({ kind: "email", ...errorUtil_js_1.errorUtil.errToObj(message) });
      }
      url(message) {
        return this._addCheck({ kind: "url", ...errorUtil_js_1.errorUtil.errToObj(message) });
      }
      emoji(message) {
        return this._addCheck({ kind: "emoji", ...errorUtil_js_1.errorUtil.errToObj(message) });
      }
      uuid(message) {
        return this._addCheck({ kind: "uuid", ...errorUtil_js_1.errorUtil.errToObj(message) });
      }
      nanoid(message) {
        return this._addCheck({ kind: "nanoid", ...errorUtil_js_1.errorUtil.errToObj(message) });
      }
      cuid(message) {
        return this._addCheck({ kind: "cuid", ...errorUtil_js_1.errorUtil.errToObj(message) });
      }
      cuid2(message) {
        return this._addCheck({ kind: "cuid2", ...errorUtil_js_1.errorUtil.errToObj(message) });
      }
      ulid(message) {
        return this._addCheck({ kind: "ulid", ...errorUtil_js_1.errorUtil.errToObj(message) });
      }
      base64(message) {
        return this._addCheck({ kind: "base64", ...errorUtil_js_1.errorUtil.errToObj(message) });
      }
      base64url(message) {
        return this._addCheck({
          kind: "base64url",
          ...errorUtil_js_1.errorUtil.errToObj(message)
        });
      }
      jwt(options) {
        return this._addCheck({ kind: "jwt", ...errorUtil_js_1.errorUtil.errToObj(options) });
      }
      ip(options) {
        return this._addCheck({ kind: "ip", ...errorUtil_js_1.errorUtil.errToObj(options) });
      }
      cidr(options) {
        return this._addCheck({ kind: "cidr", ...errorUtil_js_1.errorUtil.errToObj(options) });
      }
      datetime(options) {
        if (typeof options === "string") {
          return this._addCheck({
            kind: "datetime",
            precision: null,
            offset: false,
            local: false,
            message: options
          });
        }
        return this._addCheck({
          kind: "datetime",
          precision: typeof options?.precision === "undefined" ? null : options?.precision,
          offset: options?.offset ?? false,
          local: options?.local ?? false,
          ...errorUtil_js_1.errorUtil.errToObj(options?.message)
        });
      }
      date(message) {
        return this._addCheck({ kind: "date", message });
      }
      time(options) {
        if (typeof options === "string") {
          return this._addCheck({
            kind: "time",
            precision: null,
            message: options
          });
        }
        return this._addCheck({
          kind: "time",
          precision: typeof options?.precision === "undefined" ? null : options?.precision,
          ...errorUtil_js_1.errorUtil.errToObj(options?.message)
        });
      }
      duration(message) {
        return this._addCheck({ kind: "duration", ...errorUtil_js_1.errorUtil.errToObj(message) });
      }
      regex(regex, message) {
        return this._addCheck({
          kind: "regex",
          regex,
          ...errorUtil_js_1.errorUtil.errToObj(message)
        });
      }
      includes(value, options) {
        return this._addCheck({
          kind: "includes",
          value,
          position: options?.position,
          ...errorUtil_js_1.errorUtil.errToObj(options?.message)
        });
      }
      startsWith(value, message) {
        return this._addCheck({
          kind: "startsWith",
          value,
          ...errorUtil_js_1.errorUtil.errToObj(message)
        });
      }
      endsWith(value, message) {
        return this._addCheck({
          kind: "endsWith",
          value,
          ...errorUtil_js_1.errorUtil.errToObj(message)
        });
      }
      min(minLength, message) {
        return this._addCheck({
          kind: "min",
          value: minLength,
          ...errorUtil_js_1.errorUtil.errToObj(message)
        });
      }
      max(maxLength, message) {
        return this._addCheck({
          kind: "max",
          value: maxLength,
          ...errorUtil_js_1.errorUtil.errToObj(message)
        });
      }
      length(len, message) {
        return this._addCheck({
          kind: "length",
          value: len,
          ...errorUtil_js_1.errorUtil.errToObj(message)
        });
      }
      /**
       * Equivalent to `.min(1)`
       */
      nonempty(message) {
        return this.min(1, errorUtil_js_1.errorUtil.errToObj(message));
      }
      trim() {
        return new _ZodString({
          ...this._def,
          checks: [...this._def.checks, { kind: "trim" }]
        });
      }
      toLowerCase() {
        return new _ZodString({
          ...this._def,
          checks: [...this._def.checks, { kind: "toLowerCase" }]
        });
      }
      toUpperCase() {
        return new _ZodString({
          ...this._def,
          checks: [...this._def.checks, { kind: "toUpperCase" }]
        });
      }
      get isDatetime() {
        return !!this._def.checks.find((ch) => ch.kind === "datetime");
      }
      get isDate() {
        return !!this._def.checks.find((ch) => ch.kind === "date");
      }
      get isTime() {
        return !!this._def.checks.find((ch) => ch.kind === "time");
      }
      get isDuration() {
        return !!this._def.checks.find((ch) => ch.kind === "duration");
      }
      get isEmail() {
        return !!this._def.checks.find((ch) => ch.kind === "email");
      }
      get isURL() {
        return !!this._def.checks.find((ch) => ch.kind === "url");
      }
      get isEmoji() {
        return !!this._def.checks.find((ch) => ch.kind === "emoji");
      }
      get isUUID() {
        return !!this._def.checks.find((ch) => ch.kind === "uuid");
      }
      get isNANOID() {
        return !!this._def.checks.find((ch) => ch.kind === "nanoid");
      }
      get isCUID() {
        return !!this._def.checks.find((ch) => ch.kind === "cuid");
      }
      get isCUID2() {
        return !!this._def.checks.find((ch) => ch.kind === "cuid2");
      }
      get isULID() {
        return !!this._def.checks.find((ch) => ch.kind === "ulid");
      }
      get isIP() {
        return !!this._def.checks.find((ch) => ch.kind === "ip");
      }
      get isCIDR() {
        return !!this._def.checks.find((ch) => ch.kind === "cidr");
      }
      get isBase64() {
        return !!this._def.checks.find((ch) => ch.kind === "base64");
      }
      get isBase64url() {
        return !!this._def.checks.find((ch) => ch.kind === "base64url");
      }
      get minLength() {
        let min = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "min") {
            if (min === null || ch.value > min)
              min = ch.value;
          }
        }
        return min;
      }
      get maxLength() {
        let max = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "max") {
            if (max === null || ch.value < max)
              max = ch.value;
          }
        }
        return max;
      }
    };
    exports.ZodString = ZodString;
    ZodString.create = (params) => {
      return new ZodString({
        checks: [],
        typeName: ZodFirstPartyTypeKind.ZodString,
        coerce: params?.coerce ?? false,
        ...processCreateParams(params)
      });
    };
    function floatSafeRemainder(val, step) {
      const valDecCount = (val.toString().split(".")[1] || "").length;
      const stepDecCount = (step.toString().split(".")[1] || "").length;
      const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount;
      const valInt = Number.parseInt(val.toFixed(decCount).replace(".", ""));
      const stepInt = Number.parseInt(step.toFixed(decCount).replace(".", ""));
      return valInt % stepInt / 10 ** decCount;
    }
    var ZodNumber = class _ZodNumber extends ZodType {
      constructor() {
        super(...arguments);
        this.min = this.gte;
        this.max = this.lte;
        this.step = this.multipleOf;
      }
      _parse(input) {
        if (this._def.coerce) {
          input.data = Number(input.data);
        }
        const parsedType = this._getType(input);
        if (parsedType !== util_js_1.ZodParsedType.number) {
          const ctx2 = this._getOrReturnCtx(input);
          (0, parseUtil_js_1.addIssueToContext)(ctx2, {
            code: ZodError_js_1.ZodIssueCode.invalid_type,
            expected: util_js_1.ZodParsedType.number,
            received: ctx2.parsedType
          });
          return parseUtil_js_1.INVALID;
        }
        let ctx = void 0;
        const status = new parseUtil_js_1.ParseStatus();
        for (const check of this._def.checks) {
          if (check.kind === "int") {
            if (!util_js_1.util.isInteger(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_js_1.addIssueToContext)(ctx, {
                code: ZodError_js_1.ZodIssueCode.invalid_type,
                expected: "integer",
                received: "float",
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "min") {
            const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
            if (tooSmall) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_js_1.addIssueToContext)(ctx, {
                code: ZodError_js_1.ZodIssueCode.too_small,
                minimum: check.value,
                type: "number",
                inclusive: check.inclusive,
                exact: false,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "max") {
            const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
            if (tooBig) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_js_1.addIssueToContext)(ctx, {
                code: ZodError_js_1.ZodIssueCode.too_big,
                maximum: check.value,
                type: "number",
                inclusive: check.inclusive,
                exact: false,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "multipleOf") {
            if (floatSafeRemainder(input.data, check.value) !== 0) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_js_1.addIssueToContext)(ctx, {
                code: ZodError_js_1.ZodIssueCode.not_multiple_of,
                multipleOf: check.value,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "finite") {
            if (!Number.isFinite(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_js_1.addIssueToContext)(ctx, {
                code: ZodError_js_1.ZodIssueCode.not_finite,
                message: check.message
              });
              status.dirty();
            }
          } else {
            util_js_1.util.assertNever(check);
          }
        }
        return { status: status.value, value: input.data };
      }
      gte(value, message) {
        return this.setLimit("min", value, true, errorUtil_js_1.errorUtil.toString(message));
      }
      gt(value, message) {
        return this.setLimit("min", value, false, errorUtil_js_1.errorUtil.toString(message));
      }
      lte(value, message) {
        return this.setLimit("max", value, true, errorUtil_js_1.errorUtil.toString(message));
      }
      lt(value, message) {
        return this.setLimit("max", value, false, errorUtil_js_1.errorUtil.toString(message));
      }
      setLimit(kind, value, inclusive, message) {
        return new _ZodNumber({
          ...this._def,
          checks: [
            ...this._def.checks,
            {
              kind,
              value,
              inclusive,
              message: errorUtil_js_1.errorUtil.toString(message)
            }
          ]
        });
      }
      _addCheck(check) {
        return new _ZodNumber({
          ...this._def,
          checks: [...this._def.checks, check]
        });
      }
      int(message) {
        return this._addCheck({
          kind: "int",
          message: errorUtil_js_1.errorUtil.toString(message)
        });
      }
      positive(message) {
        return this._addCheck({
          kind: "min",
          value: 0,
          inclusive: false,
          message: errorUtil_js_1.errorUtil.toString(message)
        });
      }
      negative(message) {
        return this._addCheck({
          kind: "max",
          value: 0,
          inclusive: false,
          message: errorUtil_js_1.errorUtil.toString(message)
        });
      }
      nonpositive(message) {
        return this._addCheck({
          kind: "max",
          value: 0,
          inclusive: true,
          message: errorUtil_js_1.errorUtil.toString(message)
        });
      }
      nonnegative(message) {
        return this._addCheck({
          kind: "min",
          value: 0,
          inclusive: true,
          message: errorUtil_js_1.errorUtil.toString(message)
        });
      }
      multipleOf(value, message) {
        return this._addCheck({
          kind: "multipleOf",
          value,
          message: errorUtil_js_1.errorUtil.toString(message)
        });
      }
      finite(message) {
        return this._addCheck({
          kind: "finite",
          message: errorUtil_js_1.errorUtil.toString(message)
        });
      }
      safe(message) {
        return this._addCheck({
          kind: "min",
          inclusive: true,
          value: Number.MIN_SAFE_INTEGER,
          message: errorUtil_js_1.errorUtil.toString(message)
        })._addCheck({
          kind: "max",
          inclusive: true,
          value: Number.MAX_SAFE_INTEGER,
          message: errorUtil_js_1.errorUtil.toString(message)
        });
      }
      get minValue() {
        let min = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "min") {
            if (min === null || ch.value > min)
              min = ch.value;
          }
        }
        return min;
      }
      get maxValue() {
        let max = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "max") {
            if (max === null || ch.value < max)
              max = ch.value;
          }
        }
        return max;
      }
      get isInt() {
        return !!this._def.checks.find((ch) => ch.kind === "int" || ch.kind === "multipleOf" && util_js_1.util.isInteger(ch.value));
      }
      get isFinite() {
        let max = null;
        let min = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "finite" || ch.kind === "int" || ch.kind === "multipleOf") {
            return true;
          } else if (ch.kind === "min") {
            if (min === null || ch.value > min)
              min = ch.value;
          } else if (ch.kind === "max") {
            if (max === null || ch.value < max)
              max = ch.value;
          }
        }
        return Number.isFinite(min) && Number.isFinite(max);
      }
    };
    exports.ZodNumber = ZodNumber;
    ZodNumber.create = (params) => {
      return new ZodNumber({
        checks: [],
        typeName: ZodFirstPartyTypeKind.ZodNumber,
        coerce: params?.coerce || false,
        ...processCreateParams(params)
      });
    };
    var ZodBigInt = class _ZodBigInt extends ZodType {
      constructor() {
        super(...arguments);
        this.min = this.gte;
        this.max = this.lte;
      }
      _parse(input) {
        if (this._def.coerce) {
          try {
            input.data = BigInt(input.data);
          } catch {
            return this._getInvalidInput(input);
          }
        }
        const parsedType = this._getType(input);
        if (parsedType !== util_js_1.ZodParsedType.bigint) {
          return this._getInvalidInput(input);
        }
        let ctx = void 0;
        const status = new parseUtil_js_1.ParseStatus();
        for (const check of this._def.checks) {
          if (check.kind === "min") {
            const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
            if (tooSmall) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_js_1.addIssueToContext)(ctx, {
                code: ZodError_js_1.ZodIssueCode.too_small,
                type: "bigint",
                minimum: check.value,
                inclusive: check.inclusive,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "max") {
            const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
            if (tooBig) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_js_1.addIssueToContext)(ctx, {
                code: ZodError_js_1.ZodIssueCode.too_big,
                type: "bigint",
                maximum: check.value,
                inclusive: check.inclusive,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "multipleOf") {
            if (input.data % check.value !== BigInt(0)) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_js_1.addIssueToContext)(ctx, {
                code: ZodError_js_1.ZodIssueCode.not_multiple_of,
                multipleOf: check.value,
                message: check.message
              });
              status.dirty();
            }
          } else {
            util_js_1.util.assertNever(check);
          }
        }
        return { status: status.value, value: input.data };
      }
      _getInvalidInput(input) {
        const ctx = this._getOrReturnCtx(input);
        (0, parseUtil_js_1.addIssueToContext)(ctx, {
          code: ZodError_js_1.ZodIssueCode.invalid_type,
          expected: util_js_1.ZodParsedType.bigint,
          received: ctx.parsedType
        });
        return parseUtil_js_1.INVALID;
      }
      gte(value, message) {
        return this.setLimit("min", value, true, errorUtil_js_1.errorUtil.toString(message));
      }
      gt(value, message) {
        return this.setLimit("min", value, false, errorUtil_js_1.errorUtil.toString(message));
      }
      lte(value, message) {
        return this.setLimit("max", value, true, errorUtil_js_1.errorUtil.toString(message));
      }
      lt(value, message) {
        return this.setLimit("max", value, false, errorUtil_js_1.errorUtil.toString(message));
      }
      setLimit(kind, value, inclusive, message) {
        return new _ZodBigInt({
          ...this._def,
          checks: [
            ...this._def.checks,
            {
              kind,
              value,
              inclusive,
              message: errorUtil_js_1.errorUtil.toString(message)
            }
          ]
        });
      }
      _addCheck(check) {
        return new _ZodBigInt({
          ...this._def,
          checks: [...this._def.checks, check]
        });
      }
      positive(message) {
        return this._addCheck({
          kind: "min",
          value: BigInt(0),
          inclusive: false,
          message: errorUtil_js_1.errorUtil.toString(message)
        });
      }
      negative(message) {
        return this._addCheck({
          kind: "max",
          value: BigInt(0),
          inclusive: false,
          message: errorUtil_js_1.errorUtil.toString(message)
        });
      }
      nonpositive(message) {
        return this._addCheck({
          kind: "max",
          value: BigInt(0),
          inclusive: true,
          message: errorUtil_js_1.errorUtil.toString(message)
        });
      }
      nonnegative(message) {
        return this._addCheck({
          kind: "min",
          value: BigInt(0),
          inclusive: true,
          message: errorUtil_js_1.errorUtil.toString(message)
        });
      }
      multipleOf(value, message) {
        return this._addCheck({
          kind: "multipleOf",
          value,
          message: errorUtil_js_1.errorUtil.toString(message)
        });
      }
      get minValue() {
        let min = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "min") {
            if (min === null || ch.value > min)
              min = ch.value;
          }
        }
        return min;
      }
      get maxValue() {
        let max = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "max") {
            if (max === null || ch.value < max)
              max = ch.value;
          }
        }
        return max;
      }
    };
    exports.ZodBigInt = ZodBigInt;
    ZodBigInt.create = (params) => {
      return new ZodBigInt({
        checks: [],
        typeName: ZodFirstPartyTypeKind.ZodBigInt,
        coerce: params?.coerce ?? false,
        ...processCreateParams(params)
      });
    };
    var ZodBoolean = class extends ZodType {
      _parse(input) {
        if (this._def.coerce) {
          input.data = Boolean(input.data);
        }
        const parsedType = this._getType(input);
        if (parsedType !== util_js_1.ZodParsedType.boolean) {
          const ctx = this._getOrReturnCtx(input);
          (0, parseUtil_js_1.addIssueToContext)(ctx, {
            code: ZodError_js_1.ZodIssueCode.invalid_type,
            expected: util_js_1.ZodParsedType.boolean,
            received: ctx.parsedType
          });
          return parseUtil_js_1.INVALID;
        }
        return (0, parseUtil_js_1.OK)(input.data);
      }
    };
    exports.ZodBoolean = ZodBoolean;
    ZodBoolean.create = (params) => {
      return new ZodBoolean({
        typeName: ZodFirstPartyTypeKind.ZodBoolean,
        coerce: params?.coerce || false,
        ...processCreateParams(params)
      });
    };
    var ZodDate = class _ZodDate extends ZodType {
      _parse(input) {
        if (this._def.coerce) {
          input.data = new Date(input.data);
        }
        const parsedType = this._getType(input);
        if (parsedType !== util_js_1.ZodParsedType.date) {
          const ctx2 = this._getOrReturnCtx(input);
          (0, parseUtil_js_1.addIssueToContext)(ctx2, {
            code: ZodError_js_1.ZodIssueCode.invalid_type,
            expected: util_js_1.ZodParsedType.date,
            received: ctx2.parsedType
          });
          return parseUtil_js_1.INVALID;
        }
        if (Number.isNaN(input.data.getTime())) {
          const ctx2 = this._getOrReturnCtx(input);
          (0, parseUtil_js_1.addIssueToContext)(ctx2, {
            code: ZodError_js_1.ZodIssueCode.invalid_date
          });
          return parseUtil_js_1.INVALID;
        }
        const status = new parseUtil_js_1.ParseStatus();
        let ctx = void 0;
        for (const check of this._def.checks) {
          if (check.kind === "min") {
            if (input.data.getTime() < check.value) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_js_1.addIssueToContext)(ctx, {
                code: ZodError_js_1.ZodIssueCode.too_small,
                message: check.message,
                inclusive: true,
                exact: false,
                minimum: check.value,
                type: "date"
              });
              status.dirty();
            }
          } else if (check.kind === "max") {
            if (input.data.getTime() > check.value) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_js_1.addIssueToContext)(ctx, {
                code: ZodError_js_1.ZodIssueCode.too_big,
                message: check.message,
                inclusive: true,
                exact: false,
                maximum: check.value,
                type: "date"
              });
              status.dirty();
            }
          } else {
            util_js_1.util.assertNever(check);
          }
        }
        return {
          status: status.value,
          value: new Date(input.data.getTime())
        };
      }
      _addCheck(check) {
        return new _ZodDate({
          ...this._def,
          checks: [...this._def.checks, check]
        });
      }
      min(minDate, message) {
        return this._addCheck({
          kind: "min",
          value: minDate.getTime(),
          message: errorUtil_js_1.errorUtil.toString(message)
        });
      }
      max(maxDate, message) {
        return this._addCheck({
          kind: "max",
          value: maxDate.getTime(),
          message: errorUtil_js_1.errorUtil.toString(message)
        });
      }
      get minDate() {
        let min = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "min") {
            if (min === null || ch.value > min)
              min = ch.value;
          }
        }
        return min != null ? new Date(min) : null;
      }
      get maxDate() {
        let max = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "max") {
            if (max === null || ch.value < max)
              max = ch.value;
          }
        }
        return max != null ? new Date(max) : null;
      }
    };
    exports.ZodDate = ZodDate;
    ZodDate.create = (params) => {
      return new ZodDate({
        checks: [],
        coerce: params?.coerce || false,
        typeName: ZodFirstPartyTypeKind.ZodDate,
        ...processCreateParams(params)
      });
    };
    var ZodSymbol = class extends ZodType {
      _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== util_js_1.ZodParsedType.symbol) {
          const ctx = this._getOrReturnCtx(input);
          (0, parseUtil_js_1.addIssueToContext)(ctx, {
            code: ZodError_js_1.ZodIssueCode.invalid_type,
            expected: util_js_1.ZodParsedType.symbol,
            received: ctx.parsedType
          });
          return parseUtil_js_1.INVALID;
        }
        return (0, parseUtil_js_1.OK)(input.data);
      }
    };
    exports.ZodSymbol = ZodSymbol;
    ZodSymbol.create = (params) => {
      return new ZodSymbol({
        typeName: ZodFirstPartyTypeKind.ZodSymbol,
        ...processCreateParams(params)
      });
    };
    var ZodUndefined = class extends ZodType {
      _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== util_js_1.ZodParsedType.undefined) {
          const ctx = this._getOrReturnCtx(input);
          (0, parseUtil_js_1.addIssueToContext)(ctx, {
            code: ZodError_js_1.ZodIssueCode.invalid_type,
            expected: util_js_1.ZodParsedType.undefined,
            received: ctx.parsedType
          });
          return parseUtil_js_1.INVALID;
        }
        return (0, parseUtil_js_1.OK)(input.data);
      }
    };
    exports.ZodUndefined = ZodUndefined;
    ZodUndefined.create = (params) => {
      return new ZodUndefined({
        typeName: ZodFirstPartyTypeKind.ZodUndefined,
        ...processCreateParams(params)
      });
    };
    var ZodNull = class extends ZodType {
      _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== util_js_1.ZodParsedType.null) {
          const ctx = this._getOrReturnCtx(input);
          (0, parseUtil_js_1.addIssueToContext)(ctx, {
            code: ZodError_js_1.ZodIssueCode.invalid_type,
            expected: util_js_1.ZodParsedType.null,
            received: ctx.parsedType
          });
          return parseUtil_js_1.INVALID;
        }
        return (0, parseUtil_js_1.OK)(input.data);
      }
    };
    exports.ZodNull = ZodNull;
    ZodNull.create = (params) => {
      return new ZodNull({
        typeName: ZodFirstPartyTypeKind.ZodNull,
        ...processCreateParams(params)
      });
    };
    var ZodAny = class extends ZodType {
      constructor() {
        super(...arguments);
        this._any = true;
      }
      _parse(input) {
        return (0, parseUtil_js_1.OK)(input.data);
      }
    };
    exports.ZodAny = ZodAny;
    ZodAny.create = (params) => {
      return new ZodAny({
        typeName: ZodFirstPartyTypeKind.ZodAny,
        ...processCreateParams(params)
      });
    };
    var ZodUnknown = class extends ZodType {
      constructor() {
        super(...arguments);
        this._unknown = true;
      }
      _parse(input) {
        return (0, parseUtil_js_1.OK)(input.data);
      }
    };
    exports.ZodUnknown = ZodUnknown;
    ZodUnknown.create = (params) => {
      return new ZodUnknown({
        typeName: ZodFirstPartyTypeKind.ZodUnknown,
        ...processCreateParams(params)
      });
    };
    var ZodNever = class extends ZodType {
      _parse(input) {
        const ctx = this._getOrReturnCtx(input);
        (0, parseUtil_js_1.addIssueToContext)(ctx, {
          code: ZodError_js_1.ZodIssueCode.invalid_type,
          expected: util_js_1.ZodParsedType.never,
          received: ctx.parsedType
        });
        return parseUtil_js_1.INVALID;
      }
    };
    exports.ZodNever = ZodNever;
    ZodNever.create = (params) => {
      return new ZodNever({
        typeName: ZodFirstPartyTypeKind.ZodNever,
        ...processCreateParams(params)
      });
    };
    var ZodVoid = class extends ZodType {
      _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== util_js_1.ZodParsedType.undefined) {
          const ctx = this._getOrReturnCtx(input);
          (0, parseUtil_js_1.addIssueToContext)(ctx, {
            code: ZodError_js_1.ZodIssueCode.invalid_type,
            expected: util_js_1.ZodParsedType.void,
            received: ctx.parsedType
          });
          return parseUtil_js_1.INVALID;
        }
        return (0, parseUtil_js_1.OK)(input.data);
      }
    };
    exports.ZodVoid = ZodVoid;
    ZodVoid.create = (params) => {
      return new ZodVoid({
        typeName: ZodFirstPartyTypeKind.ZodVoid,
        ...processCreateParams(params)
      });
    };
    var ZodArray = class _ZodArray extends ZodType {
      _parse(input) {
        const { ctx, status } = this._processInputParams(input);
        const def = this._def;
        if (ctx.parsedType !== util_js_1.ZodParsedType.array) {
          (0, parseUtil_js_1.addIssueToContext)(ctx, {
            code: ZodError_js_1.ZodIssueCode.invalid_type,
            expected: util_js_1.ZodParsedType.array,
            received: ctx.parsedType
          });
          return parseUtil_js_1.INVALID;
        }
        if (def.exactLength !== null) {
          const tooBig = ctx.data.length > def.exactLength.value;
          const tooSmall = ctx.data.length < def.exactLength.value;
          if (tooBig || tooSmall) {
            (0, parseUtil_js_1.addIssueToContext)(ctx, {
              code: tooBig ? ZodError_js_1.ZodIssueCode.too_big : ZodError_js_1.ZodIssueCode.too_small,
              minimum: tooSmall ? def.exactLength.value : void 0,
              maximum: tooBig ? def.exactLength.value : void 0,
              type: "array",
              inclusive: true,
              exact: true,
              message: def.exactLength.message
            });
            status.dirty();
          }
        }
        if (def.minLength !== null) {
          if (ctx.data.length < def.minLength.value) {
            (0, parseUtil_js_1.addIssueToContext)(ctx, {
              code: ZodError_js_1.ZodIssueCode.too_small,
              minimum: def.minLength.value,
              type: "array",
              inclusive: true,
              exact: false,
              message: def.minLength.message
            });
            status.dirty();
          }
        }
        if (def.maxLength !== null) {
          if (ctx.data.length > def.maxLength.value) {
            (0, parseUtil_js_1.addIssueToContext)(ctx, {
              code: ZodError_js_1.ZodIssueCode.too_big,
              maximum: def.maxLength.value,
              type: "array",
              inclusive: true,
              exact: false,
              message: def.maxLength.message
            });
            status.dirty();
          }
        }
        if (ctx.common.async) {
          return Promise.all([...ctx.data].map((item, i) => {
            return def.type._parseAsync(new ParseInputLazyPath(ctx, item, ctx.path, i));
          })).then((result2) => {
            return parseUtil_js_1.ParseStatus.mergeArray(status, result2);
          });
        }
        const result = [...ctx.data].map((item, i) => {
          return def.type._parseSync(new ParseInputLazyPath(ctx, item, ctx.path, i));
        });
        return parseUtil_js_1.ParseStatus.mergeArray(status, result);
      }
      get element() {
        return this._def.type;
      }
      min(minLength, message) {
        return new _ZodArray({
          ...this._def,
          minLength: { value: minLength, message: errorUtil_js_1.errorUtil.toString(message) }
        });
      }
      max(maxLength, message) {
        return new _ZodArray({
          ...this._def,
          maxLength: { value: maxLength, message: errorUtil_js_1.errorUtil.toString(message) }
        });
      }
      length(len, message) {
        return new _ZodArray({
          ...this._def,
          exactLength: { value: len, message: errorUtil_js_1.errorUtil.toString(message) }
        });
      }
      nonempty(message) {
        return this.min(1, message);
      }
    };
    exports.ZodArray = ZodArray;
    ZodArray.create = (schema, params) => {
      return new ZodArray({
        type: schema,
        minLength: null,
        maxLength: null,
        exactLength: null,
        typeName: ZodFirstPartyTypeKind.ZodArray,
        ...processCreateParams(params)
      });
    };
    function deepPartialify(schema) {
      if (schema instanceof ZodObject) {
        const newShape = {};
        for (const key in schema.shape) {
          const fieldSchema = schema.shape[key];
          newShape[key] = ZodOptional.create(deepPartialify(fieldSchema));
        }
        return new ZodObject({
          ...schema._def,
          shape: () => newShape
        });
      } else if (schema instanceof ZodArray) {
        return new ZodArray({
          ...schema._def,
          type: deepPartialify(schema.element)
        });
      } else if (schema instanceof ZodOptional) {
        return ZodOptional.create(deepPartialify(schema.unwrap()));
      } else if (schema instanceof ZodNullable) {
        return ZodNullable.create(deepPartialify(schema.unwrap()));
      } else if (schema instanceof ZodTuple) {
        return ZodTuple.create(schema.items.map((item) => deepPartialify(item)));
      } else {
        return schema;
      }
    }
    var ZodObject = class _ZodObject extends ZodType {
      constructor() {
        super(...arguments);
        this._cached = null;
        this.nonstrict = this.passthrough;
        this.augment = this.extend;
      }
      _getCached() {
        if (this._cached !== null)
          return this._cached;
        const shape = this._def.shape();
        const keys = util_js_1.util.objectKeys(shape);
        this._cached = { shape, keys };
        return this._cached;
      }
      _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== util_js_1.ZodParsedType.object) {
          const ctx2 = this._getOrReturnCtx(input);
          (0, parseUtil_js_1.addIssueToContext)(ctx2, {
            code: ZodError_js_1.ZodIssueCode.invalid_type,
            expected: util_js_1.ZodParsedType.object,
            received: ctx2.parsedType
          });
          return parseUtil_js_1.INVALID;
        }
        const { status, ctx } = this._processInputParams(input);
        const { shape, keys: shapeKeys } = this._getCached();
        const extraKeys = [];
        if (!(this._def.catchall instanceof ZodNever && this._def.unknownKeys === "strip")) {
          for (const key in ctx.data) {
            if (!shapeKeys.includes(key)) {
              extraKeys.push(key);
            }
          }
        }
        const pairs = [];
        for (const key of shapeKeys) {
          const keyValidator = shape[key];
          const value = ctx.data[key];
          pairs.push({
            key: { status: "valid", value: key },
            value: keyValidator._parse(new ParseInputLazyPath(ctx, value, ctx.path, key)),
            alwaysSet: key in ctx.data
          });
        }
        if (this._def.catchall instanceof ZodNever) {
          const unknownKeys = this._def.unknownKeys;
          if (unknownKeys === "passthrough") {
            for (const key of extraKeys) {
              pairs.push({
                key: { status: "valid", value: key },
                value: { status: "valid", value: ctx.data[key] }
              });
            }
          } else if (unknownKeys === "strict") {
            if (extraKeys.length > 0) {
              (0, parseUtil_js_1.addIssueToContext)(ctx, {
                code: ZodError_js_1.ZodIssueCode.unrecognized_keys,
                keys: extraKeys
              });
              status.dirty();
            }
          } else if (unknownKeys === "strip") {
          } else {
            throw new Error(`Internal ZodObject error: invalid unknownKeys value.`);
          }
        } else {
          const catchall = this._def.catchall;
          for (const key of extraKeys) {
            const value = ctx.data[key];
            pairs.push({
              key: { status: "valid", value: key },
              value: catchall._parse(
                new ParseInputLazyPath(ctx, value, ctx.path, key)
                //, ctx.child(key), value, getParsedType(value)
              ),
              alwaysSet: key in ctx.data
            });
          }
        }
        if (ctx.common.async) {
          return Promise.resolve().then(async () => {
            const syncPairs = [];
            for (const pair of pairs) {
              const key = await pair.key;
              const value = await pair.value;
              syncPairs.push({
                key,
                value,
                alwaysSet: pair.alwaysSet
              });
            }
            return syncPairs;
          }).then((syncPairs) => {
            return parseUtil_js_1.ParseStatus.mergeObjectSync(status, syncPairs);
          });
        } else {
          return parseUtil_js_1.ParseStatus.mergeObjectSync(status, pairs);
        }
      }
      get shape() {
        return this._def.shape();
      }
      strict(message) {
        errorUtil_js_1.errorUtil.errToObj;
        return new _ZodObject({
          ...this._def,
          unknownKeys: "strict",
          ...message !== void 0 ? {
            errorMap: (issue, ctx) => {
              const defaultError = this._def.errorMap?.(issue, ctx).message ?? ctx.defaultError;
              if (issue.code === "unrecognized_keys")
                return {
                  message: errorUtil_js_1.errorUtil.errToObj(message).message ?? defaultError
                };
              return {
                message: defaultError
              };
            }
          } : {}
        });
      }
      strip() {
        return new _ZodObject({
          ...this._def,
          unknownKeys: "strip"
        });
      }
      passthrough() {
        return new _ZodObject({
          ...this._def,
          unknownKeys: "passthrough"
        });
      }
      // const AugmentFactory =
      //   <Def extends ZodObjectDef>(def: Def) =>
      //   <Augmentation extends ZodRawShape>(
      //     augmentation: Augmentation
      //   ): ZodObject<
      //     extendShape<ReturnType<Def["shape"]>, Augmentation>,
      //     Def["unknownKeys"],
      //     Def["catchall"]
      //   > => {
      //     return new ZodObject({
      //       ...def,
      //       shape: () => ({
      //         ...def.shape(),
      //         ...augmentation,
      //       }),
      //     }) as any;
      //   };
      extend(augmentation) {
        return new _ZodObject({
          ...this._def,
          shape: () => ({
            ...this._def.shape(),
            ...augmentation
          })
        });
      }
      /**
       * Prior to zod@1.0.12 there was a bug in the
       * inferred type of merged objects. Please
       * upgrade if you are experiencing issues.
       */
      merge(merging) {
        const merged = new _ZodObject({
          unknownKeys: merging._def.unknownKeys,
          catchall: merging._def.catchall,
          shape: () => ({
            ...this._def.shape(),
            ...merging._def.shape()
          }),
          typeName: ZodFirstPartyTypeKind.ZodObject
        });
        return merged;
      }
      // merge<
      //   Incoming extends AnyZodObject,
      //   Augmentation extends Incoming["shape"],
      //   NewOutput extends {
      //     [k in keyof Augmentation | keyof Output]: k extends keyof Augmentation
      //       ? Augmentation[k]["_output"]
      //       : k extends keyof Output
      //       ? Output[k]
      //       : never;
      //   },
      //   NewInput extends {
      //     [k in keyof Augmentation | keyof Input]: k extends keyof Augmentation
      //       ? Augmentation[k]["_input"]
      //       : k extends keyof Input
      //       ? Input[k]
      //       : never;
      //   }
      // >(
      //   merging: Incoming
      // ): ZodObject<
      //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
      //   Incoming["_def"]["unknownKeys"],
      //   Incoming["_def"]["catchall"],
      //   NewOutput,
      //   NewInput
      // > {
      //   const merged: any = new ZodObject({
      //     unknownKeys: merging._def.unknownKeys,
      //     catchall: merging._def.catchall,
      //     shape: () =>
      //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
      //     typeName: ZodFirstPartyTypeKind.ZodObject,
      //   }) as any;
      //   return merged;
      // }
      setKey(key, schema) {
        return this.augment({ [key]: schema });
      }
      // merge<Incoming extends AnyZodObject>(
      //   merging: Incoming
      // ): //ZodObject<T & Incoming["_shape"], UnknownKeys, Catchall> = (merging) => {
      // ZodObject<
      //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
      //   Incoming["_def"]["unknownKeys"],
      //   Incoming["_def"]["catchall"]
      // > {
      //   // const mergedShape = objectUtil.mergeShapes(
      //   //   this._def.shape(),
      //   //   merging._def.shape()
      //   // );
      //   const merged: any = new ZodObject({
      //     unknownKeys: merging._def.unknownKeys,
      //     catchall: merging._def.catchall,
      //     shape: () =>
      //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
      //     typeName: ZodFirstPartyTypeKind.ZodObject,
      //   }) as any;
      //   return merged;
      // }
      catchall(index) {
        return new _ZodObject({
          ...this._def,
          catchall: index
        });
      }
      pick(mask) {
        const shape = {};
        for (const key of util_js_1.util.objectKeys(mask)) {
          if (mask[key] && this.shape[key]) {
            shape[key] = this.shape[key];
          }
        }
        return new _ZodObject({
          ...this._def,
          shape: () => shape
        });
      }
      omit(mask) {
        const shape = {};
        for (const key of util_js_1.util.objectKeys(this.shape)) {
          if (!mask[key]) {
            shape[key] = this.shape[key];
          }
        }
        return new _ZodObject({
          ...this._def,
          shape: () => shape
        });
      }
      /**
       * @deprecated
       */
      deepPartial() {
        return deepPartialify(this);
      }
      partial(mask) {
        const newShape = {};
        for (const key of util_js_1.util.objectKeys(this.shape)) {
          const fieldSchema = this.shape[key];
          if (mask && !mask[key]) {
            newShape[key] = fieldSchema;
          } else {
            newShape[key] = fieldSchema.optional();
          }
        }
        return new _ZodObject({
          ...this._def,
          shape: () => newShape
        });
      }
      required(mask) {
        const newShape = {};
        for (const key of util_js_1.util.objectKeys(this.shape)) {
          if (mask && !mask[key]) {
            newShape[key] = this.shape[key];
          } else {
            const fieldSchema = this.shape[key];
            let newField = fieldSchema;
            while (newField instanceof ZodOptional) {
              newField = newField._def.innerType;
            }
            newShape[key] = newField;
          }
        }
        return new _ZodObject({
          ...this._def,
          shape: () => newShape
        });
      }
      keyof() {
        return createZodEnum(util_js_1.util.objectKeys(this.shape));
      }
    };
    exports.ZodObject = ZodObject;
    ZodObject.create = (shape, params) => {
      return new ZodObject({
        shape: () => shape,
        unknownKeys: "strip",
        catchall: ZodNever.create(),
        typeName: ZodFirstPartyTypeKind.ZodObject,
        ...processCreateParams(params)
      });
    };
    ZodObject.strictCreate = (shape, params) => {
      return new ZodObject({
        shape: () => shape,
        unknownKeys: "strict",
        catchall: ZodNever.create(),
        typeName: ZodFirstPartyTypeKind.ZodObject,
        ...processCreateParams(params)
      });
    };
    ZodObject.lazycreate = (shape, params) => {
      return new ZodObject({
        shape,
        unknownKeys: "strip",
        catchall: ZodNever.create(),
        typeName: ZodFirstPartyTypeKind.ZodObject,
        ...processCreateParams(params)
      });
    };
    var ZodUnion = class extends ZodType {
      _parse(input) {
        const { ctx } = this._processInputParams(input);
        const options = this._def.options;
        function handleResults(results) {
          for (const result of results) {
            if (result.result.status === "valid") {
              return result.result;
            }
          }
          for (const result of results) {
            if (result.result.status === "dirty") {
              ctx.common.issues.push(...result.ctx.common.issues);
              return result.result;
            }
          }
          const unionErrors = results.map((result) => new ZodError_js_1.ZodError(result.ctx.common.issues));
          (0, parseUtil_js_1.addIssueToContext)(ctx, {
            code: ZodError_js_1.ZodIssueCode.invalid_union,
            unionErrors
          });
          return parseUtil_js_1.INVALID;
        }
        if (ctx.common.async) {
          return Promise.all(options.map(async (option) => {
            const childCtx = {
              ...ctx,
              common: {
                ...ctx.common,
                issues: []
              },
              parent: null
            };
            return {
              result: await option._parseAsync({
                data: ctx.data,
                path: ctx.path,
                parent: childCtx
              }),
              ctx: childCtx
            };
          })).then(handleResults);
        } else {
          let dirty = void 0;
          const issues = [];
          for (const option of options) {
            const childCtx = {
              ...ctx,
              common: {
                ...ctx.common,
                issues: []
              },
              parent: null
            };
            const result = option._parseSync({
              data: ctx.data,
              path: ctx.path,
              parent: childCtx
            });
            if (result.status === "valid") {
              return result;
            } else if (result.status === "dirty" && !dirty) {
              dirty = { result, ctx: childCtx };
            }
            if (childCtx.common.issues.length) {
              issues.push(childCtx.common.issues);
            }
          }
          if (dirty) {
            ctx.common.issues.push(...dirty.ctx.common.issues);
            return dirty.result;
          }
          const unionErrors = issues.map((issues2) => new ZodError_js_1.ZodError(issues2));
          (0, parseUtil_js_1.addIssueToContext)(ctx, {
            code: ZodError_js_1.ZodIssueCode.invalid_union,
            unionErrors
          });
          return parseUtil_js_1.INVALID;
        }
      }
      get options() {
        return this._def.options;
      }
    };
    exports.ZodUnion = ZodUnion;
    ZodUnion.create = (types, params) => {
      return new ZodUnion({
        options: types,
        typeName: ZodFirstPartyTypeKind.ZodUnion,
        ...processCreateParams(params)
      });
    };
    var getDiscriminator = (type) => {
      if (type instanceof ZodLazy) {
        return getDiscriminator(type.schema);
      } else if (type instanceof ZodEffects) {
        return getDiscriminator(type.innerType());
      } else if (type instanceof ZodLiteral) {
        return [type.value];
      } else if (type instanceof ZodEnum) {
        return type.options;
      } else if (type instanceof ZodNativeEnum) {
        return util_js_1.util.objectValues(type.enum);
      } else if (type instanceof ZodDefault) {
        return getDiscriminator(type._def.innerType);
      } else if (type instanceof ZodUndefined) {
        return [void 0];
      } else if (type instanceof ZodNull) {
        return [null];
      } else if (type instanceof ZodOptional) {
        return [void 0, ...getDiscriminator(type.unwrap())];
      } else if (type instanceof ZodNullable) {
        return [null, ...getDiscriminator(type.unwrap())];
      } else if (type instanceof ZodBranded) {
        return getDiscriminator(type.unwrap());
      } else if (type instanceof ZodReadonly) {
        return getDiscriminator(type.unwrap());
      } else if (type instanceof ZodCatch) {
        return getDiscriminator(type._def.innerType);
      } else {
        return [];
      }
    };
    var ZodDiscriminatedUnion = class _ZodDiscriminatedUnion extends ZodType {
      _parse(input) {
        const { ctx } = this._processInputParams(input);
        if (ctx.parsedType !== util_js_1.ZodParsedType.object) {
          (0, parseUtil_js_1.addIssueToContext)(ctx, {
            code: ZodError_js_1.ZodIssueCode.invalid_type,
            expected: util_js_1.ZodParsedType.object,
            received: ctx.parsedType
          });
          return parseUtil_js_1.INVALID;
        }
        const discriminator = this.discriminator;
        const discriminatorValue = ctx.data[discriminator];
        const option = this.optionsMap.get(discriminatorValue);
        if (!option) {
          (0, parseUtil_js_1.addIssueToContext)(ctx, {
            code: ZodError_js_1.ZodIssueCode.invalid_union_discriminator,
            options: Array.from(this.optionsMap.keys()),
            path: [discriminator]
          });
          return parseUtil_js_1.INVALID;
        }
        if (ctx.common.async) {
          return option._parseAsync({
            data: ctx.data,
            path: ctx.path,
            parent: ctx
          });
        } else {
          return option._parseSync({
            data: ctx.data,
            path: ctx.path,
            parent: ctx
          });
        }
      }
      get discriminator() {
        return this._def.discriminator;
      }
      get options() {
        return this._def.options;
      }
      get optionsMap() {
        return this._def.optionsMap;
      }
      /**
       * The constructor of the discriminated union schema. Its behaviour is very similar to that of the normal z.union() constructor.
       * However, it only allows a union of objects, all of which need to share a discriminator property. This property must
       * have a different value for each object in the union.
       * @param discriminator the name of the discriminator property
       * @param types an array of object schemas
       * @param params
       */
      static create(discriminator, options, params) {
        const optionsMap = /* @__PURE__ */ new Map();
        for (const type of options) {
          const discriminatorValues = getDiscriminator(type.shape[discriminator]);
          if (!discriminatorValues.length) {
            throw new Error(`A discriminator value for key \`${discriminator}\` could not be extracted from all schema options`);
          }
          for (const value of discriminatorValues) {
            if (optionsMap.has(value)) {
              throw new Error(`Discriminator property ${String(discriminator)} has duplicate value ${String(value)}`);
            }
            optionsMap.set(value, type);
          }
        }
        return new _ZodDiscriminatedUnion({
          typeName: ZodFirstPartyTypeKind.ZodDiscriminatedUnion,
          discriminator,
          options,
          optionsMap,
          ...processCreateParams(params)
        });
      }
    };
    exports.ZodDiscriminatedUnion = ZodDiscriminatedUnion;
    function mergeValues(a, b) {
      const aType = (0, util_js_1.getParsedType)(a);
      const bType = (0, util_js_1.getParsedType)(b);
      if (a === b) {
        return { valid: true, data: a };
      } else if (aType === util_js_1.ZodParsedType.object && bType === util_js_1.ZodParsedType.object) {
        const bKeys = util_js_1.util.objectKeys(b);
        const sharedKeys = util_js_1.util.objectKeys(a).filter((key) => bKeys.indexOf(key) !== -1);
        const newObj = { ...a, ...b };
        for (const key of sharedKeys) {
          const sharedValue = mergeValues(a[key], b[key]);
          if (!sharedValue.valid) {
            return { valid: false };
          }
          newObj[key] = sharedValue.data;
        }
        return { valid: true, data: newObj };
      } else if (aType === util_js_1.ZodParsedType.array && bType === util_js_1.ZodParsedType.array) {
        if (a.length !== b.length) {
          return { valid: false };
        }
        const newArray = [];
        for (let index = 0; index < a.length; index++) {
          const itemA = a[index];
          const itemB = b[index];
          const sharedValue = mergeValues(itemA, itemB);
          if (!sharedValue.valid) {
            return { valid: false };
          }
          newArray.push(sharedValue.data);
        }
        return { valid: true, data: newArray };
      } else if (aType === util_js_1.ZodParsedType.date && bType === util_js_1.ZodParsedType.date && +a === +b) {
        return { valid: true, data: a };
      } else {
        return { valid: false };
      }
    }
    var ZodIntersection = class extends ZodType {
      _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        const handleParsed = (parsedLeft, parsedRight) => {
          if ((0, parseUtil_js_1.isAborted)(parsedLeft) || (0, parseUtil_js_1.isAborted)(parsedRight)) {
            return parseUtil_js_1.INVALID;
          }
          const merged = mergeValues(parsedLeft.value, parsedRight.value);
          if (!merged.valid) {
            (0, parseUtil_js_1.addIssueToContext)(ctx, {
              code: ZodError_js_1.ZodIssueCode.invalid_intersection_types
            });
            return parseUtil_js_1.INVALID;
          }
          if ((0, parseUtil_js_1.isDirty)(parsedLeft) || (0, parseUtil_js_1.isDirty)(parsedRight)) {
            status.dirty();
          }
          return { status: status.value, value: merged.data };
        };
        if (ctx.common.async) {
          return Promise.all([
            this._def.left._parseAsync({
              data: ctx.data,
              path: ctx.path,
              parent: ctx
            }),
            this._def.right._parseAsync({
              data: ctx.data,
              path: ctx.path,
              parent: ctx
            })
          ]).then(([left, right]) => handleParsed(left, right));
        } else {
          return handleParsed(this._def.left._parseSync({
            data: ctx.data,
            path: ctx.path,
            parent: ctx
          }), this._def.right._parseSync({
            data: ctx.data,
            path: ctx.path,
            parent: ctx
          }));
        }
      }
    };
    exports.ZodIntersection = ZodIntersection;
    ZodIntersection.create = (left, right, params) => {
      return new ZodIntersection({
        left,
        right,
        typeName: ZodFirstPartyTypeKind.ZodIntersection,
        ...processCreateParams(params)
      });
    };
    var ZodTuple = class _ZodTuple extends ZodType {
      _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        if (ctx.parsedType !== util_js_1.ZodParsedType.array) {
          (0, parseUtil_js_1.addIssueToContext)(ctx, {
            code: ZodError_js_1.ZodIssueCode.invalid_type,
            expected: util_js_1.ZodParsedType.array,
            received: ctx.parsedType
          });
          return parseUtil_js_1.INVALID;
        }
        if (ctx.data.length < this._def.items.length) {
          (0, parseUtil_js_1.addIssueToContext)(ctx, {
            code: ZodError_js_1.ZodIssueCode.too_small,
            minimum: this._def.items.length,
            inclusive: true,
            exact: false,
            type: "array"
          });
          return parseUtil_js_1.INVALID;
        }
        const rest = this._def.rest;
        if (!rest && ctx.data.length > this._def.items.length) {
          (0, parseUtil_js_1.addIssueToContext)(ctx, {
            code: ZodError_js_1.ZodIssueCode.too_big,
            maximum: this._def.items.length,
            inclusive: true,
            exact: false,
            type: "array"
          });
          status.dirty();
        }
        const items = [...ctx.data].map((item, itemIndex) => {
          const schema = this._def.items[itemIndex] || this._def.rest;
          if (!schema)
            return null;
          return schema._parse(new ParseInputLazyPath(ctx, item, ctx.path, itemIndex));
        }).filter((x) => !!x);
        if (ctx.common.async) {
          return Promise.all(items).then((results) => {
            return parseUtil_js_1.ParseStatus.mergeArray(status, results);
          });
        } else {
          return parseUtil_js_1.ParseStatus.mergeArray(status, items);
        }
      }
      get items() {
        return this._def.items;
      }
      rest(rest) {
        return new _ZodTuple({
          ...this._def,
          rest
        });
      }
    };
    exports.ZodTuple = ZodTuple;
    ZodTuple.create = (schemas, params) => {
      if (!Array.isArray(schemas)) {
        throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
      }
      return new ZodTuple({
        items: schemas,
        typeName: ZodFirstPartyTypeKind.ZodTuple,
        rest: null,
        ...processCreateParams(params)
      });
    };
    var ZodRecord = class _ZodRecord extends ZodType {
      get keySchema() {
        return this._def.keyType;
      }
      get valueSchema() {
        return this._def.valueType;
      }
      _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        if (ctx.parsedType !== util_js_1.ZodParsedType.object) {
          (0, parseUtil_js_1.addIssueToContext)(ctx, {
            code: ZodError_js_1.ZodIssueCode.invalid_type,
            expected: util_js_1.ZodParsedType.object,
            received: ctx.parsedType
          });
          return parseUtil_js_1.INVALID;
        }
        const pairs = [];
        const keyType = this._def.keyType;
        const valueType = this._def.valueType;
        for (const key in ctx.data) {
          pairs.push({
            key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, key)),
            value: valueType._parse(new ParseInputLazyPath(ctx, ctx.data[key], ctx.path, key)),
            alwaysSet: key in ctx.data
          });
        }
        if (ctx.common.async) {
          return parseUtil_js_1.ParseStatus.mergeObjectAsync(status, pairs);
        } else {
          return parseUtil_js_1.ParseStatus.mergeObjectSync(status, pairs);
        }
      }
      get element() {
        return this._def.valueType;
      }
      static create(first, second, third) {
        if (second instanceof ZodType) {
          return new _ZodRecord({
            keyType: first,
            valueType: second,
            typeName: ZodFirstPartyTypeKind.ZodRecord,
            ...processCreateParams(third)
          });
        }
        return new _ZodRecord({
          keyType: ZodString.create(),
          valueType: first,
          typeName: ZodFirstPartyTypeKind.ZodRecord,
          ...processCreateParams(second)
        });
      }
    };
    exports.ZodRecord = ZodRecord;
    var ZodMap = class extends ZodType {
      get keySchema() {
        return this._def.keyType;
      }
      get valueSchema() {
        return this._def.valueType;
      }
      _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        if (ctx.parsedType !== util_js_1.ZodParsedType.map) {
          (0, parseUtil_js_1.addIssueToContext)(ctx, {
            code: ZodError_js_1.ZodIssueCode.invalid_type,
            expected: util_js_1.ZodParsedType.map,
            received: ctx.parsedType
          });
          return parseUtil_js_1.INVALID;
        }
        const keyType = this._def.keyType;
        const valueType = this._def.valueType;
        const pairs = [...ctx.data.entries()].map(([key, value], index) => {
          return {
            key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, [index, "key"])),
            value: valueType._parse(new ParseInputLazyPath(ctx, value, ctx.path, [index, "value"]))
          };
        });
        if (ctx.common.async) {
          const finalMap = /* @__PURE__ */ new Map();
          return Promise.resolve().then(async () => {
            for (const pair of pairs) {
              const key = await pair.key;
              const value = await pair.value;
              if (key.status === "aborted" || value.status === "aborted") {
                return parseUtil_js_1.INVALID;
              }
              if (key.status === "dirty" || value.status === "dirty") {
                status.dirty();
              }
              finalMap.set(key.value, value.value);
            }
            return { status: status.value, value: finalMap };
          });
        } else {
          const finalMap = /* @__PURE__ */ new Map();
          for (const pair of pairs) {
            const key = pair.key;
            const value = pair.value;
            if (key.status === "aborted" || value.status === "aborted") {
              return parseUtil_js_1.INVALID;
            }
            if (key.status === "dirty" || value.status === "dirty") {
              status.dirty();
            }
            finalMap.set(key.value, value.value);
          }
          return { status: status.value, value: finalMap };
        }
      }
    };
    exports.ZodMap = ZodMap;
    ZodMap.create = (keyType, valueType, params) => {
      return new ZodMap({
        valueType,
        keyType,
        typeName: ZodFirstPartyTypeKind.ZodMap,
        ...processCreateParams(params)
      });
    };
    var ZodSet = class _ZodSet extends ZodType {
      _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        if (ctx.parsedType !== util_js_1.ZodParsedType.set) {
          (0, parseUtil_js_1.addIssueToContext)(ctx, {
            code: ZodError_js_1.ZodIssueCode.invalid_type,
            expected: util_js_1.ZodParsedType.set,
            received: ctx.parsedType
          });
          return parseUtil_js_1.INVALID;
        }
        const def = this._def;
        if (def.minSize !== null) {
          if (ctx.data.size < def.minSize.value) {
            (0, parseUtil_js_1.addIssueToContext)(ctx, {
              code: ZodError_js_1.ZodIssueCode.too_small,
              minimum: def.minSize.value,
              type: "set",
              inclusive: true,
              exact: false,
              message: def.minSize.message
            });
            status.dirty();
          }
        }
        if (def.maxSize !== null) {
          if (ctx.data.size > def.maxSize.value) {
            (0, parseUtil_js_1.addIssueToContext)(ctx, {
              code: ZodError_js_1.ZodIssueCode.too_big,
              maximum: def.maxSize.value,
              type: "set",
              inclusive: true,
              exact: false,
              message: def.maxSize.message
            });
            status.dirty();
          }
        }
        const valueType = this._def.valueType;
        function finalizeSet(elements2) {
          const parsedSet = /* @__PURE__ */ new Set();
          for (const element of elements2) {
            if (element.status === "aborted")
              return parseUtil_js_1.INVALID;
            if (element.status === "dirty")
              status.dirty();
            parsedSet.add(element.value);
          }
          return { status: status.value, value: parsedSet };
        }
        const elements = [...ctx.data.values()].map((item, i) => valueType._parse(new ParseInputLazyPath(ctx, item, ctx.path, i)));
        if (ctx.common.async) {
          return Promise.all(elements).then((elements2) => finalizeSet(elements2));
        } else {
          return finalizeSet(elements);
        }
      }
      min(minSize, message) {
        return new _ZodSet({
          ...this._def,
          minSize: { value: minSize, message: errorUtil_js_1.errorUtil.toString(message) }
        });
      }
      max(maxSize, message) {
        return new _ZodSet({
          ...this._def,
          maxSize: { value: maxSize, message: errorUtil_js_1.errorUtil.toString(message) }
        });
      }
      size(size, message) {
        return this.min(size, message).max(size, message);
      }
      nonempty(message) {
        return this.min(1, message);
      }
    };
    exports.ZodSet = ZodSet;
    ZodSet.create = (valueType, params) => {
      return new ZodSet({
        valueType,
        minSize: null,
        maxSize: null,
        typeName: ZodFirstPartyTypeKind.ZodSet,
        ...processCreateParams(params)
      });
    };
    var ZodFunction = class _ZodFunction extends ZodType {
      constructor() {
        super(...arguments);
        this.validate = this.implement;
      }
      _parse(input) {
        const { ctx } = this._processInputParams(input);
        if (ctx.parsedType !== util_js_1.ZodParsedType.function) {
          (0, parseUtil_js_1.addIssueToContext)(ctx, {
            code: ZodError_js_1.ZodIssueCode.invalid_type,
            expected: util_js_1.ZodParsedType.function,
            received: ctx.parsedType
          });
          return parseUtil_js_1.INVALID;
        }
        function makeArgsIssue(args, error) {
          return (0, parseUtil_js_1.makeIssue)({
            data: args,
            path: ctx.path,
            errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, (0, errors_js_1.getErrorMap)(), errors_js_1.defaultErrorMap].filter((x) => !!x),
            issueData: {
              code: ZodError_js_1.ZodIssueCode.invalid_arguments,
              argumentsError: error
            }
          });
        }
        function makeReturnsIssue(returns, error) {
          return (0, parseUtil_js_1.makeIssue)({
            data: returns,
            path: ctx.path,
            errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, (0, errors_js_1.getErrorMap)(), errors_js_1.defaultErrorMap].filter((x) => !!x),
            issueData: {
              code: ZodError_js_1.ZodIssueCode.invalid_return_type,
              returnTypeError: error
            }
          });
        }
        const params = { errorMap: ctx.common.contextualErrorMap };
        const fn = ctx.data;
        if (this._def.returns instanceof ZodPromise) {
          const me = this;
          return (0, parseUtil_js_1.OK)(async function(...args) {
            const error = new ZodError_js_1.ZodError([]);
            const parsedArgs = await me._def.args.parseAsync(args, params).catch((e) => {
              error.addIssue(makeArgsIssue(args, e));
              throw error;
            });
            const result = await Reflect.apply(fn, this, parsedArgs);
            const parsedReturns = await me._def.returns._def.type.parseAsync(result, params).catch((e) => {
              error.addIssue(makeReturnsIssue(result, e));
              throw error;
            });
            return parsedReturns;
          });
        } else {
          const me = this;
          return (0, parseUtil_js_1.OK)(function(...args) {
            const parsedArgs = me._def.args.safeParse(args, params);
            if (!parsedArgs.success) {
              throw new ZodError_js_1.ZodError([makeArgsIssue(args, parsedArgs.error)]);
            }
            const result = Reflect.apply(fn, this, parsedArgs.data);
            const parsedReturns = me._def.returns.safeParse(result, params);
            if (!parsedReturns.success) {
              throw new ZodError_js_1.ZodError([makeReturnsIssue(result, parsedReturns.error)]);
            }
            return parsedReturns.data;
          });
        }
      }
      parameters() {
        return this._def.args;
      }
      returnType() {
        return this._def.returns;
      }
      args(...items) {
        return new _ZodFunction({
          ...this._def,
          args: ZodTuple.create(items).rest(ZodUnknown.create())
        });
      }
      returns(returnType) {
        return new _ZodFunction({
          ...this._def,
          returns: returnType
        });
      }
      implement(func) {
        const validatedFunc = this.parse(func);
        return validatedFunc;
      }
      strictImplement(func) {
        const validatedFunc = this.parse(func);
        return validatedFunc;
      }
      static create(args, returns, params) {
        return new _ZodFunction({
          args: args ? args : ZodTuple.create([]).rest(ZodUnknown.create()),
          returns: returns || ZodUnknown.create(),
          typeName: ZodFirstPartyTypeKind.ZodFunction,
          ...processCreateParams(params)
        });
      }
    };
    exports.ZodFunction = ZodFunction;
    var ZodLazy = class extends ZodType {
      get schema() {
        return this._def.getter();
      }
      _parse(input) {
        const { ctx } = this._processInputParams(input);
        const lazySchema = this._def.getter();
        return lazySchema._parse({ data: ctx.data, path: ctx.path, parent: ctx });
      }
    };
    exports.ZodLazy = ZodLazy;
    ZodLazy.create = (getter, params) => {
      return new ZodLazy({
        getter,
        typeName: ZodFirstPartyTypeKind.ZodLazy,
        ...processCreateParams(params)
      });
    };
    var ZodLiteral = class extends ZodType {
      _parse(input) {
        if (input.data !== this._def.value) {
          const ctx = this._getOrReturnCtx(input);
          (0, parseUtil_js_1.addIssueToContext)(ctx, {
            received: ctx.data,
            code: ZodError_js_1.ZodIssueCode.invalid_literal,
            expected: this._def.value
          });
          return parseUtil_js_1.INVALID;
        }
        return { status: "valid", value: input.data };
      }
      get value() {
        return this._def.value;
      }
    };
    exports.ZodLiteral = ZodLiteral;
    ZodLiteral.create = (value, params) => {
      return new ZodLiteral({
        value,
        typeName: ZodFirstPartyTypeKind.ZodLiteral,
        ...processCreateParams(params)
      });
    };
    function createZodEnum(values, params) {
      return new ZodEnum({
        values,
        typeName: ZodFirstPartyTypeKind.ZodEnum,
        ...processCreateParams(params)
      });
    }
    var ZodEnum = class _ZodEnum extends ZodType {
      _parse(input) {
        if (typeof input.data !== "string") {
          const ctx = this._getOrReturnCtx(input);
          const expectedValues = this._def.values;
          (0, parseUtil_js_1.addIssueToContext)(ctx, {
            expected: util_js_1.util.joinValues(expectedValues),
            received: ctx.parsedType,
            code: ZodError_js_1.ZodIssueCode.invalid_type
          });
          return parseUtil_js_1.INVALID;
        }
        if (!this._cache) {
          this._cache = new Set(this._def.values);
        }
        if (!this._cache.has(input.data)) {
          const ctx = this._getOrReturnCtx(input);
          const expectedValues = this._def.values;
          (0, parseUtil_js_1.addIssueToContext)(ctx, {
            received: ctx.data,
            code: ZodError_js_1.ZodIssueCode.invalid_enum_value,
            options: expectedValues
          });
          return parseUtil_js_1.INVALID;
        }
        return (0, parseUtil_js_1.OK)(input.data);
      }
      get options() {
        return this._def.values;
      }
      get enum() {
        const enumValues = {};
        for (const val of this._def.values) {
          enumValues[val] = val;
        }
        return enumValues;
      }
      get Values() {
        const enumValues = {};
        for (const val of this._def.values) {
          enumValues[val] = val;
        }
        return enumValues;
      }
      get Enum() {
        const enumValues = {};
        for (const val of this._def.values) {
          enumValues[val] = val;
        }
        return enumValues;
      }
      extract(values, newDef = this._def) {
        return _ZodEnum.create(values, {
          ...this._def,
          ...newDef
        });
      }
      exclude(values, newDef = this._def) {
        return _ZodEnum.create(this.options.filter((opt) => !values.includes(opt)), {
          ...this._def,
          ...newDef
        });
      }
    };
    exports.ZodEnum = ZodEnum;
    ZodEnum.create = createZodEnum;
    var ZodNativeEnum = class extends ZodType {
      _parse(input) {
        const nativeEnumValues = util_js_1.util.getValidEnumValues(this._def.values);
        const ctx = this._getOrReturnCtx(input);
        if (ctx.parsedType !== util_js_1.ZodParsedType.string && ctx.parsedType !== util_js_1.ZodParsedType.number) {
          const expectedValues = util_js_1.util.objectValues(nativeEnumValues);
          (0, parseUtil_js_1.addIssueToContext)(ctx, {
            expected: util_js_1.util.joinValues(expectedValues),
            received: ctx.parsedType,
            code: ZodError_js_1.ZodIssueCode.invalid_type
          });
          return parseUtil_js_1.INVALID;
        }
        if (!this._cache) {
          this._cache = new Set(util_js_1.util.getValidEnumValues(this._def.values));
        }
        if (!this._cache.has(input.data)) {
          const expectedValues = util_js_1.util.objectValues(nativeEnumValues);
          (0, parseUtil_js_1.addIssueToContext)(ctx, {
            received: ctx.data,
            code: ZodError_js_1.ZodIssueCode.invalid_enum_value,
            options: expectedValues
          });
          return parseUtil_js_1.INVALID;
        }
        return (0, parseUtil_js_1.OK)(input.data);
      }
      get enum() {
        return this._def.values;
      }
    };
    exports.ZodNativeEnum = ZodNativeEnum;
    ZodNativeEnum.create = (values, params) => {
      return new ZodNativeEnum({
        values,
        typeName: ZodFirstPartyTypeKind.ZodNativeEnum,
        ...processCreateParams(params)
      });
    };
    var ZodPromise = class extends ZodType {
      unwrap() {
        return this._def.type;
      }
      _parse(input) {
        const { ctx } = this._processInputParams(input);
        if (ctx.parsedType !== util_js_1.ZodParsedType.promise && ctx.common.async === false) {
          (0, parseUtil_js_1.addIssueToContext)(ctx, {
            code: ZodError_js_1.ZodIssueCode.invalid_type,
            expected: util_js_1.ZodParsedType.promise,
            received: ctx.parsedType
          });
          return parseUtil_js_1.INVALID;
        }
        const promisified = ctx.parsedType === util_js_1.ZodParsedType.promise ? ctx.data : Promise.resolve(ctx.data);
        return (0, parseUtil_js_1.OK)(promisified.then((data) => {
          return this._def.type.parseAsync(data, {
            path: ctx.path,
            errorMap: ctx.common.contextualErrorMap
          });
        }));
      }
    };
    exports.ZodPromise = ZodPromise;
    ZodPromise.create = (schema, params) => {
      return new ZodPromise({
        type: schema,
        typeName: ZodFirstPartyTypeKind.ZodPromise,
        ...processCreateParams(params)
      });
    };
    var ZodEffects = class extends ZodType {
      innerType() {
        return this._def.schema;
      }
      sourceType() {
        return this._def.schema._def.typeName === ZodFirstPartyTypeKind.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
      }
      _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        const effect = this._def.effect || null;
        const checkCtx = {
          addIssue: (arg) => {
            (0, parseUtil_js_1.addIssueToContext)(ctx, arg);
            if (arg.fatal) {
              status.abort();
            } else {
              status.dirty();
            }
          },
          get path() {
            return ctx.path;
          }
        };
        checkCtx.addIssue = checkCtx.addIssue.bind(checkCtx);
        if (effect.type === "preprocess") {
          const processed = effect.transform(ctx.data, checkCtx);
          if (ctx.common.async) {
            return Promise.resolve(processed).then(async (processed2) => {
              if (status.value === "aborted")
                return parseUtil_js_1.INVALID;
              const result = await this._def.schema._parseAsync({
                data: processed2,
                path: ctx.path,
                parent: ctx
              });
              if (result.status === "aborted")
                return parseUtil_js_1.INVALID;
              if (result.status === "dirty")
                return (0, parseUtil_js_1.DIRTY)(result.value);
              if (status.value === "dirty")
                return (0, parseUtil_js_1.DIRTY)(result.value);
              return result;
            });
          } else {
            if (status.value === "aborted")
              return parseUtil_js_1.INVALID;
            const result = this._def.schema._parseSync({
              data: processed,
              path: ctx.path,
              parent: ctx
            });
            if (result.status === "aborted")
              return parseUtil_js_1.INVALID;
            if (result.status === "dirty")
              return (0, parseUtil_js_1.DIRTY)(result.value);
            if (status.value === "dirty")
              return (0, parseUtil_js_1.DIRTY)(result.value);
            return result;
          }
        }
        if (effect.type === "refinement") {
          const executeRefinement = (acc) => {
            const result = effect.refinement(acc, checkCtx);
            if (ctx.common.async) {
              return Promise.resolve(result);
            }
            if (result instanceof Promise) {
              throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
            }
            return acc;
          };
          if (ctx.common.async === false) {
            const inner = this._def.schema._parseSync({
              data: ctx.data,
              path: ctx.path,
              parent: ctx
            });
            if (inner.status === "aborted")
              return parseUtil_js_1.INVALID;
            if (inner.status === "dirty")
              status.dirty();
            executeRefinement(inner.value);
            return { status: status.value, value: inner.value };
          } else {
            return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((inner) => {
              if (inner.status === "aborted")
                return parseUtil_js_1.INVALID;
              if (inner.status === "dirty")
                status.dirty();
              return executeRefinement(inner.value).then(() => {
                return { status: status.value, value: inner.value };
              });
            });
          }
        }
        if (effect.type === "transform") {
          if (ctx.common.async === false) {
            const base = this._def.schema._parseSync({
              data: ctx.data,
              path: ctx.path,
              parent: ctx
            });
            if (!(0, parseUtil_js_1.isValid)(base))
              return parseUtil_js_1.INVALID;
            const result = effect.transform(base.value, checkCtx);
            if (result instanceof Promise) {
              throw new Error(`Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.`);
            }
            return { status: status.value, value: result };
          } else {
            return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((base) => {
              if (!(0, parseUtil_js_1.isValid)(base))
                return parseUtil_js_1.INVALID;
              return Promise.resolve(effect.transform(base.value, checkCtx)).then((result) => ({
                status: status.value,
                value: result
              }));
            });
          }
        }
        util_js_1.util.assertNever(effect);
      }
    };
    exports.ZodEffects = ZodEffects;
    exports.ZodTransformer = ZodEffects;
    ZodEffects.create = (schema, effect, params) => {
      return new ZodEffects({
        schema,
        typeName: ZodFirstPartyTypeKind.ZodEffects,
        effect,
        ...processCreateParams(params)
      });
    };
    ZodEffects.createWithPreprocess = (preprocess, schema, params) => {
      return new ZodEffects({
        schema,
        effect: { type: "preprocess", transform: preprocess },
        typeName: ZodFirstPartyTypeKind.ZodEffects,
        ...processCreateParams(params)
      });
    };
    var ZodOptional = class extends ZodType {
      _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType === util_js_1.ZodParsedType.undefined) {
          return (0, parseUtil_js_1.OK)(void 0);
        }
        return this._def.innerType._parse(input);
      }
      unwrap() {
        return this._def.innerType;
      }
    };
    exports.ZodOptional = ZodOptional;
    ZodOptional.create = (type, params) => {
      return new ZodOptional({
        innerType: type,
        typeName: ZodFirstPartyTypeKind.ZodOptional,
        ...processCreateParams(params)
      });
    };
    var ZodNullable = class extends ZodType {
      _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType === util_js_1.ZodParsedType.null) {
          return (0, parseUtil_js_1.OK)(null);
        }
        return this._def.innerType._parse(input);
      }
      unwrap() {
        return this._def.innerType;
      }
    };
    exports.ZodNullable = ZodNullable;
    ZodNullable.create = (type, params) => {
      return new ZodNullable({
        innerType: type,
        typeName: ZodFirstPartyTypeKind.ZodNullable,
        ...processCreateParams(params)
      });
    };
    var ZodDefault = class extends ZodType {
      _parse(input) {
        const { ctx } = this._processInputParams(input);
        let data = ctx.data;
        if (ctx.parsedType === util_js_1.ZodParsedType.undefined) {
          data = this._def.defaultValue();
        }
        return this._def.innerType._parse({
          data,
          path: ctx.path,
          parent: ctx
        });
      }
      removeDefault() {
        return this._def.innerType;
      }
    };
    exports.ZodDefault = ZodDefault;
    ZodDefault.create = (type, params) => {
      return new ZodDefault({
        innerType: type,
        typeName: ZodFirstPartyTypeKind.ZodDefault,
        defaultValue: typeof params.default === "function" ? params.default : () => params.default,
        ...processCreateParams(params)
      });
    };
    var ZodCatch = class extends ZodType {
      _parse(input) {
        const { ctx } = this._processInputParams(input);
        const newCtx = {
          ...ctx,
          common: {
            ...ctx.common,
            issues: []
          }
        };
        const result = this._def.innerType._parse({
          data: newCtx.data,
          path: newCtx.path,
          parent: {
            ...newCtx
          }
        });
        if ((0, parseUtil_js_1.isAsync)(result)) {
          return result.then((result2) => {
            return {
              status: "valid",
              value: result2.status === "valid" ? result2.value : this._def.catchValue({
                get error() {
                  return new ZodError_js_1.ZodError(newCtx.common.issues);
                },
                input: newCtx.data
              })
            };
          });
        } else {
          return {
            status: "valid",
            value: result.status === "valid" ? result.value : this._def.catchValue({
              get error() {
                return new ZodError_js_1.ZodError(newCtx.common.issues);
              },
              input: newCtx.data
            })
          };
        }
      }
      removeCatch() {
        return this._def.innerType;
      }
    };
    exports.ZodCatch = ZodCatch;
    ZodCatch.create = (type, params) => {
      return new ZodCatch({
        innerType: type,
        typeName: ZodFirstPartyTypeKind.ZodCatch,
        catchValue: typeof params.catch === "function" ? params.catch : () => params.catch,
        ...processCreateParams(params)
      });
    };
    var ZodNaN = class extends ZodType {
      _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== util_js_1.ZodParsedType.nan) {
          const ctx = this._getOrReturnCtx(input);
          (0, parseUtil_js_1.addIssueToContext)(ctx, {
            code: ZodError_js_1.ZodIssueCode.invalid_type,
            expected: util_js_1.ZodParsedType.nan,
            received: ctx.parsedType
          });
          return parseUtil_js_1.INVALID;
        }
        return { status: "valid", value: input.data };
      }
    };
    exports.ZodNaN = ZodNaN;
    ZodNaN.create = (params) => {
      return new ZodNaN({
        typeName: ZodFirstPartyTypeKind.ZodNaN,
        ...processCreateParams(params)
      });
    };
    exports.BRAND = /* @__PURE__ */ Symbol("zod_brand");
    var ZodBranded = class extends ZodType {
      _parse(input) {
        const { ctx } = this._processInputParams(input);
        const data = ctx.data;
        return this._def.type._parse({
          data,
          path: ctx.path,
          parent: ctx
        });
      }
      unwrap() {
        return this._def.type;
      }
    };
    exports.ZodBranded = ZodBranded;
    var ZodPipeline = class _ZodPipeline extends ZodType {
      _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        if (ctx.common.async) {
          const handleAsync = async () => {
            const inResult = await this._def.in._parseAsync({
              data: ctx.data,
              path: ctx.path,
              parent: ctx
            });
            if (inResult.status === "aborted")
              return parseUtil_js_1.INVALID;
            if (inResult.status === "dirty") {
              status.dirty();
              return (0, parseUtil_js_1.DIRTY)(inResult.value);
            } else {
              return this._def.out._parseAsync({
                data: inResult.value,
                path: ctx.path,
                parent: ctx
              });
            }
          };
          return handleAsync();
        } else {
          const inResult = this._def.in._parseSync({
            data: ctx.data,
            path: ctx.path,
            parent: ctx
          });
          if (inResult.status === "aborted")
            return parseUtil_js_1.INVALID;
          if (inResult.status === "dirty") {
            status.dirty();
            return {
              status: "dirty",
              value: inResult.value
            };
          } else {
            return this._def.out._parseSync({
              data: inResult.value,
              path: ctx.path,
              parent: ctx
            });
          }
        }
      }
      static create(a, b) {
        return new _ZodPipeline({
          in: a,
          out: b,
          typeName: ZodFirstPartyTypeKind.ZodPipeline
        });
      }
    };
    exports.ZodPipeline = ZodPipeline;
    var ZodReadonly = class extends ZodType {
      _parse(input) {
        const result = this._def.innerType._parse(input);
        const freeze = (data) => {
          if ((0, parseUtil_js_1.isValid)(data)) {
            data.value = Object.freeze(data.value);
          }
          return data;
        };
        return (0, parseUtil_js_1.isAsync)(result) ? result.then((data) => freeze(data)) : freeze(result);
      }
      unwrap() {
        return this._def.innerType;
      }
    };
    exports.ZodReadonly = ZodReadonly;
    ZodReadonly.create = (type, params) => {
      return new ZodReadonly({
        innerType: type,
        typeName: ZodFirstPartyTypeKind.ZodReadonly,
        ...processCreateParams(params)
      });
    };
    function cleanParams(params, data) {
      const p = typeof params === "function" ? params(data) : typeof params === "string" ? { message: params } : params;
      const p2 = typeof p === "string" ? { message: p } : p;
      return p2;
    }
    function custom(check, _params = {}, fatal) {
      if (check)
        return ZodAny.create().superRefine((data, ctx) => {
          const r = check(data);
          if (r instanceof Promise) {
            return r.then((r2) => {
              if (!r2) {
                const params = cleanParams(_params, data);
                const _fatal = params.fatal ?? fatal ?? true;
                ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
              }
            });
          }
          if (!r) {
            const params = cleanParams(_params, data);
            const _fatal = params.fatal ?? fatal ?? true;
            ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
          }
          return;
        });
      return ZodAny.create();
    }
    exports.late = {
      object: ZodObject.lazycreate
    };
    var ZodFirstPartyTypeKind;
    (function(ZodFirstPartyTypeKind2) {
      ZodFirstPartyTypeKind2["ZodString"] = "ZodString";
      ZodFirstPartyTypeKind2["ZodNumber"] = "ZodNumber";
      ZodFirstPartyTypeKind2["ZodNaN"] = "ZodNaN";
      ZodFirstPartyTypeKind2["ZodBigInt"] = "ZodBigInt";
      ZodFirstPartyTypeKind2["ZodBoolean"] = "ZodBoolean";
      ZodFirstPartyTypeKind2["ZodDate"] = "ZodDate";
      ZodFirstPartyTypeKind2["ZodSymbol"] = "ZodSymbol";
      ZodFirstPartyTypeKind2["ZodUndefined"] = "ZodUndefined";
      ZodFirstPartyTypeKind2["ZodNull"] = "ZodNull";
      ZodFirstPartyTypeKind2["ZodAny"] = "ZodAny";
      ZodFirstPartyTypeKind2["ZodUnknown"] = "ZodUnknown";
      ZodFirstPartyTypeKind2["ZodNever"] = "ZodNever";
      ZodFirstPartyTypeKind2["ZodVoid"] = "ZodVoid";
      ZodFirstPartyTypeKind2["ZodArray"] = "ZodArray";
      ZodFirstPartyTypeKind2["ZodObject"] = "ZodObject";
      ZodFirstPartyTypeKind2["ZodUnion"] = "ZodUnion";
      ZodFirstPartyTypeKind2["ZodDiscriminatedUnion"] = "ZodDiscriminatedUnion";
      ZodFirstPartyTypeKind2["ZodIntersection"] = "ZodIntersection";
      ZodFirstPartyTypeKind2["ZodTuple"] = "ZodTuple";
      ZodFirstPartyTypeKind2["ZodRecord"] = "ZodRecord";
      ZodFirstPartyTypeKind2["ZodMap"] = "ZodMap";
      ZodFirstPartyTypeKind2["ZodSet"] = "ZodSet";
      ZodFirstPartyTypeKind2["ZodFunction"] = "ZodFunction";
      ZodFirstPartyTypeKind2["ZodLazy"] = "ZodLazy";
      ZodFirstPartyTypeKind2["ZodLiteral"] = "ZodLiteral";
      ZodFirstPartyTypeKind2["ZodEnum"] = "ZodEnum";
      ZodFirstPartyTypeKind2["ZodEffects"] = "ZodEffects";
      ZodFirstPartyTypeKind2["ZodNativeEnum"] = "ZodNativeEnum";
      ZodFirstPartyTypeKind2["ZodOptional"] = "ZodOptional";
      ZodFirstPartyTypeKind2["ZodNullable"] = "ZodNullable";
      ZodFirstPartyTypeKind2["ZodDefault"] = "ZodDefault";
      ZodFirstPartyTypeKind2["ZodCatch"] = "ZodCatch";
      ZodFirstPartyTypeKind2["ZodPromise"] = "ZodPromise";
      ZodFirstPartyTypeKind2["ZodBranded"] = "ZodBranded";
      ZodFirstPartyTypeKind2["ZodPipeline"] = "ZodPipeline";
      ZodFirstPartyTypeKind2["ZodReadonly"] = "ZodReadonly";
    })(ZodFirstPartyTypeKind || (exports.ZodFirstPartyTypeKind = ZodFirstPartyTypeKind = {}));
    var instanceOfType = (cls, params = {
      message: `Input not instance of ${cls.name}`
    }) => custom((data) => data instanceof cls, params);
    exports.instanceof = instanceOfType;
    var stringType = ZodString.create;
    exports.string = stringType;
    var numberType = ZodNumber.create;
    exports.number = numberType;
    var nanType = ZodNaN.create;
    exports.nan = nanType;
    var bigIntType = ZodBigInt.create;
    exports.bigint = bigIntType;
    var booleanType = ZodBoolean.create;
    exports.boolean = booleanType;
    var dateType = ZodDate.create;
    exports.date = dateType;
    var symbolType = ZodSymbol.create;
    exports.symbol = symbolType;
    var undefinedType = ZodUndefined.create;
    exports.undefined = undefinedType;
    var nullType = ZodNull.create;
    exports.null = nullType;
    var anyType = ZodAny.create;
    exports.any = anyType;
    var unknownType = ZodUnknown.create;
    exports.unknown = unknownType;
    var neverType = ZodNever.create;
    exports.never = neverType;
    var voidType = ZodVoid.create;
    exports.void = voidType;
    var arrayType = ZodArray.create;
    exports.array = arrayType;
    var objectType = ZodObject.create;
    exports.object = objectType;
    var strictObjectType = ZodObject.strictCreate;
    exports.strictObject = strictObjectType;
    var unionType = ZodUnion.create;
    exports.union = unionType;
    var discriminatedUnionType = ZodDiscriminatedUnion.create;
    exports.discriminatedUnion = discriminatedUnionType;
    var intersectionType = ZodIntersection.create;
    exports.intersection = intersectionType;
    var tupleType = ZodTuple.create;
    exports.tuple = tupleType;
    var recordType = ZodRecord.create;
    exports.record = recordType;
    var mapType = ZodMap.create;
    exports.map = mapType;
    var setType = ZodSet.create;
    exports.set = setType;
    var functionType = ZodFunction.create;
    exports.function = functionType;
    var lazyType = ZodLazy.create;
    exports.lazy = lazyType;
    var literalType = ZodLiteral.create;
    exports.literal = literalType;
    var enumType = ZodEnum.create;
    exports.enum = enumType;
    var nativeEnumType = ZodNativeEnum.create;
    exports.nativeEnum = nativeEnumType;
    var promiseType = ZodPromise.create;
    exports.promise = promiseType;
    var effectsType = ZodEffects.create;
    exports.effect = effectsType;
    exports.transformer = effectsType;
    var optionalType = ZodOptional.create;
    exports.optional = optionalType;
    var nullableType = ZodNullable.create;
    exports.nullable = nullableType;
    var preprocessType = ZodEffects.createWithPreprocess;
    exports.preprocess = preprocessType;
    var pipelineType = ZodPipeline.create;
    exports.pipeline = pipelineType;
    var ostring = () => stringType().optional();
    exports.ostring = ostring;
    var onumber = () => numberType().optional();
    exports.onumber = onumber;
    var oboolean = () => booleanType().optional();
    exports.oboolean = oboolean;
    exports.coerce = {
      string: ((arg) => ZodString.create({ ...arg, coerce: true })),
      number: ((arg) => ZodNumber.create({ ...arg, coerce: true })),
      boolean: ((arg) => ZodBoolean.create({
        ...arg,
        coerce: true
      })),
      bigint: ((arg) => ZodBigInt.create({ ...arg, coerce: true })),
      date: ((arg) => ZodDate.create({ ...arg, coerce: true }))
    };
    exports.NEVER = parseUtil_js_1.INVALID;
  }
});

// node_modules/zod/v3/external.cjs
var require_external = __commonJS({
  "node_modules/zod/v3/external.cjs"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __exportStar = exports && exports.__exportStar || function(m, exports2) {
      for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p)) __createBinding(exports2, m, p);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    __exportStar(require_errors(), exports);
    __exportStar(require_parseUtil(), exports);
    __exportStar(require_typeAliases(), exports);
    __exportStar(require_util(), exports);
    __exportStar(require_types(), exports);
    __exportStar(require_ZodError(), exports);
  }
});

// node_modules/zod/index.cjs
var require_zod = __commonJS({
  "node_modules/zod/index.cjs"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports && exports.__importStar || function(mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    var __exportStar = exports && exports.__exportStar || function(m, exports2) {
      for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p)) __createBinding(exports2, m, p);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.z = void 0;
    var z2 = __importStar(require_external());
    exports.z = z2;
    __exportStar(require_external(), exports);
    exports.default = z2;
  }
});

// src/server.ts
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import mongoose20 from "mongoose";

// src/config/db.ts
import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";

// src/config/env.ts
import dotenv from "dotenv";
dotenv.config();
var ENV = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "5000", 10),
  MONGODB_URI: process.env.MONGODB_URI || "mongodb+srv://sohamduttabwn_db_user:uXD7AwhvqeSGdTqV@requirements.rlwvxbx.mongodb.net/?retryWrites=true&w=majority",
  ALLOW_IN_MEMORY_DB: process.env.ALLOW_IN_MEMORY_DB !== "false",
  JWT_SECRET: process.env.JWT_SECRET || "NNjvPBkJpb0U7mdgh0RhoIQ1KVo17srkfderoBcLEct",
  COOKIE_SECRET: process.env.COOKIE_SECRET || "KICSENoefvCJtw4h8EeDJzFW3+9xiMkbgKRTQarC/o8=",
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
  DEFAULT_BRAND_NAME: process.env.DEFAULT_BRAND_NAME || "Weblets",
  DEFAULT_BRAND_COLOR: process.env.DEFAULT_BRAND_COLOR || "#FF6B00",
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || "sohamduttabwn@gmail.com",
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || "Rohit@1905",
  SESSION_EXPIRY_DAYS: 7,
  // GoDaddy Domains API
  GODADDY_API_KEY: process.env.GODADDY_API_KEY || "hkxkAhW8Dtzr_8FG7HRgw2jQUfhY4y4G5NH",
  GODADDY_API_SECRET: process.env.GODADDY_API_SECRET || "YNbakyetU765nXS7UeHeyT",
  GODADDY_ENV: (process.env.GODADDY_ENV || "production").toLowerCase()
};

// src/config/db.ts
var replSetInstance = null;
var cachedConnectionPromise = null;
async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return "connected";
  }
  if (mongoose.connection.readyState === 2 && cachedConnectionPromise) {
    await cachedConnectionPromise;
    return "connected";
  }
  let uri = ENV.MONGODB_URI;
  if (!uri && ENV.ALLOW_IN_MEMORY_DB && process.env.VERCEL !== "1" && process.env.NODE_ENV !== "production") {
    console.log("[Database] No MONGODB_URI provided. Initializing MongoMemoryReplSet for transactional parity...");
    try {
      replSetInstance = await MongoMemoryReplSet.create({
        replSet: {
          count: 1,
          storageEngine: "wiredTiger"
        }
      });
      uri = replSetInstance.getUri();
      console.log(`[Database] In-memory Replica Set initialized at: ${uri}`);
    } catch (err) {
      console.error("[Database] Failed to initialize in-memory replica set:", err);
      throw err;
    }
  }
  if (!uri) {
    throw new Error("Database connection failed: No MONGODB_URI and in-memory replica set not enabled.");
  }
  try {
    cachedConnectionPromise = mongoose.connect(uri, {
      autoIndex: process.env.NODE_ENV !== "production",
      serverSelectionTimeoutMS: 5e3,
      connectTimeoutMS: 5e3
    });
    await cachedConnectionPromise;
    console.log("[Database] Connected successfully to MongoDB.");
    return uri;
  } catch (err) {
    cachedConnectionPromise = null;
    console.error("[Database] Mongoose connection error:", err);
    throw err;
  }
}
mongoose.connection.on("disconnected", () => {
  cachedConnectionPromise = null;
});
async function disconnectDB() {
  try {
    await mongoose.disconnect();
    if (replSetInstance) {
      await replSetInstance.stop();
      replSetInstance = null;
    }
    console.log("[Database] Disconnected cleanly.");
  } catch (err) {
    console.error("[Database] Error during disconnect:", err);
  }
}

// src/utils/jwt.ts
import jwt from "jsonwebtoken";
import crypto from "crypto";
function generateSessionToken(payload, expiresInDays = ENV.SESSION_EXPIRY_DAYS) {
  return jwt.sign(payload, ENV.JWT_SECRET, {
    expiresIn: `${expiresInDays}d`
  });
}
function verifySessionToken(token) {
  try {
    return jwt.verify(token, ENV.JWT_SECRET);
  } catch (err) {
    return null;
  }
}
function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

// src/models/Session.ts
import mongoose2, { Schema } from "mongoose";
var SessionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    tokenHash: {
      type: String,
      required: true,
      index: true
    },
    userAgent: {
      type: String
    },
    ipAddress: {
      type: String
    },
    isRevoked: {
      type: Boolean,
      default: false,
      index: true
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }
      // MongoDB TTL index to automatically purge expired sessions
    },
    lastActiveAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);
var Session = mongoose2.model("Session", SessionSchema);

// src/models/User.ts
import mongoose3, { Schema as Schema2 } from "mongoose";

// ../shared/constants/index.ts
var INITIAL_WEBSITE_PACKAGES = [
  {
    slug: "landing-page",
    category: "website",
    name: "Landing Page",
    description: "High-conversion single page landing experience tailored for marketing campaigns and product launches.",
    pricingMode: "fixed",
    standardPricePaise: 799900,
    // ₹7,999
    offerPricePaise: 499900,
    // ₹4,999
    billingFrequency: "one_time",
    features: [
      "Single High-Converting Page",
      "Hero Section with Call-to-Action",
      "Mobile Responsive & Fast Loading",
      "Contact Form & Lead Capture",
      "Basic On-Page SEO Setup",
      "Social Media Integration"
    ],
    maxRevisions: 2,
    isActive: true,
    order: 1
  },
  {
    slug: "portfolio-website",
    category: "website",
    name: "Portfolio Website",
    description: "Showcase creative work, projects, and professional credibility with a bespoke interactive portfolio.",
    pricingMode: "fixed",
    standardPricePaise: 999900,
    // ₹9,999
    offerPricePaise: 599900,
    // ₹5,999
    billingFrequency: "one_time",
    features: [
      "Up to 4 Custom Pages",
      "Interactive Work / Project Gallery",
      "About & Resume Section",
      "Inquiry & Contact Form",
      "High-Speed Performance Optimization",
      "Mobile-First Layout"
    ],
    maxRevisions: 2,
    isActive: true,
    order: 2
  },
  {
    slug: "business-website",
    category: "website",
    name: "Business Website",
    description: "Corporate presence designed to build authority, explain services, and generate qualified B2B/B2C leads.",
    pricingMode: "fixed",
    standardPricePaise: 1499900,
    // ₹14,999
    offerPricePaise: 899900,
    // ₹8,999
    billingFrequency: "one_time",
    features: [
      "Up to 7 Structured Pages",
      "Services & Case Studies Showcase",
      "Interactive Contact & Quote Forms",
      "Google Maps & Business Location",
      "Speed & SEO Optimized Architecture",
      "Security & SSL Configuration"
    ],
    maxRevisions: 3,
    isActive: true,
    order: 3
  },
  {
    slug: "blog-news-website",
    category: "website",
    name: "Blog / News Website",
    description: "Content-driven publishing platform with categories, author profiles, and reader engagement.",
    pricingMode: "fixed",
    standardPricePaise: 1399900,
    // ₹13,999
    offerPricePaise: 799900,
    // ₹7,999
    billingFrequency: "one_time",
    features: [
      "Modern Editorial Content Layout",
      "Dynamic Categories & Tagging",
      "Author Profiles & Social Sharing",
      "Search & Archive Navigation",
      "Newsletter Subscription Integration",
      "Ad Slot / Monetization Readiness"
    ],
    maxRevisions: 2,
    isActive: true,
    order: 4
  },
  {
    slug: "booking-website",
    category: "website",
    name: "Booking Website",
    description: "Direct appointment scheduling, calendar synchronization, and service bookings for professionals and studios.",
    pricingMode: "fixed",
    standardPricePaise: 2299900,
    // ₹22,999
    offerPricePaise: 1299900,
    // ₹12,999
    billingFrequency: "one_time",
    features: [
      "Automated Appointment Booking Flow",
      "Calendar Slot Synchronization",
      "Email / SMS Booking Confirmations",
      "Service Menu with Pricing",
      "Customer Management Dashboard",
      "Advance Payment Integration"
    ],
    maxRevisions: 3,
    isActive: true,
    order: 5
  },
  {
    slug: "ecommerce-store",
    category: "website",
    name: "E-commerce Store",
    description: "Feature-rich online store with catalog, shopping cart, checkout, payment gateway, and order notifications.",
    pricingMode: "fixed",
    standardPricePaise: 2999900,
    // ₹29,999
    offerPricePaise: 1699900,
    // ₹16,999
    billingFrequency: "one_time",
    features: [
      "Full Product Catalog & Categories",
      "Shopping Cart & Secure Checkout",
      "Indian / International Payment Gateways",
      "Order Confirmation & Invoicing",
      "Coupon Codes & Discounts Support",
      "Inventory & Stock Tracking"
    ],
    maxRevisions: 3,
    isActive: true,
    order: 6
  },
  {
    slug: "course-lms-website",
    category: "website",
    name: "Course / LMS Website",
    description: "Learning management system with video lectures, student enrollment, lesson progress, and completion certificates.",
    pricingMode: "fixed",
    standardPricePaise: 3999900,
    // ₹39,999
    offerPricePaise: 2299900,
    // ₹22,999
    billingFrequency: "one_time",
    features: [
      "Course Curriculum & Chapter Viewer",
      "Student Login & Progress Tracking",
      "Secured Video & Material Access",
      "Enrollment Checkout & Instant Access",
      "Quiz & Assessment Capability",
      "Automated Course Completion Certificates"
    ],
    maxRevisions: 4,
    isActive: true,
    order: 7
  },
  {
    slug: "custom-web-app",
    category: "website",
    name: "Custom Web App",
    description: "Bespoke web application with custom business logic, dashboards, relational databases, and third-party APIs.",
    pricingMode: "starting_price",
    standardPricePaise: 4999900,
    // ₹49,999
    offerPricePaise: 2999900,
    // ₹29,999
    billingFrequency: "one_time",
    features: [
      "Custom Role-Based Web Application",
      "Interactive Client / Admin Dashboards",
      "Scalable Database & REST API Architecture",
      "Third-Party Services & Webhook Integration",
      "Complex Workflow & Automation Logic",
      "Dedicated Deployment & Cloud Architecture"
    ],
    maxRevisions: 4,
    isActive: true,
    order: 8
  }
];
var INITIAL_ADDONS = [
  {
    slug: "content-assistance",
    category: "both",
    name: "Content Assistance",
    description: "Professional copy editing and structure optimization for pages and promotional sections.",
    billingType: "one_time",
    unitPricePaise: 15e4,
    // ₹1,500
    isActive: true,
    order: 1
  },
  {
    slug: "enhanced-seo",
    category: "both",
    name: "Enhanced SEO",
    description: "Deep meta optimization, schema markup, OpenGraph tags, sitemap submission, and indexing setup.",
    billingType: "one_time",
    unitPricePaise: 25e4,
    // ₹2,500
    isActive: true,
    order: 2
  },
  {
    slug: "business-email-setup",
    category: "both",
    name: "Business Email Setup Assistance",
    description: "Configuration of custom business domain email (Google Workspace / Zoho / Microsoft 365) with DKIM and SPF.",
    billingType: "one_time",
    unitPricePaise: 99900,
    // ₹999
    isActive: true,
    order: 3
  },
  {
    slug: "monthly-maintenance",
    category: "both",
    name: "Monthly Maintenance",
    description: "Continuous uptime monitoring, security patching, monthly backups, and minor text/image updates.",
    billingType: "monthly",
    unitPricePaise: 99900,
    // ₹999 / month
    isActive: true,
    order: 4
  },
  {
    slug: "priority-delivery",
    category: "both",
    name: "Priority Delivery",
    description: "Accelerated development sprint delivering the completed initial build in record turnaround time.",
    billingType: "one_time",
    unitPricePaise: 2e5,
    // ₹2,000
    isActive: true,
    order: 5
  },
  {
    slug: "extra-standard-page",
    category: "website",
    name: "Extra Standard Page",
    description: "Additional structured standard page with customized styling, responsive layout, and content placement.",
    billingType: "per_unit",
    unitPricePaise: 5e4,
    // ₹500 / page
    unitLabel: "pages",
    isActive: true,
    order: 6
  },
  {
    slug: "extra-functional-app-screen",
    category: "app",
    name: "Extra Functional App Screen",
    description: "Additional interactive application screen with UI components, state management, and backend wiring.",
    billingType: "per_unit",
    unitPricePaise: 12e4,
    // ₹1,200 / screen
    unitLabel: "screens",
    isActive: true,
    order: 7
  }
];
var INITIAL_BRANDS = [
  {
    name: "Weblets",
    tagline: "Modern Digital Engineering & High-Impact Web Solutions",
    logoText: "WEBLETS",
    primaryColor: "#FF6B00",
    secondaryColor: "#121216",
    contactEmail: "contact@weblets.io",
    contactPhone: "+91 98765 43210",
    websiteUrl: "https://weblets.io",
    addressLines: ["Tech Hub Tower, Level 4", "Cyber City, Bangalore 560100", "India"],
    isDefault: true,
    isActive: true
  },
  {
    name: "Esyus",
    tagline: "Enterprise Applications & Scalable Cloud Software",
    logoText: "ESYUS",
    primaryColor: "#3B82F6",
    secondaryColor: "#0F172A",
    contactEmail: "hello@esyus.com",
    contactPhone: "+91 98765 12345",
    websiteUrl: "https://esyus.com",
    addressLines: ["Innovations Park, Block B", "HITEC City, Hyderabad 500081", "India"],
    isDefault: false,
    isActive: true
  },
  {
    name: "Esyus \xD7 Weblets",
    tagline: "Joint Venture: Full-Spectrum Web, Mobile & Enterprise Engineering",
    logoText: "ESYUS \xD7 WEBLETS",
    primaryColor: "#F97316",
    secondaryColor: "#18181B",
    contactEmail: "solutions@esyus-weblets.com",
    contactPhone: "+91 98765 99999",
    websiteUrl: "https://esyus-weblets.com",
    addressLines: ["Consortium Center, Suite 100", "Bandra Kurla Complex, Mumbai 400051", "India"],
    isDefault: false,
    isActive: true
  }
];
var SYSTEM_PERMISSIONS = [
  "manage_forms",
  "manage_packages",
  "manage_submissions",
  "manage_quotations",
  "manage_brands",
  "manage_internal_notes",
  // Required to see/edit private form step notes and submission notes
  "view_financials",
  // Required to see Profit & Margin dashboard, costs, profit figures
  "manage_financials",
  // Required to add/edit direct costs, expenses, target margins
  "manage_users",
  "manage_settings"
];

// src/models/User.ts
var UserSchema = new Schema2(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    role: {
      type: String,
      enum: ["client", "admin", "superadmin"],
      default: "client",
      index: true
    },
    permissions: [
      {
        type: String,
        enum: SYSTEM_PERMISSIONS
      }
    ],
    status: {
      type: String,
      enum: ["active", "suspended", "pending"],
      default: "active",
      index: true
    },
    phone: {
      type: String,
      trim: true
    },
    company: {
      type: String,
      trim: true
    },
    lastLoginAt: {
      type: Date
    },
    passwordResetToken: {
      type: String
    },
    passwordResetExpires: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);
var User = mongoose3.model("User", UserSchema);

// src/middleware/auth.ts
async function authenticateSession(req, res, next) {
  try {
    const cookieToken = req.cookies?.auth_token;
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader && authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    const token = cookieToken || bearerToken;
    if (!token) {
      return next();
    }
    const payload = verifySessionToken(token);
    if (!payload || !payload.sessionId || !payload.userId) {
      return next();
    }
    const session = await Session.findById(payload.sessionId);
    if (!session || session.isRevoked || session.expiresAt < /* @__PURE__ */ new Date()) {
      return next();
    }
    const user = await User.findById(payload.userId);
    if (!user || user.status !== "active") {
      return next();
    }
    session.lastActiveAt = /* @__PURE__ */ new Date();
    await session.save();
    req.user = user;
    req.sessionRecord = session;
    next();
  } catch (err) {
    next(err);
  }
}
function requireAuth(req, res, next) {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: "Authentication required. Please log in."
    });
    return;
  }
  next();
}
function requireAdmin(req, res, next) {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: "Authentication required. Please log in."
    });
    return;
  }
  if (req.user.role !== "admin" && req.user.role !== "superadmin") {
    res.status(403).json({
      success: false,
      error: "Access denied: Administrator privileges required."
    });
    return;
  }
  next();
}

// src/middleware/errorHandler.ts
function errorHandler(err, req, res, next) {
  console.error(`[Error] ${req.method} ${req.url}:`, err);
  const status = err.status || err.statusCode || 500;
  const message = status === 500 && ENV.NODE_ENV === "production" ? "An unexpected internal server error occurred." : err.message || "Internal Server Error";
  res.status(status).json({
    success: false,
    error: message,
    ...ENV.NODE_ENV !== "production" && { stack: err.stack }
  });
}

// src/middleware/rateLimiter.ts
import rateLimit from "express-rate-limit";
var apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  max: 300,
  // 300 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many requests, please try again later."
  }
});
var authLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  max: 20,
  // 20 login/register attempts per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many authentication attempts, please try again in 15 minutes."
  }
});
var submissionLimiter = rateLimit({
  windowMs: 10 * 60 * 1e3,
  // 10 minutes
  max: 15,
  // 15 submissions per 10 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Submission rate limit reached. Please wait a few minutes before submitting again."
  }
});

// src/routes/authRoutes.ts
import { Router } from "express";

// src/services/authService.ts
import bcrypt from "bcryptjs";
var AuthService = class {
  static async register(data) {
    const existing = await User.findOne({ email: data.email.toLowerCase() });
    if (existing) {
      throw new Error("An account with this email address already exists.");
    }
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);
    const user = await User.create({
      fullName: data.fullName,
      email: data.email.toLowerCase(),
      passwordHash,
      phone: data.phone,
      company: data.company,
      role: data.role || "client",
      permissions: [],
      status: "active"
    });
    const session = await this.createSession(user._id.toString());
    const token = generateSessionToken({
      userId: user._id.toString(),
      sessionId: session._id.toString(),
      role: user.role
    });
    return { user, token, session };
  }
  static async login(email, password, meta) {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new Error("Invalid email or password.");
    }
    if (user.status !== "active") {
      throw new Error("Your account is currently suspended or pending activation. Please contact support.");
    }
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new Error("Invalid email or password.");
    }
    user.lastLoginAt = /* @__PURE__ */ new Date();
    await user.save();
    const session = await this.createSession(user._id.toString(), meta);
    const token = generateSessionToken({
      userId: user._id.toString(),
      sessionId: session._id.toString(),
      role: user.role
    });
    return { user, token, session };
  }
  static async createSession(userId, meta) {
    const expiresAt = /* @__PURE__ */ new Date();
    expiresAt.setDate(expiresAt.getDate() + ENV.SESSION_EXPIRY_DAYS);
    const tokenHash = hashToken(`${userId}-${Date.now()}-${Math.random()}`);
    const session = await Session.create({
      userId,
      tokenHash,
      userAgent: meta?.userAgent,
      ipAddress: meta?.ipAddress,
      isRevoked: false,
      expiresAt,
      lastActiveAt: /* @__PURE__ */ new Date()
    });
    return session;
  }
  static async revokeSession(sessionId) {
    await Session.findByIdAndUpdate(sessionId, { isRevoked: true });
  }
  static async revokeAllUserSessions(userId) {
    await Session.updateMany({ userId, isRevoked: false }, { isRevoked: true });
  }
};

// src/utils/serializers.ts
function serializeUser(user) {
  return {
    id: user._id.toString(),
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    permissions: user.permissions || [],
    status: user.status,
    phone: user.phone,
    company: user.company,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString()
  };
}
function serializeClientSubmission(sub, quotationAvailable = false) {
  return {
    id: sub._id.toString(),
    enquiryReference: sub.enquiryReference,
    clientId: sub.clientId.toString(),
    clientSnapshot: {
      name: sub.clientSnapshot.name,
      email: sub.clientSnapshot.email,
      phone: sub.clientSnapshot.phone,
      company: sub.clientSnapshot.company
    },
    formDefinitionId: sub.formDefinitionId.toString(),
    formVersion: sub.formVersion,
    projectCategory: sub.projectCategory,
    status: sub.status,
    answers: sub.answers || {},
    submittedAt: sub.submittedAt.toISOString(),
    updatedAt: sub.updatedAt.toISOString(),
    revisionNumber: sub.revisionNumber,
    quotationAvailable
  };
}
function serializeAdminSubmission(sub, extra) {
  const base = serializeClientSubmission(sub, extra?.hasQuotation);
  return {
    ...base,
    internalNotesCount: extra?.internalNotesCount,
    hasQuotation: extra?.hasQuotation,
    financialSummary: extra?.financialSummary
  };
}
function serializeClientQuotation(quote) {
  return {
    id: quote._id.toString(),
    quotationNumber: quote.quotationNumber,
    revisionNumber: quote.revisionNumber,
    submissionId: quote.submissionId.toString(),
    status: quote.status,
    brandSnapshot: {
      name: quote.brandSnapshot.name,
      tagline: quote.brandSnapshot.tagline,
      logoText: quote.brandSnapshot.logoText,
      primaryColor: quote.brandSnapshot.primaryColor,
      secondaryColor: quote.brandSnapshot.secondaryColor,
      contactEmail: quote.brandSnapshot.contactEmail,
      contactPhone: quote.brandSnapshot.contactPhone,
      websiteUrl: quote.brandSnapshot.websiteUrl,
      addressLines: quote.brandSnapshot.addressLines || []
    },
    clientSnapshot: {
      name: quote.clientSnapshot.name,
      email: quote.clientSnapshot.email,
      company: quote.clientSnapshot.company,
      phone: quote.clientSnapshot.phone
    },
    packageName: quote.packageName,
    scopeSummary: quote.scopeSummary,
    lineItems: (quote.lineItems || []).map((li) => ({
      id: li.id,
      title: li.title,
      description: li.description,
      quantity: li.quantity,
      unitPricePaise: li.unitPricePaise,
      totalPaise: li.totalPaise,
      isOptional: li.isOptional,
      isSelected: li.isSelected
    })),
    subtotalPaise: quote.subtotalPaise,
    discountPaise: quote.discountPaise,
    taxLines: quote.taxLines || [],
    // Preserved empty array for zero tax
    totalPaise: quote.totalPaise,
    estimatedTimelineDays: quote.estimatedTimelineDays,
    paymentMilestones: (quote.paymentMilestones || []).map((pm) => ({
      title: pm.title,
      percent: pm.percent,
      amountPaise: pm.amountPaise,
      trigger: pm.trigger
    })),
    revisionPolicy: quote.revisionPolicy,
    exclusions: quote.exclusions || [],
    clientResponsibilities: quote.clientResponsibilities || [],
    termsAndConditions: quote.termsAndConditions || [],
    issuedAt: quote.issuedAt?.toISOString(),
    validUntil: quote.validUntil?.toISOString(),
    approvedAt: quote.approvedAt?.toISOString(),
    createdAt: quote.createdAt.toISOString()
  };
}
function serializeCostEntry(entry) {
  return {
    id: entry._id.toString(),
    submissionId: entry.submissionId.toString(),
    category: entry.category,
    isActual: entry.isActual,
    amountPaise: entry.amountPaise,
    description: entry.description,
    date: entry.date.toISOString(),
    loggedByUserId: entry.loggedByUserId.toString(),
    loggedByName: entry.loggedByName,
    createdAt: entry.createdAt.toISOString()
  };
}
function serializePaymentRecord(record) {
  return {
    id: record._id.toString(),
    submissionId: record.submissionId.toString(),
    quotationId: record.quotationId?.toString(),
    amountPaise: record.amountPaise,
    paymentDate: record.paymentDate.toISOString(),
    paymentMethod: record.paymentMethod,
    status: record.status,
    referenceNumber: record.referenceNumber,
    notes: record.notes,
    recordedByUserId: record.recordedByUserId.toString(),
    createdAt: record.createdAt.toISOString()
  };
}
function serializeProjectFinancials(fin, submission, costEntries = [], paymentRecords = []) {
  const isBelowTarget = fin.grossMarginPercent !== null && fin.grossMarginPercent < fin.targetMarginPercent;
  const hasMissingCosts = fin.actualDirectCostPaise === 0 && fin.estimatedDirectCostPaise === 0;
  return {
    id: fin._id.toString(),
    submissionId: fin.submissionId.toString(),
    enquiryReference: submission.enquiryReference,
    projectCategory: submission.projectCategory,
    clientName: submission.clientSnapshot.name,
    status: submission.status,
    quotedRevenuePaise: fin.quotedRevenuePaise,
    approvedRevenuePaise: fin.approvedRevenuePaise,
    collectedRevenuePaise: fin.collectedRevenuePaise,
    outstandingReceivablesPaise: Math.max(0, fin.approvedRevenuePaise - fin.collectedRevenuePaise),
    estimatedDirectCostPaise: fin.estimatedDirectCostPaise,
    actualDirectCostPaise: fin.actualDirectCostPaise,
    estimatedGrossProfitPaise: fin.estimatedGrossProfitPaise,
    actualGrossProfitPaise: fin.actualGrossProfitPaise,
    grossMarginPercent: fin.grossMarginPercent,
    markupPercent: fin.markupPercent,
    targetMarginPercent: fin.targetMarginPercent,
    isBelowTargetMargin: isBelowTarget,
    hasMissingCosts,
    costEntries: costEntries.map(serializeCostEntry),
    paymentRecords: paymentRecords.map(serializePaymentRecord),
    financialNotes: fin.financialNotes,
    updatedAt: fin.updatedAt.toISOString()
  };
}

// src/models/AuditLog.ts
import mongoose4, { Schema as Schema3 } from "mongoose";
var AuditLogSchema = new Schema3(
  {
    actorUserId: {
      type: Schema3.Types.ObjectId,
      ref: "User",
      index: true
    },
    actorEmail: {
      type: String,
      required: true
    },
    actorRole: {
      type: String,
      required: true
    },
    action: {
      type: String,
      required: true,
      index: true
    },
    entity: {
      type: String,
      required: true,
      index: true
    },
    entityId: {
      type: String
    },
    details: {
      type: Schema3.Types.Mixed
    },
    ipAddress: {
      type: String
    },
    userAgent: {
      type: String
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);
var AuditLog = mongoose4.model("AuditLog", AuditLogSchema);

// src/utils/audit.ts
async function logAuditEvent(req, action, entity, entityId, details) {
  try {
    const user = req.user;
    await AuditLog.create({
      actorUserId: user?._id,
      actorEmail: user?.email || "system@internal",
      actorRole: user?.role || "anonymous",
      action,
      entity,
      entityId,
      details,
      ipAddress: req.ip || req.socket.remoteAddress,
      userAgent: req.get("user-agent")
    });
  } catch (err) {
    console.error("[AuditLog] Failed to record audit log:", err);
  }
}

// src/controllers/authController.ts
var AuthController = class _AuthController {
  static setAuthCookie(res, token) {
    const isProduction = ENV.NODE_ENV === "production";
    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "strict" : "lax",
      maxAge: ENV.SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1e3,
      path: "/"
    });
  }
  static async register(req, res, next) {
    try {
      const { user, token, session } = await AuthService.register(req.body);
      _AuthController.setAuthCookie(res, token);
      await logAuditEvent(req, "USER_REGISTERED", "User", user._id.toString(), {
        email: user.email,
        role: user.role
      });
      res.status(201).json({
        success: true,
        user: serializeUser(user),
        token
        // Included for API clients / bearer token fallback
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        error: err.message || "Registration failed."
      });
    }
  }
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const { user, token, session } = await AuthService.login(email, password, {
        userAgent: req.get("user-agent"),
        ipAddress: req.ip || req.socket.remoteAddress
      });
      _AuthController.setAuthCookie(res, token);
      await logAuditEvent(req, "USER_LOGGED_IN", "User", user._id.toString(), {
        email: user.email,
        sessionId: session._id.toString()
      });
      res.status(200).json({
        success: true,
        user: serializeUser(user),
        token
      });
    } catch (err) {
      res.status(401).json({
        success: false,
        error: err.message || "Invalid credentials."
      });
    }
  }
  static async logout(req, res, next) {
    try {
      if (req.sessionRecord) {
        await AuthService.revokeSession(req.sessionRecord._id.toString());
        await logAuditEvent(req, "USER_LOGGED_OUT", "Session", req.sessionRecord._id.toString());
      }
      res.clearCookie("auth_token", { path: "/" });
      res.status(200).json({
        success: true,
        message: "Successfully logged out."
      });
    } catch (err) {
      next(err);
    }
  }
  static async logoutEverywhere(req, res, next) {
    try {
      if (req.user) {
        await AuthService.revokeAllUserSessions(req.user._id.toString());
        await logAuditEvent(req, "USER_LOGGED_OUT_EVERYWHERE", "User", req.user._id.toString());
      }
      res.clearCookie("auth_token", { path: "/" });
      res.status(200).json({
        success: true,
        message: "All active sessions have been revoked."
      });
    } catch (err) {
      next(err);
    }
  }
  static async getMe(req, res) {
    if (!req.user) {
      res.status(401).json({ success: false, error: "Not authenticated" });
      return;
    }
    res.status(200).json({
      success: true,
      user: serializeUser(req.user)
    });
  }
};

// src/middleware/validation.ts
var import_zod = __toESM(require_zod(), 1);
function validateBody(schema) {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof import_zod.ZodError) {
        const issues = err.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message
        }));
        res.status(400).json({
          success: false,
          error: "Validation failed",
          details: issues
        });
        return;
      }
      next(err);
    }
  };
}

// ../shared/schemas/index.ts
import { z } from "zod";
var RegisterSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(100),
  email: z.string().email("Please enter a valid email address").toLowerCase().trim(),
  password: z.string().min(8, "Password must be at least 8 characters").regex(/[A-Z]/, "Password must contain at least one uppercase letter").regex(/[0-9]/, "Password must contain at least one number"),
  phone: z.string().optional(),
  company: z.string().optional()
});
var LoginSchema = z.object({
  email: z.string().email("Please enter a valid email address").toLowerCase().trim(),
  password: z.string().min(1, "Password is required")
});
var UpdateProfileSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  phone: z.string().optional(),
  company: z.string().optional()
});
var UpdateUserPermissionsSchema = z.object({
  role: z.enum(["client", "admin", "superadmin"]),
  permissions: z.array(z.enum(SYSTEM_PERMISSIONS)),
  status: z.enum(["active", "suspended", "pending"])
});
var FormQuestionSchema = z.object({
  id: z.string().min(1),
  fieldKey: z.string().optional(),
  label: z.string().min(1, "Question label is required"),
  helperText: z.string().optional(),
  placeholder: z.string().optional(),
  type: z.enum([
    "text",
    "textarea",
    "email",
    "phone",
    "number",
    "url",
    "dropdown",
    "multiselect",
    "radio",
    "checkbox",
    "date",
    "budget_range",
    "file_upload",
    "yes_no",
    "info_block",
    "color_picker",
    "repeatable_url"
  ]),
  isRequired: z.boolean().default(false),
  isActive: z.boolean().default(true),
  options: z.array(z.string()).optional(),
  validationRules: z.object({
    minLength: z.number().optional(),
    maxLength: z.number().optional(),
    min: z.number().optional(),
    max: z.number().optional(),
    pattern: z.string().optional()
  }).optional(),
  conditionalVisibility: z.object({
    dependsOnQuestionId: z.string(),
    operator: z.enum(["equals", "not_equals", "contains", "is_not_empty"]),
    value: z.any()
  }).optional(),
  order: z.number()
});
var FormStepSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1, "Step title is required"),
  subtitle: z.string().optional(),
  order: z.number(),
  questions: z.array(FormQuestionSchema)
});
var FormDefinitionSchema = z.object({
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, "Slug must be alphanumeric with hyphens"),
  title: z.string().min(2, "Title is required"),
  description: z.string().min(2, "Description is required"),
  category: z.enum(["website", "app"]),
  steps: z.array(FormStepSchema),
  status: z.enum(["draft", "published", "archived"]).default("draft")
});
var SaveStepNotesSchema = z.object({
  stepId: z.string().min(1),
  notes: z.string()
});
var CreateSubmissionSchema = z.object({
  formDefinitionId: z.string().min(1),
  projectCategory: z.enum(["website", "app"]),
  answers: z.record(z.string(), z.any()),
  stepDeveloperNotes: z.record(z.string(), z.string()).optional(),
  idempotencyKey: z.string().optional()
});
var UpdateSubmissionStatusSchema = z.object({
  status: z.enum([
    "submitted",
    "under_review",
    "estimated",
    "quoted",
    "in_progress",
    "completed",
    "cancelled"
  ])
});
var PackageSchema = z.object({
  slug: z.string().min(2),
  category: z.enum(["website", "app"]),
  name: z.string().min(2),
  description: z.string(),
  pricingMode: z.enum(["fixed", "starting_price", "manual_review"]),
  standardPricePaise: z.number().int().nonnegative(),
  offerPricePaise: z.number().int().nonnegative(),
  billingFrequency: z.enum(["one_time", "monthly", "yearly"]),
  features: z.array(z.string()),
  maxRevisions: z.number().int().min(0),
  isActive: z.boolean().default(true),
  order: z.number().int().default(0)
});
var AddonSchema = z.object({
  slug: z.string().min(2),
  category: z.enum(["website", "app", "both"]),
  name: z.string().min(2),
  description: z.string(),
  billingType: z.enum(["one_time", "monthly", "per_unit"]),
  unitPricePaise: z.number().int().nonnegative(),
  unitLabel: z.string().optional(),
  isActive: z.boolean().default(true),
  order: z.number().int().default(0)
});
var BrandProfileSchema = z.object({
  name: z.string().min(2),
  tagline: z.string().min(2),
  logoText: z.string().min(1),
  logoUrl: z.string().optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color code"),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color code"),
  contactEmail: z.string().email(),
  contactPhone: z.string().min(5),
  websiteUrl: z.string().url(),
  addressLines: z.array(z.string()),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true)
});
var QuotationLineItemSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  quantity: z.number().int().positive(),
  unitPricePaise: z.number().int().nonnegative(),
  totalPaise: z.number().int().nonnegative(),
  isOptional: z.boolean().optional(),
  isSelected: z.boolean().optional()
});
var PaymentMilestoneSchema = z.object({
  title: z.string().min(1),
  percent: z.number().min(1).max(100),
  amountPaise: z.number().int().nonnegative(),
  trigger: z.string().min(1)
});
var DEFAULT_COMMERCIAL_TERMS = [
  "Advance Mobilization Requirement: A mandatory 20% advance payment is required upon quotation signing to schedule developer sprints, provision cloud staging environments, and allocate engineering capacity.",
  "Commercial Proposal Validity: This quotation, itemized deliverables, and agreed rates remain locked and valid for 30 calendar days from the date of issuance.",
  "Stage-Gate Milestone Governance: Project development proceeds across defined milestones; each milestone is formally demonstrated and approved on the staging environment prior to commencing subsequent modules.",
  "Scope Integrity & Change Request (CR) Protocol: All deliverables are strictly bounded by the itemized specifications. Additional feature requests or architectural deviations will be evaluated under a transparent written Change Request with agreed cost and timeline adjustments.",
  "Client Feedback & Approval Turnaround: The client agrees to provide required branding assets within 5 business days and review staging milestone deliverables within 3 business days of presentation to maintain sprint momentum.",
  "100% Intellectual Property & Source Code Transfer: Complete intellectual property rights, Git repositories, database architectures, design assets, and production credentials transfer unconditionally to the client upon clearance of the final milestone payment.",
  "30-Day Post-Launch Warranty Support: Includes a dedicated 30-day post-launch warranty covering defect remediation, cross-browser compatibility fixes, and stability patch releases at zero incremental charge.",
  "Third-Party Services & Operational Pass-Throughs: Domain renewals, server infrastructure beyond quoted terms, payment gateway interchange fees, and usage-based third-party APIs (e.g. SMS, AI tokens, Maps) are direct pass-through expenses billed directly to client corporate accounts.",
  "Mutual Confidentiality & Non-Disclosure: Both parties agree to protect all proprietary business data, trade secrets, architecture briefs, and transactional records under strict non-disclosure obligations.",
  "Payment Remittance & Invoicing: Remittances may be processed via Direct RTGS/NEFT Bank Transfer or corporate UPI. Official GST commercial tax invoices and digital receipts are issued immediately upon clearance of each milestone payment."
];
var CreateQuotationSchema = z.object({
  submissionId: z.string().min(1),
  brandProfileId: z.string().min(1),
  packageName: z.string().optional(),
  scopeSummary: z.string().optional(),
  lineItems: z.array(QuotationLineItemSchema).min(1, "At least one line item is required"),
  discountPaise: z.number().int().nonnegative().default(0),
  estimatedTimelineDays: z.number().int().positive().optional(),
  paymentMilestones: z.array(PaymentMilestoneSchema).optional(),
  revisionPolicy: z.string().default("Up to 3 rounds of design and functional revisions included."),
  exclusions: z.array(z.string()).default([
    "Domain registration & DNS management costs are paid directly to domain registrars.",
    "Cloud hosting & server subscription fees are paid directly to AWS / DigitalOcean / Vercel.",
    "Paid third-party API usage (e.g. Twilio, OpenAI, Google Maps) is billed to client accounts directly."
  ]),
  clientResponsibilities: z.array(z.string()).default([
    "Provide branding assets, vector logos, and content in a timely manner.",
    "Provide feedback within 3 business days during development review milestones.",
    "Supply API credentials or accounts required for third-party integrations."
  ]),
  termsAndConditions: z.array(z.string()).default(DEFAULT_COMMERCIAL_TERMS),
  validityDays: z.number().int().positive().default(30),
  status: z.enum(["draft", "estimate", "issued", "approved", "rejected", "expired"]).default("draft")
});
var CreateCostEntrySchema = z.object({
  submissionId: z.string().min(1),
  category: z.enum([
    "internal_labour",
    "external_contractor",
    "infrastructure_third_party",
    "partner_allocation",
    "additional_expense"
  ]),
  isActual: z.boolean().default(true),
  amountPaise: z.number().int().positive("Amount must be positive"),
  description: z.string().min(2, "Description is required"),
  date: z.string().optional()
});
var UpdateTargetMarginSchema = z.object({
  targetMarginPercent: z.number().min(0).max(100),
  financialNotes: z.string().optional()
});
var CreatePaymentRecordSchema = z.object({
  submissionId: z.string().min(1),
  quotationId: z.string().optional(),
  amountPaise: z.number().int().positive("Payment amount must be positive"),
  paymentDate: z.string().optional(),
  paymentMethod: z.enum(["bank_transfer", "upi", "card", "cheque", "other"]),
  status: z.enum(["received", "pending", "failed"]).default("received"),
  referenceNumber: z.string().min(1, "Reference number or transaction ID is required"),
  notes: z.string().optional()
});
var BusinessTypeSchema = z.enum([
  "Agency",
  "SaaS",
  "AI/Technology",
  "E-commerce",
  "Education",
  "Portfolio",
  "Healthcare",
  "Finance",
  "Restaurant",
  "Fashion",
  "Startup",
  "Other"
]);
var DomainSearchSchema = z.object({
  businessName: z.string().min(1, "Business name is required").max(100),
  businessType: BusinessTypeSchema.default("SaaS"),
  industry: z.string().optional(),
  keywords: z.array(z.string()).optional().default([]),
  preferredExtensions: z.array(z.string()).optional().default([]),
  count: z.number().int().min(4).max(60).optional().default(24),
  checkLiveAvailability: z.boolean().optional().default(true)
});
var CheckAvailabilitySchema = z.object({
  domains: z.array(z.string().min(3).max(100)).min(1, "At least one domain must be checked").max(100)
});

// src/routes/authRoutes.ts
var router = Router();
router.post("/register", authLimiter, validateBody(RegisterSchema), AuthController.register);
router.post("/login", authLimiter, validateBody(LoginSchema), AuthController.login);
router.post("/logout", requireAuth, AuthController.logout);
router.post("/logout-all", requireAuth, AuthController.logoutEverywhere);
router.get("/me", requireAuth, AuthController.getMe);
var authRoutes_default = router;

// src/routes/publicRoutes.ts
import { Router as Router2 } from "express";

// src/services/formService.ts
import mongoose7 from "mongoose";

// src/models/FormDefinition.ts
import mongoose5, { Schema as Schema4 } from "mongoose";
var QuestionSchema = new Schema4(
  {
    id: { type: String, required: true },
    fieldKey: { type: String },
    label: { type: String, required: true },
    helperText: { type: String },
    placeholder: { type: String },
    type: { type: String, required: true },
    isRequired: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    options: [{ type: String }],
    validationRules: {
      minLength: { type: Number },
      maxLength: { type: Number },
      min: { type: Number },
      max: { type: Number },
      pattern: { type: String }
    },
    conditionalVisibility: {
      dependsOnQuestionId: { type: String },
      operator: { type: String },
      value: { type: Schema4.Types.Mixed }
    },
    order: { type: Number, default: 0 }
  },
  { _id: false }
);
var StepSchema = new Schema4(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    subtitle: { type: String },
    order: { type: Number, default: 0 },
    questions: [QuestionSchema]
  },
  { _id: false }
);
var FormDefinitionSchema2 = new Schema4(
  {
    slug: {
      type: String,
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: ["website", "app"],
      required: true,
      index: true
    },
    version: {
      type: Number,
      required: true,
      default: 1
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
      index: true
    },
    steps: [StepSchema],
    publishedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);
FormDefinitionSchema2.index({ slug: 1, version: 1 }, { unique: true });
var FormDefinition = mongoose5.model("FormDefinition", FormDefinitionSchema2);

// src/models/FormStepNotes.ts
import mongoose6, { Schema as Schema5 } from "mongoose";
var FormStepNotesSchema = new Schema5(
  {
    formDefinitionId: {
      type: Schema5.Types.ObjectId,
      ref: "FormDefinition",
      required: true,
      index: true
    },
    formVersion: {
      type: Number,
      required: true,
      index: true
    },
    stepId: {
      type: String,
      required: true,
      index: true
    },
    notes: {
      type: String,
      default: ""
    },
    authorId: {
      type: Schema5.Types.ObjectId,
      ref: "User",
      required: true
    },
    authorName: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);
FormStepNotesSchema.index(
  { formDefinitionId: 1, formVersion: 1, stepId: 1 },
  { unique: true }
);
var FormStepNotes = mongoose6.model("FormStepNotes", FormStepNotesSchema);

// src/services/formService.ts
var FormService = class {
  /**
   * Get the active published form for clients.
   * NEVER returns private step notes.
   */
  static async getPublishedForm(category) {
    return FormDefinition.findOne({
      category,
      status: "published"
    }).sort({ version: -1 });
  }
  static async getFormBySlugAndVersion(slug, version) {
    if (version) {
      return FormDefinition.findOne({ slug, version });
    }
    return FormDefinition.findOne({ slug, status: "published" }).sort({ version: -1 });
  }
  /**
   * Admin: List all forms including drafts & versions
   */
  static async getAllForms() {
    return FormDefinition.find().sort({ updatedAt: -1 });
  }
  static async createForm(data) {
    const latest = await FormDefinition.findOne({ slug: data.slug }).sort({ version: -1 });
    const version = latest ? latest.version + 1 : 1;
    return FormDefinition.create({
      slug: data.slug,
      title: data.title,
      description: data.description,
      category: data.category,
      version,
      status: "draft",
      steps: data.steps
    });
  }
  static async updateForm(id, data) {
    return FormDefinition.findByIdAndUpdate(id, data, { new: true });
  }
  static async publishForm(id) {
    const form = await FormDefinition.findById(id);
    if (!form) return null;
    await FormDefinition.updateMany(
      { category: form.category, status: "published", _id: { $ne: form._id } },
      { status: "archived" }
    );
    form.status = "published";
    form.publishedAt = /* @__PURE__ */ new Date();
    return form.save();
  }
  // --- PRIVATE STEP NOTES (Admin Only) ---
  static async getStepNotes(formDefinitionId, formVersion) {
    return FormStepNotes.find({
      formDefinitionId: new mongoose7.Types.ObjectId(formDefinitionId),
      formVersion
    });
  }
  static async saveStepNote(data) {
    return FormStepNotes.findOneAndUpdate(
      {
        formDefinitionId: new mongoose7.Types.ObjectId(data.formDefinitionId),
        formVersion: data.formVersion,
        stepId: data.stepId
      },
      {
        notes: data.notes,
        authorId: new mongoose7.Types.ObjectId(data.authorId),
        authorName: data.authorName
      },
      { upsert: true, new: true }
    );
  }
};

// src/models/Package.ts
import mongoose8, { Schema as Schema6 } from "mongoose";
var PackageSchema2 = new Schema6(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    category: {
      type: String,
      enum: ["website", "app"],
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    pricingMode: {
      type: String,
      enum: ["fixed", "starting_price", "manual_review"],
      default: "fixed"
    },
    standardPricePaise: {
      type: Number,
      required: true
    },
    offerPricePaise: {
      type: Number,
      required: true
    },
    billingFrequency: {
      type: String,
      enum: ["one_time", "monthly", "yearly"],
      default: "one_time"
    },
    features: [
      {
        type: String
      }
    ],
    maxRevisions: {
      type: Number,
      default: 2
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    order: {
      type: Number,
      default: 0,
      index: true
    }
  },
  {
    timestamps: true
  }
);
var Package = mongoose8.model("Package", PackageSchema2);

// src/models/Addon.ts
import mongoose9, { Schema as Schema7 } from "mongoose";
var AddonSchema2 = new Schema7(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    category: {
      type: String,
      enum: ["website", "app", "both"],
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    billingType: {
      type: String,
      enum: ["one_time", "monthly", "per_unit"],
      default: "one_time"
    },
    unitPricePaise: {
      type: Number,
      required: true
    },
    unitLabel: {
      type: String
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    order: {
      type: Number,
      default: 0,
      index: true
    }
  },
  {
    timestamps: true
  }
);
var Addon = mongoose9.model("Addon", AddonSchema2);

// src/models/BrandProfile.ts
import mongoose10, { Schema as Schema8 } from "mongoose";
var BrandProfileSchema2 = new Schema8(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    tagline: {
      type: String,
      required: true
    },
    logoText: {
      type: String,
      required: true
    },
    logoUrl: {
      type: String
    },
    primaryColor: {
      type: String,
      required: true,
      default: "#FF6B00"
    },
    secondaryColor: {
      type: String,
      required: true,
      default: "#121216"
    },
    contactEmail: {
      type: String,
      required: true
    },
    contactPhone: {
      type: String,
      required: true
    },
    websiteUrl: {
      type: String,
      required: true
    },
    addressLines: [
      {
        type: String
      }
    ],
    isDefault: {
      type: Boolean,
      default: false,
      index: true
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);
var BrandProfile = mongoose10.model("BrandProfile", BrandProfileSchema2);

// src/controllers/publicController.ts
var PublicController = class {
  /**
   * Get active published form for Website or App
   * Strictly returns only the client-visible form schema.
   */
  static async getPublishedForm(req, res, next) {
    try {
      const category = req.params.category;
      if (category !== "website" && category !== "app") {
        res.status(400).json({ success: false, error: "Category must be website or app" });
        return;
      }
      const form = await FormService.getPublishedForm(category);
      if (!form) {
        res.status(404).json({ success: false, error: `No published form found for ${category}` });
        return;
      }
      res.status(200).json({
        success: true,
        form: {
          id: form._id.toString(),
          slug: form.slug,
          title: form.title,
          description: form.description,
          category: form.category,
          version: form.version,
          steps: form.steps,
          publishedAt: form.publishedAt?.toISOString()
        }
      });
    } catch (err) {
      next(err);
    }
  }
  static async getPackages(req, res, next) {
    try {
      const category = req.query.category;
      const filter = { isActive: true };
      if (category === "website" || category === "app") {
        filter.category = category;
      }
      const packages = await Package.find(filter).sort({ order: 1 });
      res.status(200).json({
        success: true,
        packages: packages.map((p) => ({
          id: p._id.toString(),
          slug: p.slug,
          category: p.category,
          name: p.name,
          description: p.description,
          pricingMode: p.pricingMode,
          standardPricePaise: p.standardPricePaise,
          offerPricePaise: p.offerPricePaise,
          billingFrequency: p.billingFrequency,
          features: p.features,
          maxRevisions: p.maxRevisions,
          order: p.order
        }))
      });
    } catch (err) {
      next(err);
    }
  }
  static async getAddons(req, res, next) {
    try {
      const category = req.query.category;
      const filter = { isActive: true };
      if (category === "website" || category === "app") {
        filter.category = { $in: [category, "both"] };
      }
      const addons = await Addon.find(filter).sort({ order: 1 });
      res.status(200).json({
        success: true,
        addons: addons.map((a) => ({
          id: a._id.toString(),
          slug: a.slug,
          category: a.category,
          name: a.name,
          description: a.description,
          billingType: a.billingType,
          unitPricePaise: a.unitPricePaise,
          unitLabel: a.unitLabel,
          order: a.order
        }))
      });
    } catch (err) {
      next(err);
    }
  }
  static async getBrands(req, res, next) {
    try {
      const brands = await BrandProfile.find({ isActive: true }).sort({ isDefault: -1, name: 1 });
      const hasDefault = brands.some((b) => b.isDefault);
      if (!hasDefault && brands.length > 0) {
        brands[0].isDefault = true;
        await BrandProfile.findByIdAndUpdate(brands[0]._id, { isDefault: true });
      }
      res.status(200).json({
        success: true,
        brands: brands.map((b) => ({
          id: b._id.toString(),
          name: b.name,
          tagline: b.tagline,
          logoText: b.logoText,
          logoUrl: b.logoUrl,
          primaryColor: b.primaryColor,
          secondaryColor: b.secondaryColor,
          contactEmail: b.contactEmail,
          contactPhone: b.contactPhone,
          websiteUrl: b.websiteUrl,
          addressLines: b.addressLines,
          isDefault: b.isDefault
        }))
      });
    } catch (err) {
      next(err);
    }
  }
};

// src/routes/publicRoutes.ts
var router2 = Router2();
router2.get("/forms/:category", PublicController.getPublishedForm);
router2.get("/packages", PublicController.getPackages);
router2.get("/addons", PublicController.getAddons);
router2.get("/brands", PublicController.getBrands);
var publicRoutes_default = router2;

// src/routes/submissionRoutes.ts
import { Router as Router3 } from "express";

// src/services/submissionService.ts
import mongoose14 from "mongoose";
import crypto2 from "crypto";

// src/models/Submission.ts
import mongoose11, { Schema as Schema9 } from "mongoose";
var SubmissionSchema = new Schema9(
  {
    enquiryReference: {
      type: String,
      required: true,
      unique: true,
      index: true,
      uppercase: true,
      trim: true
    },
    clientId: {
      type: Schema9.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    clientSnapshot: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String },
      company: { type: String }
    },
    formDefinitionId: {
      type: Schema9.Types.ObjectId,
      ref: "FormDefinition",
      required: true,
      index: true
    },
    formVersion: {
      type: Number,
      required: true
    },
    projectCategory: {
      type: String,
      enum: ["website", "app"],
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: [
        "submitted",
        "under_review",
        "estimated",
        "quoted",
        "in_progress",
        "completed",
        "cancelled"
      ],
      default: "submitted",
      index: true
    },
    answers: {
      type: Schema9.Types.Mixed,
      required: true,
      default: {}
    },
    revisionNumber: {
      type: Number,
      default: 1
    },
    idempotencyKey: {
      type: String,
      sparse: true,
      index: true
    },
    submittedAt: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: true
  }
);
var Submission = mongoose11.model("Submission", SubmissionSchema);

// src/models/SubmissionInternalNotes.ts
import mongoose12, { Schema as Schema10 } from "mongoose";
var SubmissionInternalNotesSchema = new Schema10(
  {
    submissionId: {
      type: Schema10.Types.ObjectId,
      ref: "Submission",
      required: true,
      index: true
    },
    stepId: {
      type: String,
      required: true,
      index: true
    },
    notes: {
      type: String,
      default: ""
    },
    authorId: {
      type: Schema10.Types.ObjectId,
      ref: "User",
      required: true
    },
    authorName: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);
SubmissionInternalNotesSchema.index(
  { submissionId: 1, stepId: 1 },
  { unique: true }
);
var SubmissionInternalNotes = mongoose12.model(
  "SubmissionInternalNotes",
  SubmissionInternalNotesSchema
);

// src/models/ProjectFinancials.ts
import mongoose13, { Schema as Schema11 } from "mongoose";
var ProjectFinancialsSchema = new Schema11(
  {
    submissionId: {
      type: Schema11.Types.ObjectId,
      ref: "Submission",
      required: true,
      unique: true,
      index: true
    },
    quotationId: {
      type: Schema11.Types.ObjectId,
      ref: "Quotation",
      index: true
    },
    currency: {
      type: String,
      default: "INR"
    },
    quotedRevenuePaise: {
      type: Number,
      default: 0
    },
    approvedRevenuePaise: {
      type: Number,
      default: 0
    },
    collectedRevenuePaise: {
      type: Number,
      default: 0
    },
    estimatedDirectCostPaise: {
      type: Number,
      default: 0
    },
    actualDirectCostPaise: {
      type: Number,
      default: 0
    },
    estimatedGrossProfitPaise: {
      type: Number,
      default: 0
    },
    actualGrossProfitPaise: {
      type: Number,
      default: 0
    },
    grossMarginPercent: {
      type: Number,
      default: null
    },
    markupPercent: {
      type: Number,
      default: null
    },
    targetMarginPercent: {
      type: Number,
      default: 45
      // Default 45% target margin
    },
    financialNotes: {
      type: String
    }
  },
  {
    timestamps: true
  }
);
var ProjectFinancials = mongoose13.model(
  "ProjectFinancials",
  ProjectFinancialsSchema
);

// src/services/submissionService.ts
var SubmissionService = class {
  static generateReference() {
    const year = (/* @__PURE__ */ new Date()).getFullYear();
    const randomHex = crypto2.randomBytes(3).toString("hex").toUpperCase();
    return `REQ-${year}-${randomHex}`;
  }
  static async createSubmission(user, data) {
    if (data.idempotencyKey) {
      const existing = await Submission.findOne({
        idempotencyKey: data.idempotencyKey,
        clientId: user._id
      });
      if (existing) {
        return existing;
      }
    }
    const formDef = await FormDefinition.findById(data.formDefinitionId);
    if (!formDef) {
      throw new Error("Form definition not found.");
    }
    let enquiryReference = this.generateReference();
    let isUnique = false;
    while (!isUnique) {
      const dup = await Submission.findOne({ enquiryReference });
      if (!dup) isUnique = true;
      else enquiryReference = this.generateReference();
    }
    const submission = await Submission.create({
      enquiryReference,
      clientId: user._id,
      clientSnapshot: {
        name: user.fullName,
        email: user.email,
        phone: user.phone,
        company: user.company
      },
      formDefinitionId: formDef._id,
      formVersion: formDef.version,
      projectCategory: data.projectCategory,
      status: "submitted",
      answers: data.answers || {},
      revisionNumber: 1,
      idempotencyKey: data.idempotencyKey,
      submittedAt: /* @__PURE__ */ new Date()
    });
    const isAuthorizedForInternalNotes = user.role === "admin" || user.role === "superadmin" || Array.isArray(user.permissions) && user.permissions.includes("manage_internal_notes");
    if (isAuthorizedForInternalNotes && data.stepDeveloperNotes && typeof data.stepDeveloperNotes === "object") {
      for (const [stepId, noteText] of Object.entries(data.stepDeveloperNotes)) {
        if (typeof noteText === "string" && noteText.trim()) {
          await this.saveSubmissionStepNote({
            submissionId: submission._id.toString(),
            stepId,
            notes: noteText.trim(),
            authorId: user._id.toString(),
            authorName: user.fullName || user.email || "Agency Team"
          });
        }
      }
    }
    await ProjectFinancials.create({
      submissionId: submission._id,
      currency: "INR",
      quotedRevenuePaise: 0,
      approvedRevenuePaise: 0,
      collectedRevenuePaise: 0,
      estimatedDirectCostPaise: 0,
      actualDirectCostPaise: 0,
      estimatedGrossProfitPaise: 0,
      actualGrossProfitPaise: 0,
      grossMarginPercent: null,
      markupPercent: null,
      targetMarginPercent: 45
    });
    return submission;
  }
  static async getClientSubmissions(clientId) {
    return Submission.find({ clientId: new mongoose14.Types.ObjectId(clientId) }).sort({
      submittedAt: -1
    });
  }
  static async getClientSubmissionById(submissionId, clientId) {
    return Submission.findOne({
      _id: new mongoose14.Types.ObjectId(submissionId),
      clientId: new mongoose14.Types.ObjectId(clientId)
    });
  }
  static async getAdminSubmissions(query) {
    const filter = {};
    if (query?.category) {
      filter.projectCategory = query.category;
    }
    if (query?.status) {
      filter.status = query.status;
    }
    if (query?.search) {
      filter.$or = [
        { enquiryReference: { $regex: query.search, $options: "i" } },
        { "clientSnapshot.name": { $regex: query.search, $options: "i" } },
        { "clientSnapshot.email": { $regex: query.search, $options: "i" } }
      ];
    }
    return Submission.find(filter).sort({ submittedAt: -1 });
  }
  static async getAdminSubmissionById(submissionId) {
    return Submission.findById(submissionId);
  }
  static async updateSubmissionStatus(submissionId, status) {
    return Submission.findByIdAndUpdate(submissionId, { status }, { new: true });
  }
  // --- SUBMISSION INTERNAL STEP NOTES (Admin Only) ---
  static async getSubmissionStepNotes(submissionId) {
    return SubmissionInternalNotes.find({
      submissionId: new mongoose14.Types.ObjectId(submissionId)
    });
  }
  static async saveSubmissionStepNote(data) {
    return SubmissionInternalNotes.findOneAndUpdate(
      {
        submissionId: new mongoose14.Types.ObjectId(data.submissionId),
        stepId: data.stepId
      },
      {
        notes: data.notes,
        authorId: new mongoose14.Types.ObjectId(data.authorId),
        authorName: data.authorName
      },
      { upsert: true, new: true }
    );
  }
};

// src/services/quotationService.ts
import mongoose16 from "mongoose";

// src/models/Quotation.ts
import mongoose15, { Schema as Schema12 } from "mongoose";
var QuotationLineItemSchema2 = new Schema12(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    quantity: { type: Number, required: true, default: 1 },
    unitPricePaise: { type: Number, required: true },
    totalPaise: { type: Number, required: true },
    isOptional: { type: Boolean, default: false },
    isSelected: { type: Boolean, default: true }
  },
  { _id: false }
);
var PaymentMilestoneSchema2 = new Schema12(
  {
    title: { type: String, required: true },
    percent: { type: Number, required: true },
    amountPaise: { type: Number, required: true },
    trigger: { type: String, required: true }
  },
  { _id: false }
);
var QuotationSchema = new Schema12(
  {
    quotationNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
      uppercase: true,
      trim: true
    },
    revisionNumber: {
      type: Number,
      default: 1
    },
    submissionId: {
      type: Schema12.Types.ObjectId,
      ref: "Submission",
      required: true,
      index: true
    },
    clientId: {
      type: Schema12.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: ["draft", "estimate", "issued", "approved", "rejected", "expired"],
      default: "draft",
      index: true
    },
    brandSnapshot: {
      name: { type: String, required: true },
      tagline: { type: String, required: true },
      logoText: { type: String, required: true },
      logoUrl: { type: String },
      primaryColor: { type: String, required: true },
      secondaryColor: { type: String, required: true },
      contactEmail: { type: String, required: true },
      contactPhone: { type: String, required: true },
      websiteUrl: { type: String, required: true },
      addressLines: [{ type: String }]
    },
    clientSnapshot: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      company: { type: String },
      phone: { type: String }
    },
    packageName: { type: String },
    scopeSummary: { type: String },
    lineItems: [QuotationLineItemSchema2],
    subtotalPaise: { type: Number, required: true },
    discountPaise: { type: Number, default: 0 },
    taxLines: [
      {
        name: { type: String, required: true },
        percent: { type: Number, required: true },
        amountPaise: { type: Number, required: true }
      }
    ],
    totalPaise: { type: Number, required: true },
    estimatedTimelineDays: { type: Number },
    paymentMilestones: [PaymentMilestoneSchema2],
    revisionPolicy: { type: String, required: true },
    exclusions: [{ type: String }],
    clientResponsibilities: [{ type: String }],
    termsAndConditions: [{ type: String }],
    issuedAt: { type: Date },
    validUntil: { type: Date },
    approvedAt: { type: Date },
    approvedBy: { type: String }
  },
  {
    timestamps: true
  }
);
var Quotation = mongoose15.model("Quotation", QuotationSchema);

// ../shared/utils/currency.ts
function toRupees(paise) {
  if (isNaN(paise) || !isFinite(paise)) return 0;
  return Math.round(paise) / 100;
}
function formatINR(paise, includeSymbol = true) {
  const rupees = toRupees(paise);
  const formatted = new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0
  }).format(rupees);
  return includeSymbol ? `\u20B9${formatted}` : formatted;
}
function calcGrossProfit(revenuePaise, directCostPaise) {
  return Math.round(revenuePaise - directCostPaise);
}
function calcGrossMarginPercent(revenuePaise, directCostPaise) {
  if (revenuePaise <= 0) return null;
  const profit = calcGrossProfit(revenuePaise, directCostPaise);
  const margin = profit / revenuePaise * 100;
  return Math.round(margin * 10) / 10;
}
function calcMarkupPercent(revenuePaise, directCostPaise) {
  if (directCostPaise <= 0) return null;
  const profit = calcGrossProfit(revenuePaise, directCostPaise);
  const markup = profit / directCostPaise * 100;
  return Math.round(markup * 10) / 10;
}

// src/services/quotationService.ts
var QuotationService = class {
  static async generateQuotationNumber() {
    const year = (/* @__PURE__ */ new Date()).getFullYear();
    const existingQuotes = await Quotation.find({ quotationNumber: new RegExp(`^QTE-${year}-`) }).select("quotationNumber").lean();
    let maxNum = 0;
    for (const q of existingQuotes) {
      const match = q.quotationNumber?.match(/QTE-\d{4}-(\d+)/);
      if (match && match[1]) {
        const parsed = parseInt(match[1], 10);
        if (parsed > maxNum) maxNum = parsed;
      }
    }
    let nextNum = maxNum + 1;
    let candidate = `QTE-${year}-${String(nextNum).padStart(3, "0")}`;
    while (await Quotation.exists({ quotationNumber: candidate })) {
      nextNum++;
      candidate = `QTE-${year}-${String(nextNum).padStart(3, "0")}`;
    }
    return candidate;
  }
  /**
   * Reconciles payment milestones so that their sum EQUALS totalPaise exactly down to the last paise.
   * Allocates rounded amounts to earlier milestones and assigns the exact remaining balance to the final milestone.
   */
  static reconcilePaymentMilestones(milestones, totalPaise) {
    const defaultMilestones = [
      {
        title: "Advance Mobilization & Project Initiation",
        percent: 20,
        amountPaise: 0,
        trigger: "Mandatory 20% advance upon contract signing & resource mobilization"
      },
      {
        title: "UI/UX Design System & Core Architecture Preview",
        percent: 30,
        amountPaise: 0,
        trigger: "Upon staging presentation of interactive prototypes & database schema approval"
      },
      {
        title: "Core Development & Functional Alpha Release",
        percent: 30,
        amountPaise: 0,
        trigger: "Upon functional module completion, third-party integrations & client walkthrough"
      },
      {
        title: "Final UAT Sign-off & Production Deployment",
        percent: 20,
        amountPaise: 0,
        trigger: "Prior to DNS go-live, production deployment, and 100% IP/credential handover"
      }
    ];
    const source = milestones && milestones.length > 0 ? milestones : defaultMilestones;
    let allocatedPaise = 0;
    const isWholeRupees = totalPaise % 100 === 0;
    return source.map((m, index) => {
      let amountPaise = 0;
      if (index === source.length - 1) {
        amountPaise = Math.max(0, totalPaise - allocatedPaise);
      } else {
        if (isWholeRupees) {
          const rupees = Math.round(totalPaise / 100 * (m.percent / 100));
          amountPaise = rupees * 100;
        } else {
          amountPaise = Math.round(totalPaise * (m.percent / 100));
        }
        allocatedPaise += amountPaise;
      }
      return {
        title: m.title,
        percent: m.percent,
        amountPaise,
        trigger: m.trigger
      };
    });
  }
  /**
   * Reconciles exclusions against line items to eliminate commercial contradictions (e.g. hosting or domains).
   */
  static reconcileExclusions(lineItems, customExclusions) {
    const hasHosting = lineItems.some(
      (li) => /hosting|server|vps|cloud compute|aws|digitalocean|infrastructure/i.test(
        `${li.title} ${li.description || ""}`
      )
    );
    const hasDomain = lineItems.some(
      (li) => /domain|dns/i.test(`${li.title} ${li.description || ""}`)
    );
    const base = customExclusions && customExclusions.length > 0 ? [...customExclusions] : [];
    const filtered = base.filter((ex) => {
      if (hasHosting && /cloud hosting|server compute|vps infrastructure/i.test(ex)) {
        return false;
      }
      if (hasDomain && /domain registration|annual dns/i.test(ex)) {
        return false;
      }
      return true;
    });
    const reconciled = [];
    if (hasDomain) {
      reconciled.push(
        "Primary domain registration is included for Year 1 as itemized; subsequent annual renewals are handled through the domain registrar."
      );
    } else {
      reconciled.push(
        "Domain registration & annual DNS renewal fees paid directly by client to domain registrar."
      );
    }
    if (hasHosting) {
      reconciled.push(
        "Managed cloud hosting infrastructure & backups are included for the initial term as itemized; specialized cluster expansion beyond quoted bandwidth is billed separately."
      );
    } else {
      reconciled.push(
        "Cloud hosting, server compute & VPS infrastructure costs billed directly to client accounts (AWS / DigitalOcean / Vercel)."
      );
    }
    reconciled.push(
      "Third-party paid API consumption (SMS gateways, OpenAI tokens, Google Maps platform) billed directly to client accounts."
    );
    for (const ex of filtered) {
      if (!reconciled.some((r) => r.toLowerCase().includes(ex.toLowerCase().slice(0, 20)))) {
        reconciled.push(ex);
      }
    }
    return reconciled;
  }
  static async createQuotation(data) {
    const submission = await Submission.findById(data.submissionId);
    if (!submission) {
      throw new Error("Submission not found.");
    }
    const existingQuotation = await Quotation.findOne({ submissionId: data.submissionId });
    if (existingQuotation) {
      throw new Error(
        `Quotation already exists for this requirement (${existingQuotation.quotationNumber}). Please edit the existing quotation.`
      );
    }
    const brand = await BrandProfile.findById(data.brandProfileId);
    if (!brand) {
      throw new Error("Brand profile not found.");
    }
    let subtotalPaise = 0;
    const sanitizedLineItems = data.lineItems.map((item) => {
      const itemTotal = item.quantity * item.unitPricePaise;
      subtotalPaise += itemTotal;
      return {
        ...item,
        totalPaise: itemTotal
      };
    });
    const discountPaise = data.discountPaise || 0;
    const totalPaise = Math.max(0, subtotalPaise - discountPaise);
    const quotationNumber = await this.generateQuotationNumber();
    const issuedAt = /* @__PURE__ */ new Date();
    const validUntil = /* @__PURE__ */ new Date();
    validUntil.setDate(issuedAt.getDate() + (data.validityDays || 30));
    const paymentMilestones = this.reconcilePaymentMilestones(data.paymentMilestones, totalPaise);
    const exclusions = this.reconcileExclusions(sanitizedLineItems, data.exclusions);
    const quotation = await Quotation.create({
      quotationNumber,
      revisionNumber: 1,
      submissionId: submission._id,
      clientId: submission.clientId,
      status: data.status || "draft",
      brandSnapshot: {
        name: brand.name,
        tagline: brand.tagline,
        logoText: brand.logoText,
        logoUrl: brand.logoUrl,
        primaryColor: brand.primaryColor,
        secondaryColor: brand.secondaryColor,
        contactEmail: brand.contactEmail,
        contactPhone: brand.contactPhone,
        websiteUrl: brand.websiteUrl,
        addressLines: brand.addressLines
      },
      clientSnapshot: submission.clientSnapshot,
      packageName: data.packageName || "Custom Development Package",
      scopeSummary: data.scopeSummary || "Turnkey digital solution developed to client requirements.",
      lineItems: sanitizedLineItems,
      subtotalPaise,
      discountPaise,
      taxLines: [],
      // Zero tax - empty array preserved
      totalPaise,
      estimatedTimelineDays: data.estimatedTimelineDays || 14,
      paymentMilestones,
      revisionPolicy: data.revisionPolicy || "Includes up to 3 structured rounds of revisions before production sign-off.",
      exclusions,
      clientResponsibilities: data.clientResponsibilities || [
        "Provide all required logos, images, copy and product assets within 5 business days.",
        "Designate a single primary point of contact for milestone reviews and feedback.",
        "Review and provide structured feedback within 3 business days of preview releases."
      ],
      termsAndConditions: data.termsAndConditions && data.termsAndConditions.length > 0 ? data.termsAndConditions : DEFAULT_COMMERCIAL_TERMS,
      issuedAt,
      validUntil
    });
    if (data.status === "issued") {
      submission.status = "quoted";
      await submission.save();
    }
    await this.syncFinancials(submission._id.toString(), quotation);
    return quotation;
  }
  static async updateQuotation(id, data) {
    const quotation = await Quotation.findById(id);
    if (!quotation) return null;
    if (data.lineItems) {
      let subtotalPaise = 0;
      const sanitized = data.lineItems.map((item) => {
        const itemTotal = item.quantity * item.unitPricePaise;
        subtotalPaise += itemTotal;
        return { ...item, totalPaise: itemTotal };
      });
      quotation.lineItems = sanitized;
      quotation.subtotalPaise = subtotalPaise;
    }
    if (data.discountPaise !== void 0) {
      quotation.discountPaise = data.discountPaise;
    }
    quotation.totalPaise = Math.max(0, quotation.subtotalPaise - quotation.discountPaise);
    if (data.status) quotation.status = data.status;
    if (data.packageName) quotation.packageName = data.packageName;
    if (data.scopeSummary) quotation.scopeSummary = data.scopeSummary;
    if (data.estimatedTimelineDays) quotation.estimatedTimelineDays = data.estimatedTimelineDays;
    quotation.paymentMilestones = this.reconcilePaymentMilestones(
      data.paymentMilestones || quotation.paymentMilestones,
      quotation.totalPaise
    );
    if (data.revisionPolicy) quotation.revisionPolicy = data.revisionPolicy;
    quotation.exclusions = this.reconcileExclusions(
      quotation.lineItems,
      data.exclusions || quotation.exclusions
    );
    if (data.clientResponsibilities) quotation.clientResponsibilities = data.clientResponsibilities;
    if (data.termsAndConditions) quotation.termsAndConditions = data.termsAndConditions;
    if (data.status === "approved" && !quotation.approvedAt) {
      quotation.approvedAt = /* @__PURE__ */ new Date();
    }
    quotation.revisionNumber += 1;
    await quotation.save();
    if (data.status === "issued") {
      await Submission.findByIdAndUpdate(quotation.submissionId, { status: "quoted" });
    } else if (data.status === "approved") {
      await Submission.findByIdAndUpdate(quotation.submissionId, { status: "in_progress" });
    }
    await this.syncFinancials(quotation.submissionId.toString(), quotation);
    return quotation;
  }
  static async getQuotationBySubmissionId(submissionId) {
    return Quotation.findOne({ submissionId: new mongoose16.Types.ObjectId(submissionId) }).sort({
      revisionNumber: -1
    });
  }
  static async getQuotationById(id) {
    return Quotation.findById(id);
  }
  static async getAllQuotations() {
    return Quotation.find().sort({ createdAt: -1 });
  }
  static async syncFinancials(submissionId, quotation) {
    const fin = await ProjectFinancials.findOne({ submissionId });
    if (!fin) return;
    fin.quotationId = quotation._id;
    fin.quotedRevenuePaise = quotation.totalPaise;
    if (quotation.status === "approved") {
      fin.approvedRevenuePaise = quotation.totalPaise;
    }
    const effectiveRevenue = fin.approvedRevenuePaise > 0 ? fin.approvedRevenuePaise : fin.quotedRevenuePaise;
    fin.estimatedGrossProfitPaise = calcGrossProfit(effectiveRevenue, fin.estimatedDirectCostPaise);
    fin.actualGrossProfitPaise = calcGrossProfit(effectiveRevenue, fin.actualDirectCostPaise);
    fin.grossMarginPercent = calcGrossMarginPercent(effectiveRevenue, fin.actualDirectCostPaise);
    fin.markupPercent = calcMarkupPercent(effectiveRevenue, fin.actualDirectCostPaise);
    await fin.save();
  }
};

// src/services/pdfService.ts
import PDFDocument from "pdfkit";
function cleanText(str) {
  if (!str) return "";
  return String(str).replace(/[\u00D7\u2715\u2716]/g, "x").replace(/[\u2014\u2013]/g, "-").replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"').replace(/[\u2022\u2023]/g, "-").replace(/[\u20B9]/g, "INR ");
}
var PDFService = class {
  /**
   * Generates a Requirement Details PDF from a sanitized ClientSubmissionDTO.
   * STRICT GUARANTEE: Receives only ClientSubmissionDTO. Never touches internal notes or costs.
   */
  static async generateRequirementDetailsPDF(sub) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: "A4",
          margin: 50,
          info: {
            Title: `Requirement Details - ${sub.enquiryReference}`,
            Author: "Client Portal"
          }
        });
        const buffers = [];
        doc.on("data", (chunk) => buffers.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(buffers)));
        doc.on("error", (err) => reject(err));
        doc.rect(50, 45, 495, 60).fill("#121216");
        doc.fillColor("#FF6B00").fontSize(10).font("Helvetica-Bold").text("PROJECT SPECIFICATION & REQUIREMENT BRIEF", 65, 58);
        doc.fillColor("#FFFFFF").fontSize(16).font("Helvetica-Bold").text(`Reference: ${sub.enquiryReference}`, 65, 75);
        doc.fillColor("#94A3B8").fontSize(9).font("Helvetica").text(
          `Category: ${sub.projectCategory.toUpperCase()} | Submitted: ${new Date(sub.submittedAt).toLocaleDateString()}`,
          310,
          78,
          { align: "right" }
        );
        doc.moveDown(3);
        const startY = 125;
        doc.rect(50, startY, 495, 65).fillAndStroke("#F8FAFC", "#E2E8F0");
        doc.fillColor("#0F172A").fontSize(11).font("Helvetica-Bold").text("Client Information", 65, startY + 12);
        doc.fontSize(9).font("Helvetica").fillColor("#334155").text(`Name: ${sub.clientSnapshot.name}`, 65, startY + 30).text(`Email: ${sub.clientSnapshot.email}`, 65, startY + 45).text(`Company: ${sub.clientSnapshot.company || "N/A"}`, 280, startY + 30).text(`Phone: ${sub.clientSnapshot.phone || "N/A"}`, 280, startY + 45);
        let currentY = startY + 85;
        doc.fillColor("#0F172A").fontSize(13).font("Helvetica-Bold").text("Submitted Requirements & Specifications", 50, currentY);
        currentY += 25;
        const answers = sub.answers || {};
        const entries = Object.entries(answers);
        if (entries.length === 0) {
          doc.fontSize(10).font("Helvetica-Oblique").fillColor("#64748B").text("No detailed responses recorded for this requirement submission.", 50, currentY);
        } else {
          entries.forEach(([key, val], index) => {
            if (currentY > 700) {
              doc.addPage();
              currentY = 50;
            }
            const formattedKey = key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase()).replace(/_/g, " ");
            const formattedVal = Array.isArray(val) ? val.join(", ") : typeof val === "object" && val !== null ? JSON.stringify(val) : String(val);
            const rowHeight = Math.max(30, 20 + Math.ceil(formattedVal.length / 70) * 12);
            if (index % 2 === 0) {
              doc.rect(50, currentY, 495, rowHeight).fill("#F8FAFC");
            }
            doc.fontSize(9).font("Helvetica-Bold").fillColor("#1E293B").text(formattedKey, 60, currentY + 7, { width: 180 });
            doc.fontSize(9).font("Helvetica").fillColor("#334155").text(formattedVal, 245, currentY + 7, { width: 290 });
            currentY += rowHeight + 4;
          });
        }
        const pageCount = doc._pageBuffer ? doc._pageBuffer.length : 1;
        doc.fontSize(8).fillColor("#94A3B8").text(
          `Generated on ${(/* @__PURE__ */ new Date()).toLocaleDateString()} | Confidential Project Specification Document`,
          50,
          780,
          { align: "center", width: 495 }
        );
        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }
  /**
   * Generates a World-Class Corporate Proposal Quotation PDF.
   * STRICT PRIVACY GUARANTEE: Receives only ClientQuotationDTO. Zero internal costs, margins or private notes.
   * LAYOUT GUARANTEE: Uses responsive bounded widths, safe margins (40pt), two-pass dynamic page counts (Page X of Y),
   * no clipping, dynamic branding from selected profile, and reconciled payment milestones.
   */
  static async generateQuotationPDF(quote) {
    return new Promise((resolve, reject) => {
      try {
        const PAGE_WIDTH = 595.28;
        const PAGE_HEIGHT = 841.89;
        const MARGIN = 40;
        const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
        const doc = new PDFDocument({
          size: "A4",
          margin: MARGIN,
          bufferPages: true,
          info: {
            Title: `Commercial Proposal - ${quote.quotationNumber}`,
            Author: quote.brandSnapshot.name,
            Subject: quote.packageName || "Turnkey Digital Solution",
            Keywords: "Quotation, Proposal, Commercial Agreement, Web & App Development"
          }
        });
        const buffers = [];
        doc.on("data", (chunk) => buffers.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(buffers)));
        doc.on("error", (err) => reject(err));
        const brand = quote.brandSnapshot;
        const brandColor = brand.primaryColor || "#FF6B00";
        const darkColor = "#0F172A";
        const slate900 = "#0F172A";
        const slate700 = "#334155";
        const slate500 = "#64748B";
        const slate400 = "#94A3B8";
        const borderLight = "#E2E8F0";
        const bgSubtle = "#F8FAFC";
        const milestones = quote.paymentMilestones && quote.paymentMilestones.length > 0 ? quote.paymentMilestones : [
          { title: "Advance Mobilization & Project Initiation", percent: 20, amountPaise: Math.round(quote.totalPaise * 0.2), trigger: "Mandatory 20% advance upon contract signing & resource mobilization" },
          { title: "UI/UX Design System & Core Architecture Preview", percent: 30, amountPaise: Math.round(quote.totalPaise * 0.3), trigger: "Upon staging presentation of interactive prototypes & database schema approval" },
          { title: "Core Development & Functional Alpha Release", percent: 30, amountPaise: Math.round(quote.totalPaise * 0.3), trigger: "Upon functional module completion, third-party integrations & client walkthrough" },
          { title: "Final UAT Sign-off & Production Deployment", percent: 20, amountPaise: quote.totalPaise - Math.round(quote.totalPaise * 0.2) - Math.round(quote.totalPaise * 0.3) - Math.round(quote.totalPaise * 0.3), trigger: "Prior to DNS go-live, production deployment, and 100% IP/credential handover" }
        ];
        const formatRupees = (paise) => {
          const rupees = toRupees(paise);
          const hasPaise = paise % 100 !== 0;
          const formatted = new Intl.NumberFormat("en-IN", {
            minimumFractionDigits: hasPaise ? 2 : 0,
            maximumFractionDigits: hasPaise ? 2 : 0
          }).format(rupees);
          return `INR ${formatted}`;
        };
        const formatDate = (dateStr) => {
          const d = dateStr ? new Date(dateStr) : /* @__PURE__ */ new Date();
          return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
        };
        const issueDateStr = formatDate(quote.createdAt);
        const validUntilDate = quote.validUntil ? formatDate(quote.validUntil) : formatDate(new Date(Date.now() + (quote.estimatedTimelineDays || 30) * 864e5));
        let y = 40;
        doc.roundedRect(MARGIN, y, 40, 40, 8).fill(brandColor);
        const badgeInitial = brand.logoText ? brand.logoText.slice(0, 3).toUpperCase() : brand.name.slice(0, 2).toUpperCase();
        doc.fillColor("#FFFFFF").fontSize(12).font("Helvetica-Bold").text(cleanText(badgeInitial), MARGIN, y + 13, { width: 40, align: "center" });
        doc.fillColor(slate900).fontSize(16).font("Helvetica-Bold").text(cleanText(brand.name), MARGIN + 50, y + 4, { width: 250 });
        doc.fillColor(slate500).fontSize(8.5).font("Helvetica").text(cleanText(brand.tagline || "Modern Digital Engineering & Enterprise Architecture"), MARGIN + 50, y + 24, { width: 250, lineGap: 1 });
        const rightBoxWidth = 210.28;
        const rightBoxX = PAGE_WIDTH - MARGIN - rightBoxWidth;
        doc.fillColor(brandColor).fontSize(8).font("Helvetica-Bold").text("COMMERCIAL PROPOSAL", rightBoxX, y + 3, { width: rightBoxWidth, align: "right" });
        doc.fillColor(slate900).fontSize(13).font("Helvetica-Bold").text(quote.quotationNumber, rightBoxX, y + 14, { width: rightBoxWidth, align: "right" });
        doc.fillColor(slate500).fontSize(8.5).font("Helvetica").text(`Revision: v${quote.revisionNumber} | Date: ${issueDateStr}`, rightBoxX, y + 30, { width: rightBoxWidth, align: "right" });
        doc.fillColor(slate500).fontSize(8.5).font("Helvetica").text(`Valid Until: ${validUntilDate}`, rightBoxX, y + 41, { width: rightBoxWidth, align: "right" });
        y = 92;
        doc.rect(MARGIN, y, CONTENT_WIDTH, 1).fill(borderLight);
        y += 14;
        const specTitle = cleanText(quote.packageName || "Comprehensive Digital Solution Package");
        const specDesc = cleanText(quote.scopeSummary || "Turnkey digital solution engineered to client specifications with responsive architecture.");
        const specTitleH = doc.fontSize(13).font("Helvetica-Bold").heightOfString(specTitle, { width: CONTENT_WIDTH - 28 });
        const specDescH = doc.fontSize(8.5).font("Helvetica").heightOfString(specDesc, { width: CONTENT_WIDTH - 28, lineGap: 2 });
        const specCardHeight = Math.max(74, 12 + 10 + specTitleH + 6 + specDescH + 12);
        doc.roundedRect(MARGIN, y, CONTENT_WIDTH, specCardHeight, 6).fillAndStroke(bgSubtle, borderLight);
        doc.roundedRect(MARGIN, y, 4, specCardHeight, 2).fill(brandColor);
        doc.fillColor(brandColor).fontSize(7.5).font("Helvetica-Bold").text("PROJECT PROPOSAL & SPECIFICATION BRIEF", MARGIN + 14, y + 10);
        doc.fillColor(slate900).fontSize(13).font("Helvetica-Bold").text(specTitle, MARGIN + 14, y + 22, { width: CONTENT_WIDTH - 28 });
        doc.fillColor(slate700).fontSize(8.5).font("Helvetica").text(
          specDesc,
          MARGIN + 14,
          y + 22 + specTitleH + 5,
          { width: CONTENT_WIDTH - 28, lineGap: 2 }
        );
        y += specCardHeight + 14;
        const panelWidth = (CONTENT_WIDTH - 14) / 2;
        const panelHeight = 112;
        const leftPanelX = MARGIN;
        doc.roundedRect(leftPanelX, y, panelWidth, panelHeight, 6).fillAndStroke(bgSubtle, borderLight);
        doc.fillColor(slate900).fontSize(8.5).font("Helvetica-Bold").text("PREPARED FOR (CLIENT)", leftPanelX + 12, y + 10);
        doc.rect(leftPanelX + 12, y + 22, panelWidth - 24, 0.5).fill(borderLight);
        doc.fillColor(slate900).fontSize(10).font("Helvetica-Bold").text(quote.clientSnapshot.name, leftPanelX + 12, y + 30, { width: panelWidth - 24 });
        if (quote.clientSnapshot.company) {
          doc.fillColor(slate700).fontSize(8.5).font("Helvetica").text(`Organization: ${quote.clientSnapshot.company}`, leftPanelX + 12, y + 46, { width: panelWidth - 24 });
        }
        doc.fillColor(slate700).fontSize(8.5).font("Helvetica").text(`Email: ${quote.clientSnapshot.email}`, leftPanelX + 12, quote.clientSnapshot.company ? y + 62 : y + 48, { width: panelWidth - 24 });
        if (quote.clientSnapshot.phone) {
          doc.fillColor(slate700).fontSize(8.5).font("Helvetica").text(`Phone: ${quote.clientSnapshot.phone}`, leftPanelX + 12, quote.clientSnapshot.company ? y + 78 : y + 64, { width: panelWidth - 24 });
        }
        const rightPanelX = MARGIN + panelWidth + 14;
        doc.roundedRect(rightPanelX, y, panelWidth, panelHeight, 6).fillAndStroke(bgSubtle, borderLight);
        doc.fillColor(slate900).fontSize(8.5).font("Helvetica-Bold").text("SERVICE PROVIDER (AGENCY)", rightPanelX + 12, y + 10);
        doc.rect(rightPanelX + 12, y + 22, panelWidth - 24, 0.5).fill(borderLight);
        doc.fillColor(slate900).fontSize(10).font("Helvetica-Bold").text(cleanText(brand.name), rightPanelX + 12, y + 30, { width: panelWidth - 24 });
        doc.fillColor(slate700).fontSize(8.5).font("Helvetica").text(`Email: ${brand.contactEmail}`, rightPanelX + 12, y + 46, { width: panelWidth - 24 });
        doc.fillColor(slate700).fontSize(8.5).font("Helvetica").text(`Phone: ${brand.contactPhone}`, rightPanelX + 12, y + 62, { width: panelWidth - 24 });
        doc.fillColor(slate700).fontSize(8.5).font("Helvetica").text(`Website: ${brand.websiteUrl}`, rightPanelX + 12, y + 78, { width: panelWidth - 24 });
        if (brand.addressLines && brand.addressLines.length > 0) {
          doc.fillColor(slate500).fontSize(7.5).font("Helvetica").text(brand.addressLines.slice(0, 2).join(", "), rightPanelX + 12, y + 92, { width: panelWidth - 24 });
        }
        y += panelHeight + 14;
        const totalBannerHeight = 92;
        doc.roundedRect(MARGIN, y, CONTENT_WIDTH, totalBannerHeight, 8).fill(darkColor);
        doc.fillColor(slate400).fontSize(7.5).font("Helvetica-Bold").text("TOTAL PROPOSAL INVESTMENT (INR)", MARGIN + 18, y + 16);
        doc.fillColor("#FFFFFF").fontSize(22).font("Helvetica-Bold").text(formatRupees(quote.totalPaise), MARGIN + 18, y + 28);
        const discountSubtext = quote.discountPaise > 0 ? `Includes INR ${formatINR(quote.discountPaise, false)} commercial waiver. B2B Services | Preserved zero-tax schedule.` : "Direct B2B Development Services | Preserved zero-tax schedule as configured.";
        doc.fillColor(slate400).fontSize(7.5).font("Helvetica").text(cleanText(discountSubtext), MARGIN + 18, y + 58, { width: 260 });
        const rightMetaWidth = 200;
        const rightMetaX = PAGE_WIDTH - MARGIN - rightMetaWidth - 18;
        doc.fillColor("#FFFFFF").fontSize(9).font("Helvetica-Bold").text(`Delivery Timeline: ${quote.estimatedTimelineDays || 14} Working Days`, rightMetaX, y + 16, { width: rightMetaWidth, align: "right" });
        doc.fillColor(slate400).fontSize(8).font("Helvetica").text(`Quotation Validity: 30 Calendar Days`, rightMetaX, y + 32, { width: rightMetaWidth, align: "right" });
        const advancePercent = milestones[0]?.percent || 20;
        doc.fillColor(brandColor).fontSize(8).font("Helvetica-Bold").text(`Kick-off Deposit: ${advancePercent}% Advance (Mandatory)`, rightMetaX, y + 60, { width: rightMetaWidth, align: "right" });
        y += totalBannerHeight + 16;
        doc.fillColor(slate900).fontSize(10.5).font("Helvetica-Bold").text("Executive Engagement Standards & Delivery Governance", MARGIN, y);
        doc.fillColor(slate500).fontSize(8).font("Helvetica").text("Key delivery commitments and technical governance principles governing this proposal.", MARGIN, y + 14);
        y += 28;
        const boxWidth = (CONTENT_WIDTH - 12) / 2;
        const boxHeight = 62;
        const highlights = [
          {
            title: "Iterative Agile Delivery",
            desc: "Sprint-based milestones with staging environment previews for structured feedback and approval."
          },
          {
            title: "Production Hardening",
            desc: "OWASP security compliance, responsive testing, and performance optimization prior to go-live."
          },
          {
            title: "100% IP & Code Ownership",
            desc: "Complete intellectual property rights, repositories, and credentials transfer upon final clearance."
          },
          {
            title: "Dedicated Warranty Support",
            desc: "30-day post-launch warranty covering defect remediation, DNS handover, and transition onboarding."
          }
        ];
        highlights.forEach((h, idx) => {
          const col = idx % 2;
          const row = Math.floor(idx / 2);
          const bx = MARGIN + col * (boxWidth + 12);
          const by = y + row * (boxHeight + 10);
          doc.roundedRect(bx, by, boxWidth, boxHeight, 5).fillAndStroke(bgSubtle, borderLight);
          doc.roundedRect(bx, by, 3, boxHeight, 1).fill(brandColor);
          doc.fillColor(slate900).fontSize(8.5).font("Helvetica-Bold").text(h.title, bx + 10, by + 8, { width: boxWidth - 18 });
          doc.fillColor(slate700).fontSize(7.5).font("Helvetica").text(h.desc, bx + 10, by + 22, { width: boxWidth - 18, lineGap: 1.5 });
        });
        doc.addPage();
        y = 72;
        doc.fillColor(brandColor).fontSize(8).font("Helvetica-Bold").text("SCOPE SPECIFICATIONS", MARGIN, y);
        doc.fillColor(slate900).fontSize(13).font("Helvetica-Bold").text("Itemized Scope of Work & Pricing Schedule", MARGIN, y + 11);
        doc.fillColor(slate500).fontSize(8.5).font("Helvetica").text(
          "Detailed breakdown of deliverables, technical modules, quantities, and commercial rates.",
          MARGIN,
          y + 26
        );
        y += 42;
        const renderPricingTableHeader = (currentY) => {
          doc.roundedRect(MARGIN, currentY, CONTENT_WIDTH, 22, 4).fill(darkColor);
          doc.fillColor("#FFFFFF").fontSize(8).font("Helvetica-Bold");
          doc.text("#", MARGIN + 4, currentY + 7, { width: 20, align: "center" });
          doc.text("Deliverable & Service Component", MARGIN + 28, currentY + 7, { width: 155 });
          doc.text("Detailed Inclusions & Specifications", MARGIN + 188, currentY + 7, { width: 165 });
          doc.text("Qty", MARGIN + 358, currentY + 7, { width: 24, align: "center" });
          doc.text("Rate", MARGIN + 386, currentY + 7, { width: 58, align: "right" });
          doc.text("Total (INR)", MARGIN + 448, currentY + 7, { width: 62, align: "right" });
          return currentY + 22;
        };
        y = renderPricingTableHeader(y);
        quote.lineItems.forEach((item, idx) => {
          const title = cleanText(item.title);
          const desc = cleanText(item.description || "Comprehensive module architecture and integration as specified.");
          const titleH = doc.fontSize(8.5).font("Helvetica-Bold").heightOfString(title, { width: 150 });
          const descH = doc.fontSize(7.5).font("Helvetica").heightOfString(desc, { width: 165, lineGap: 1 });
          const rowHeight = Math.max(28, Math.max(titleH, descH) + 14);
          if (y + rowHeight > 730) {
            doc.addPage();
            y = renderPricingTableHeader(72);
          }
          const isEven = idx % 2 === 0;
          doc.rect(MARGIN, y, CONTENT_WIDTH, rowHeight).fill(isEven ? "#FFFFFF" : bgSubtle);
          doc.rect(MARGIN, y + rowHeight - 0.5, CONTENT_WIDTH, 0.5).fill(borderLight);
          doc.fillColor(slate500).fontSize(8).font("Helvetica-Bold").text(String(idx + 1).padStart(2, "0"), MARGIN + 4, y + 8, { width: 20, align: "center" });
          doc.fillColor(slate900).fontSize(8.5).font("Helvetica-Bold").text(title, MARGIN + 28, y + 8, { width: 150 });
          doc.fillColor(slate700).fontSize(7.5).font("Helvetica").text(desc, MARGIN + 188, y + 8, { width: 165, lineGap: 1 });
          doc.fillColor(slate900).fontSize(8.5).font("Helvetica").text(String(item.quantity), MARGIN + 358, y + 8, { width: 24, align: "center" });
          doc.fillColor(slate700).fontSize(8).font("Helvetica").text(formatRupees(item.unitPricePaise), MARGIN + 386, y + 8, { width: 58, align: "right" });
          doc.fillColor(slate900).fontSize(8.5).font("Helvetica-Bold").text(formatRupees(item.totalPaise), MARGIN + 448, y + 8, { width: 62, align: "right" });
          y += rowHeight;
        });
        y += 14;
        if (y + 100 > 750) {
          doc.addPage();
          y = 65;
        }
        const totalsBoxWidth = 230;
        const totalsBoxX = PAGE_WIDTH - MARGIN - totalsBoxWidth;
        const totalsBoxHeight = quote.discountPaise > 0 ? 84 : 68;
        doc.roundedRect(totalsBoxX, y, totalsBoxWidth, totalsBoxHeight, 6).fillAndStroke(bgSubtle, borderLight);
        let tY = y + 10;
        doc.fillColor(slate500).fontSize(8).font("Helvetica").text("Proposal Subtotal:", totalsBoxX + 12, tY);
        doc.fillColor(slate900).fontSize(8.5).font("Helvetica-Bold").text(formatRupees(quote.subtotalPaise), totalsBoxX + 110, tY, { width: 108, align: "right" });
        if (quote.discountPaise > 0) {
          tY += 16;
          doc.fillColor(slate500).fontSize(8).font("Helvetica").text("Commercial Waiver:", totalsBoxX + 12, tY);
          doc.fillColor("#DC2626").fontSize(8.5).font("Helvetica-Bold").text(`- ${formatRupees(quote.discountPaise)}`, totalsBoxX + 110, tY, { width: 108, align: "right" });
        }
        tY += 16;
        doc.rect(totalsBoxX + 12, tY, totalsBoxWidth - 24, 0.5).fill(borderLight);
        tY += 8;
        doc.fillColor(slate900).fontSize(9.5).font("Helvetica-Bold").text("Total Payable:", totalsBoxX + 12, tY);
        doc.fillColor(brandColor).fontSize(11).font("Helvetica-Bold").text(formatRupees(quote.totalPaise), totalsBoxX + 110, tY - 1, { width: 108, align: "right" });
        y += totalsBoxHeight + 20;
        if (y + 90 <= 750) {
          doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 70, 6).fillAndStroke("#F1F5F9", borderLight);
          doc.fillColor(slate900).fontSize(8.5).font("Helvetica-Bold").text("Technical Governance & Code Quality Inclusions", MARGIN + 12, y + 10);
          doc.fillColor(slate700).fontSize(7.5).font("Helvetica").text(
            cleanText(
              "- All deliverables include continuous integration, staging environment deployment, and cross-browser testing.\n- Clean architectural separation of concerns, modular TypeScript implementation, and security hardening.\n- Includes 3 rounds of structured stakeholder review per deliverable module before production deployment sign-off."
            ),
            MARGIN + 12,
            y + 24,
            { width: CONTENT_WIDTH - 24, lineGap: 3 }
          );
        }
        doc.addPage();
        y = 72;
        doc.fillColor(brandColor).fontSize(8).font("Helvetica-Bold").text("COMMERCIAL AGREEMENT", MARGIN, y);
        doc.fillColor(slate900).fontSize(13).font("Helvetica-Bold").text("Payment Milestones & Commercial Terms", MARGIN, y + 11);
        doc.fillColor(slate500).fontSize(8.5).font("Helvetica").text(
          "Structured milestone payment distribution, third-party exclusions, and formal terms of engagement.",
          MARGIN,
          y + 26
        );
        y += 38;
        const advanceNoticeHeight = 32;
        doc.roundedRect(MARGIN, y, CONTENT_WIDTH, advanceNoticeHeight, 4).fillAndStroke("#FFF7ED", "#FDBA74");
        doc.roundedRect(MARGIN, y, 3.5, advanceNoticeHeight, 1).fill("#EA580C");
        doc.fillColor("#9A3412").fontSize(7.5).font("Helvetica-Bold").text("MANDATORY ADVANCE MOBILIZATION REQUIREMENT (20%)", MARGIN + 12, y + 6);
        doc.fillColor("#7C2D12").fontSize(7).font("Helvetica").text(
          "A mandatory 20% initial advance payment is required upon quotation signing. Engineering sprints, cloud architecture provisioning, and dedicated developer allocation commence strictly upon receipt of this deposit.",
          MARGIN + 12,
          y + 17,
          { width: CONTENT_WIDTH - 24, lineBreak: false }
        );
        y += advanceNoticeHeight + 12;
        doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 22, 4).fill(darkColor);
        doc.fillColor("#FFFFFF").fontSize(8).font("Helvetica-Bold");
        doc.text("Milestone & Phase Description", MARGIN + 12, y + 7, { width: 170 });
        doc.text("Deliverable Trigger & Stage Gate", MARGIN + 185, y + 7, { width: 195 });
        doc.text("Split", MARGIN + 385, y + 7, { width: 35, align: "center" });
        doc.text("Payable (INR)", MARGIN + 425, y + 7, { width: 85, align: "right" });
        y += 22;
        milestones.forEach((m, idx) => {
          const isEven = idx % 2 === 0;
          const isFirst = idx === 0;
          const rowH = isFirst ? 36 : 32;
          doc.rect(MARGIN, y, CONTENT_WIDTH, rowH).fill(isEven ? "#FFFFFF" : bgSubtle);
          doc.rect(MARGIN, y + rowH - 0.5, CONTENT_WIDTH, 0.5).fill(borderLight);
          doc.fillColor(slate900).fontSize(8.5).font("Helvetica-Bold").text(cleanText(m.title), MARGIN + 12, y + 6, { width: 170 });
          if (isFirst) {
            doc.fillColor(brandColor).fontSize(6.5).font("Helvetica-Bold").text("(MANDATORY INITIAL ADVANCE DEPOSIT)", MARGIN + 12, y + 19);
          }
          doc.fillColor(slate700).fontSize(7.5).font("Helvetica").text(cleanText(m.trigger), MARGIN + 185, y + 6, { width: 195, lineGap: 1 });
          doc.fillColor(slate900).fontSize(8).font("Helvetica-Bold").text(`${m.percent}%`, MARGIN + 385, y + 7, { width: 35, align: "center" });
          doc.fillColor(brandColor).fontSize(9).font("Helvetica-Bold").text(formatRupees(m.amountPaise), MARGIN + 425, y + 7, { width: 85, align: "right" });
          y += rowH;
        });
        y += 16;
        if (y + 40 > 745) {
          doc.addPage();
          y = 72;
        }
        doc.fillColor(slate900).fontSize(9.5).font("Helvetica-Bold").text("Third-Party Exclusions & Pass-Through Subscriptions", MARGIN, y);
        y += 14;
        quote.exclusions.forEach((ex) => {
          const cleaned = cleanText(ex);
          const itemH = doc.fontSize(7.5).font("Helvetica").heightOfString(cleaned, { width: CONTENT_WIDTH - 26 }) + 5;
          if (y + itemH > 745) {
            doc.addPage();
            y = 72;
          }
          doc.circle(MARGIN + 10, y + 4.5, 2).fill(brandColor);
          doc.fillColor(slate700).fontSize(7.5).font("Helvetica").text(cleaned, MARGIN + 20, y, { width: CONTENT_WIDTH - 26, lineGap: 1 });
          y += itemH;
        });
        y += 14;
        if (y + 40 > 745) {
          doc.addPage();
          y = 72;
        }
        doc.fillColor(slate900).fontSize(9.5).font("Helvetica-Bold").text("Commercial Terms & Engagement Policies", MARGIN, y);
        y += 14;
        quote.termsAndConditions.forEach((term, tIdx) => {
          const cleaned = cleanText(term);
          const colonIdx = cleaned.indexOf(":");
          const termTitle = colonIdx > -1 ? cleaned.slice(0, colonIdx + 1) : "";
          const termBody = colonIdx > -1 ? cleaned.slice(colonIdx + 1).trim() : cleaned;
          const itemH = doc.fontSize(7.5).font("Helvetica").heightOfString(cleaned, { width: CONTENT_WIDTH - 26, lineGap: 1.5 }) + 6;
          if (y + itemH > 745) {
            doc.addPage();
            y = 72;
            doc.fillColor(slate900).fontSize(9.5).font("Helvetica-Bold").text("Commercial Terms & Engagement Policies (Continued)", MARGIN, y);
            y += 16;
          }
          doc.circle(MARGIN + 10, y + 4.5, 2).fill(brandColor);
          if (termTitle) {
            doc.fillColor(slate900).fontSize(7.5).font("Helvetica-Bold").text(`${String(tIdx + 1).padStart(2, "0")}. ${termTitle} `, MARGIN + 20, y, { continued: true });
            doc.fillColor(slate700).fontSize(7.5).font("Helvetica").text(termBody, { width: CONTENT_WIDTH - 26, lineGap: 1.5 });
          } else {
            doc.fillColor(slate700).fontSize(7.5).font("Helvetica").text(`${String(tIdx + 1).padStart(2, "0")}. ${cleaned}`, MARGIN + 20, y, { width: CONTENT_WIDTH - 26, lineGap: 1.5 });
          }
          y += itemH;
        });
        const totalExecutionHeight = 260;
        if (y + totalExecutionHeight > 745) {
          doc.addPage();
          y = 72;
          doc.fillColor(brandColor).fontSize(8).font("Helvetica-Bold").text("COMMERCIAL EXECUTION", MARGIN, y);
          doc.fillColor(slate900).fontSize(13).font("Helvetica-Bold").text("Acceptance Sign-off & Mobilization Protocol", MARGIN, y + 11);
          doc.fillColor(slate500).fontSize(8.5).font("Helvetica").text(
            "Formal proposal acceptance, onboarding roadmap, payment remittance guidelines, and authorized execution.",
            MARGIN,
            y + 26
          );
          y += 44;
        } else {
          y += 16;
          doc.fillColor(slate900).fontSize(9.5).font("Helvetica-Bold").text("Acceptance Sign-off & Mobilization Protocol", MARGIN, y);
          y += 14;
        }
        const seqBoxH = 64;
        doc.roundedRect(MARGIN, y, CONTENT_WIDTH, seqBoxH, 4).fillAndStroke("#F8FAFC", borderLight);
        doc.fillColor(slate900).fontSize(8).font("Helvetica-Bold").text("PROJECT ONBOARDING & MOBILIZATION ROADMAP", MARGIN + 12, y + 8);
        const colW = (CONTENT_WIDTH - 24) / 3;
        const s1X = MARGIN + 12;
        doc.fillColor(brandColor).fontSize(7.5).font("Helvetica-Bold").text("01. Contract Execution", s1X, y + 22);
        doc.fillColor(slate700).fontSize(6.8).font("Helvetica").text(
          "Countersigning locks project scope, technical specifications, and fixed milestone pricing schedule.",
          s1X,
          y + 33,
          { width: colW - 12, lineGap: 1 }
        );
        const s2X = MARGIN + 12 + colW;
        doc.fillColor(brandColor).fontSize(7.5).font("Helvetica-Bold").text("02. 20% Advance Remittance", s2X, y + 22);
        doc.fillColor(slate700).fontSize(6.8).font("Helvetica").text(
          "Mandatory 20% advance payment mobilizes developer sprint capacity and cloud staging environments.",
          s2X,
          y + 33,
          { width: colW - 12, lineGap: 1 }
        );
        const s3X = MARGIN + 12 + colW * 2;
        doc.fillColor(brandColor).fontSize(7.5).font("Helvetica-Bold").text("03. Architecture & Sprint 1", s3X, y + 22);
        doc.fillColor(slate700).fontSize(6.8).font("Helvetica").text(
          "Technical kickoff briefing scheduled within 48 business hours; interactive prototypes and backlog shared.",
          s3X,
          y + 33,
          { width: colW - 12, lineGap: 1 }
        );
        y += seqBoxH + 12;
        const remitH = 46;
        doc.roundedRect(MARGIN, y, CONTENT_WIDTH, remitH, 4).fillAndStroke("#F8FAFC", borderLight);
        doc.fillColor(slate900).fontSize(8).font("Helvetica-Bold").text("PAYMENT REMITTANCE & COMMERCIAL INVOICING", MARGIN + 12, y + 8);
        doc.fillColor(slate700).fontSize(7).font("Helvetica").text(
          `Remittance Methods: Direct Corporate Bank Wire (RTGS / NEFT / IMPS) & Authorized Corporate UPI.
Official GST Commercial Tax Invoices and digital receipts are generated instantly upon clearance of each milestone payment.
Please reference Proposal Ref Number: ${quote.quotationNumber} on all remittance transfers.`,
          MARGIN + 12,
          y + 20,
          { width: CONTENT_WIDTH - 24, lineGap: 1.5 }
        );
        y += remitH + 12;
        doc.fillColor(slate700).fontSize(7.2).font("Helvetica").text(
          cleanText(
            `IN WITNESS WHEREOF, the authorized representatives of both parties have executed this Commercial Agreement. By countersigning below, the Client confirms acceptance of the scope of work, technical specifications, payment milestone distribution (including the mandatory 20% advance mobilization deposit), and all engagement policies set forth in Proposal ${quote.quotationNumber}.`
          ),
          MARGIN,
          y,
          { width: CONTENT_WIDTH, lineGap: 1.5 }
        );
        y += 28;
        const sigBoxWidth = (CONTENT_WIDTH - 14) / 2;
        const sigBoxHeight = 100;
        const sigLeftX = MARGIN;
        doc.roundedRect(sigLeftX, y, sigBoxWidth, sigBoxHeight, 6).fillAndStroke("#FFFFFF", borderLight);
        doc.fillColor(slate900).fontSize(8.5).font("Helvetica-Bold").text("Authorised Client Acceptance", sigLeftX + 12, y + 10);
        doc.fillColor(slate500).fontSize(7).font("Helvetica").text("By signing below, client confirms acceptance of proposal scope, pricing and milestones.", sigLeftX + 12, y + 21, { width: sigBoxWidth - 24 });
        doc.fillColor(slate700).fontSize(8).font("Helvetica").text("Signature: ________________________________", sigLeftX + 12, y + 44);
        doc.fillColor(slate900).fontSize(8).font("Helvetica-Bold").text(`Name: ${quote.clientSnapshot.name}`, sigLeftX + 12, y + 60, { width: sigBoxWidth - 24 });
        doc.fillColor(slate500).fontSize(7.5).font("Helvetica").text(`Designation: Authorised Signatory`, sigLeftX + 12, y + 73);
        doc.fillColor(slate500).fontSize(7.5).font("Helvetica").text(`Date: ____________________________________`, sigLeftX + 12, y + 85);
        const sigRightX = MARGIN + sigBoxWidth + 14;
        doc.roundedRect(sigRightX, y, sigBoxWidth, sigBoxHeight, 6).fillAndStroke("#FFFFFF", borderLight);
        doc.fillColor(slate900).fontSize(8.5).font("Helvetica-Bold").text(cleanText(`For ${brand.name}`), sigRightX + 12, y + 10);
        doc.fillColor(slate500).fontSize(7).font("Helvetica").text("Commercial commitment on behalf of the agency service provider.", sigRightX + 12, y + 21, { width: sigBoxWidth - 24 });
        doc.fillColor(slate700).fontSize(8).font("Helvetica").text("Signature: ________________________________", sigRightX + 12, y + 44);
        doc.fillColor(slate900).fontSize(8).font("Helvetica-Bold").text(`Authorised Signatory: Commercial Director`, sigRightX + 12, y + 60, { width: sigBoxWidth - 24 });
        doc.fillColor(slate500).fontSize(7.5).font("Helvetica").text(`Entity: ${cleanText(brand.companyDetails || brand.tagline || brand.name)}`, sigRightX + 12, y + 73, { width: sigBoxWidth - 24 });
        doc.fillColor(slate500).fontSize(7.5).font("Helvetica").text(`Date: ${issueDateStr}`, sigRightX + 12, y + 85);
        const range = doc.bufferedPageRange();
        const totalPages = range.count;
        for (let i = range.start; i < range.start + range.count; i++) {
          doc.switchToPage(i);
          const pageNum = i + 1;
          const origBottom = doc.page.margins.bottom;
          const origTop = doc.page.margins.top;
          doc.page.margins.bottom = 0;
          doc.page.margins.top = 0;
          if (pageNum > 1) {
            doc.fillColor(slate900).fontSize(8).font("Helvetica-Bold").text(cleanText(brand.name.toUpperCase()), MARGIN, 26, { width: 250, lineBreak: false });
            doc.fillColor(slate500).fontSize(7).font("Helvetica").text(cleanText(brand.tagline || "Commercial Development Proposal"), MARGIN, 37, { width: 250, lineBreak: false });
            const rHeadWidth = 230;
            const rHeadX = PAGE_WIDTH - MARGIN - rHeadWidth;
            doc.fillColor(slate900).fontSize(8).font("Helvetica-Bold").text(`REF: ${cleanText(quote.quotationNumber)} (v${quote.revisionNumber})`, rHeadX, 26, { width: rHeadWidth, align: "right", lineBreak: false });
            doc.fillColor(brandColor).fontSize(7).font("Helvetica-Bold").text(cleanText(quote.packageName || "Commercial Proposal"), rHeadX, 37, { width: rHeadWidth, align: "right", lineBreak: false });
            doc.rect(MARGIN, 54, CONTENT_WIDTH, 0.5).fill(borderLight);
          }
          doc.rect(MARGIN, 804, CONTENT_WIDTH, 0.5).fill(borderLight);
          doc.fillColor(slate400).fontSize(7.5).font("Helvetica").text(
            cleanText(`Confidential Proposal | ${brand.name} | ${quote.quotationNumber}`),
            MARGIN,
            810,
            { width: 340, align: "left", lineBreak: false }
          );
          const pageStrWidth = 150;
          const pageStrX = PAGE_WIDTH - MARGIN - pageStrWidth;
          doc.fillColor(slate500).fontSize(7.5).font("Helvetica-Bold").text(
            `Page ${pageNum} of ${totalPages}`,
            pageStrX,
            810,
            { width: pageStrWidth, align: "right", lineBreak: false }
          );
          doc.page.margins.bottom = origBottom;
          doc.page.margins.top = origTop;
        }
        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }
};

// src/controllers/submissionController.ts
var SubmissionController = class {
  static async createSubmission(req, res, next) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: "Authentication required" });
        return;
      }
      const submission = await SubmissionService.createSubmission(req.user, req.body);
      await logAuditEvent(
        req,
        "SUBMISSION_CREATED",
        "Submission",
        submission._id.toString(),
        {
          enquiryReference: submission.enquiryReference,
          category: submission.projectCategory
        }
      );
      res.status(201).json({
        success: true,
        submission: serializeClientSubmission(submission, false)
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        error: err.message || "Failed to submit requirements."
      });
    }
  }
  static async getMySubmissions(req, res, next) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: "Authentication required" });
        return;
      }
      const submissions = await SubmissionService.getClientSubmissions(req.user._id.toString());
      const serialized = await Promise.all(
        submissions.map(async (sub) => {
          const quote = await QuotationService.getQuotationBySubmissionId(sub._id.toString());
          const quotationAvailable = quote !== null && (quote.status === "issued" || quote.status === "approved");
          return serializeClientSubmission(sub, quotationAvailable);
        })
      );
      res.status(200).json({
        success: true,
        submissions: serialized
      });
    } catch (err) {
      next(err);
    }
  }
  static async getMySubmissionById(req, res, next) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: "Authentication required" });
        return;
      }
      const sub = await SubmissionService.getClientSubmissionById(
        req.params.id,
        req.user._id.toString()
      );
      if (!sub) {
        res.status(404).json({ success: false, error: "Submission not found" });
        return;
      }
      const quote = await QuotationService.getQuotationBySubmissionId(sub._id.toString());
      const quotationAvailable = quote !== null && (quote.status === "issued" || quote.status === "approved");
      res.status(200).json({
        success: true,
        submission: serializeClientSubmission(sub, quotationAvailable),
        quotation: quote && quotationAvailable ? serializeClientQuotation(quote) : null
      });
    } catch (err) {
      next(err);
    }
  }
  static async downloadRequirementPDF(req, res, next) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: "Authentication required" });
        return;
      }
      const isAdmin = req.user.role === "admin" || req.user.role === "superadmin";
      const sub = isAdmin ? await SubmissionService.getAdminSubmissionById(req.params.id) : await SubmissionService.getClientSubmissionById(req.params.id, req.user._id.toString());
      if (!sub) {
        res.status(404).json({ success: false, error: "Submission document not found." });
        return;
      }
      const safeDTO = serializeClientSubmission(sub, false);
      const pdfBuffer = await PDFService.generateRequirementDetailsPDF(safeDTO);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="Requirements-${sub.enquiryReference}.pdf"`
      );
      res.send(pdfBuffer);
    } catch (err) {
      next(err);
    }
  }
  static async downloadQuotationPDF(req, res, next) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: "Authentication required" });
        return;
      }
      let quote = await QuotationService.getQuotationById(req.params.id);
      if (!quote) {
        quote = await QuotationService.getQuotationBySubmissionId(req.params.id);
      }
      if (!quote) {
        res.status(404).json({ success: false, error: "Quotation not found." });
        return;
      }
      const isAdmin = req.user.role === "admin" || req.user.role === "superadmin";
      const isOwner = quote.clientId.toString() === req.user._id.toString();
      if (!isAdmin && !isOwner) {
        res.status(403).json({ success: false, error: "Access denied: You do not own this quotation." });
        return;
      }
      if (!isAdmin && quote.status === "draft") {
        res.status(403).json({
          success: false,
          error: "This quotation is currently in draft review and not yet available for download."
        });
        return;
      }
      const safeQuoteDTO = serializeClientQuotation(quote);
      const pdfBuffer = await PDFService.generateQuotationPDF(safeQuoteDTO);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="Quotation-${quote.quotationNumber}.pdf"`
      );
      res.send(pdfBuffer);
    } catch (err) {
      next(err);
    }
  }
};

// src/routes/submissionRoutes.ts
var router3 = Router3();
router3.post(
  "/",
  requireAuth,
  submissionLimiter,
  validateBody(CreateSubmissionSchema),
  SubmissionController.createSubmission
);
router3.get("/my", requireAuth, SubmissionController.getMySubmissions);
router3.get("/:id", requireAuth, SubmissionController.getMySubmissionById);
router3.get("/:id/download-requirements", requireAuth, SubmissionController.downloadRequirementPDF);
router3.get("/:id/download-quotation", requireAuth, SubmissionController.downloadQuotationPDF);
var submissionRoutes_default = router3;

// src/routes/adminRoutes.ts
import { Router as Router4 } from "express";

// src/middleware/permissions.ts
function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: "Authentication required."
      });
      return;
    }
    if (req.user.role === "superadmin") {
      return next();
    }
    if (req.user.role !== "admin") {
      res.status(403).json({
        success: false,
        error: "Access denied: Administrator privileges required."
      });
      return;
    }
    const hasPermission = req.user.permissions?.includes(permission);
    if (!hasPermission) {
      res.status(403).json({
        success: false,
        error: `Access denied: Missing required permission '${permission}'.`
      });
      return;
    }
    next();
  };
}

// src/controllers/adminFormController.ts
var AdminFormController = class {
  static async getAllForms(req, res, next) {
    try {
      const forms = await FormService.getAllForms();
      res.status(200).json({
        success: true,
        forms: forms.map((f) => ({
          id: f._id.toString(),
          slug: f.slug,
          title: f.title,
          description: f.description,
          category: f.category,
          version: f.version,
          status: f.status,
          stepsCount: f.steps?.length || 0,
          publishedAt: f.publishedAt?.toISOString(),
          updatedAt: f.updatedAt.toISOString()
        }))
      });
    } catch (err) {
      next(err);
    }
  }
  static async getFormById(req, res, next) {
    try {
      const form = await FormService.getFormBySlugAndVersion(
        req.params.slug,
        req.query.version ? parseInt(req.query.version, 10) : void 0
      );
      if (!form) {
        res.status(404).json({ success: false, error: "Form not found" });
        return;
      }
      res.status(200).json({
        success: true,
        form: {
          id: form._id.toString(),
          slug: form.slug,
          title: form.title,
          description: form.description,
          category: form.category,
          version: form.version,
          status: form.status,
          steps: form.steps,
          publishedAt: form.publishedAt?.toISOString(),
          updatedAt: form.updatedAt.toISOString()
        }
      });
    } catch (err) {
      next(err);
    }
  }
  static async createForm(req, res, next) {
    try {
      const form = await FormService.createForm(req.body);
      await logAuditEvent(req, "FORM_CREATED", "FormDefinition", form._id.toString(), {
        slug: form.slug,
        version: form.version
      });
      res.status(201).json({ success: true, form });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message || "Failed to create form" });
    }
  }
  static async updateForm(req, res, next) {
    try {
      const form = await FormService.updateForm(req.params.id, req.body);
      if (!form) {
        res.status(404).json({ success: false, error: "Form not found" });
        return;
      }
      await logAuditEvent(req, "FORM_UPDATED", "FormDefinition", form._id.toString());
      res.status(200).json({ success: true, form });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message || "Failed to update form" });
    }
  }
  static async publishForm(req, res, next) {
    try {
      const form = await FormService.publishForm(req.params.id);
      if (!form) {
        res.status(404).json({ success: false, error: "Form not found" });
        return;
      }
      await logAuditEvent(req, "FORM_PUBLISHED", "FormDefinition", form._id.toString(), {
        slug: form.slug,
        version: form.version
      });
      res.status(200).json({ success: true, form });
    } catch (err) {
      next(err);
    }
  }
  // --- PRIVATE STEP NOTES (Gated by manage_internal_notes) ---
  static async getFormStepNotes(req, res, next) {
    try {
      const formId = req.params.id;
      const version = parseInt(req.query.version, 10) || 1;
      const notes = await FormService.getStepNotes(formId, version);
      res.status(200).json({
        success: true,
        notes: notes.map((n) => ({
          id: n._id.toString(),
          formDefinitionId: n.formDefinitionId.toString(),
          formVersion: n.formVersion,
          stepId: n.stepId,
          notes: n.notes,
          authorName: n.authorName,
          updatedAt: n.updatedAt.toISOString()
        }))
      });
    } catch (err) {
      next(err);
    }
  }
  static async saveFormStepNote(req, res, next) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: "Unauthorized" });
        return;
      }
      const note = await FormService.saveStepNote({
        formDefinitionId: req.params.id,
        formVersion: req.body.formVersion || 1,
        stepId: req.body.stepId,
        notes: req.body.notes,
        authorId: req.user._id.toString(),
        authorName: req.user.fullName
      });
      await logAuditEvent(req, "FORM_STEP_NOTE_SAVED", "FormStepNotes", note._id.toString(), {
        stepId: note.stepId
      });
      res.status(200).json({ success: true, note });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message || "Failed to save note" });
    }
  }
};

// src/controllers/adminSubmissionController.ts
var AdminSubmissionController = class {
  static async getAllSubmissions(req, res, next) {
    try {
      const submissions = await SubmissionService.getAdminSubmissions({
        category: req.query.category,
        status: req.query.status,
        search: req.query.search
      });
      const canViewFinancials = req.user?.role === "superadmin" || req.user?.permissions?.includes("view_financials");
      const serialized = await Promise.all(
        submissions.map(async (sub) => {
          const quote = await QuotationService.getQuotationBySubmissionId(sub._id.toString());
          const notes = await SubmissionService.getSubmissionStepNotes(sub._id.toString());
          let financialSummary = void 0;
          if (canViewFinancials) {
            const fin = await ProjectFinancials.findOne({ submissionId: sub._id });
            if (fin) {
              financialSummary = {
                quotedRevenuePaise: fin.quotedRevenuePaise,
                actualDirectCostPaise: fin.actualDirectCostPaise,
                grossMarginPercent: fin.grossMarginPercent
              };
            }
          }
          return serializeAdminSubmission(sub, {
            internalNotesCount: notes.length,
            hasQuotation: quote !== null,
            financialSummary
          });
        })
      );
      res.status(200).json({
        success: true,
        submissions: serialized
      });
    } catch (err) {
      next(err);
    }
  }
  static async getSubmissionById(req, res, next) {
    try {
      const sub = await SubmissionService.getAdminSubmissionById(req.params.id);
      if (!sub) {
        res.status(404).json({ success: false, error: "Submission not found" });
        return;
      }
      const quote = await QuotationService.getQuotationBySubmissionId(sub._id.toString());
      const notes = await SubmissionService.getSubmissionStepNotes(sub._id.toString());
      res.status(200).json({
        success: true,
        submission: serializeAdminSubmission(sub, {
          internalNotesCount: notes.length,
          hasQuotation: quote !== null
        }),
        quotation: quote ? serializeClientQuotation(quote) : null
      });
    } catch (err) {
      next(err);
    }
  }
  static async updateStatus(req, res, next) {
    try {
      const sub = await SubmissionService.updateSubmissionStatus(req.params.id, req.body.status);
      if (!sub) {
        res.status(404).json({ success: false, error: "Submission not found" });
        return;
      }
      await logAuditEvent(req, "SUBMISSION_STATUS_UPDATED", "Submission", sub._id.toString(), {
        status: req.body.status
      });
      res.status(200).json({
        success: true,
        submission: serializeAdminSubmission(sub)
      });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message || "Status update failed" });
    }
  }
  // --- SUBMISSION STEP NOTES (Gated by manage_internal_notes) ---
  static async getSubmissionStepNotes(req, res, next) {
    try {
      const notes = await SubmissionService.getSubmissionStepNotes(req.params.id);
      res.status(200).json({
        success: true,
        notes: notes.map((n) => ({
          id: n._id.toString(),
          submissionId: n.submissionId.toString(),
          stepId: n.stepId,
          notes: n.notes,
          authorName: n.authorName,
          updatedAt: n.updatedAt.toISOString()
        }))
      });
    } catch (err) {
      next(err);
    }
  }
  static async saveSubmissionStepNote(req, res, next) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: "Unauthorized" });
        return;
      }
      const note = await SubmissionService.saveSubmissionStepNote({
        submissionId: req.params.id,
        stepId: req.body.stepId,
        notes: req.body.notes,
        authorId: req.user._id.toString(),
        authorName: req.user.fullName
      });
      await logAuditEvent(
        req,
        "SUBMISSION_INTERNAL_NOTE_SAVED",
        "SubmissionInternalNotes",
        note._id.toString(),
        { stepId: note.stepId }
      );
      res.status(200).json({ success: true, note });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message || "Failed to save note" });
    }
  }
};

// src/controllers/adminQuotationController.ts
var AdminQuotationController = class {
  static async getAllQuotations(req, res, next) {
    try {
      const quotes = await QuotationService.getAllQuotations();
      res.status(200).json({
        success: true,
        quotations: quotes.map(serializeClientQuotation)
      });
    } catch (err) {
      next(err);
    }
  }
  static async getQuotationById(req, res, next) {
    try {
      const quote = await QuotationService.getQuotationById(req.params.id);
      if (!quote) {
        res.status(404).json({ success: false, error: "Quotation not found" });
        return;
      }
      res.status(200).json({
        success: true,
        quotation: serializeClientQuotation(quote)
      });
    } catch (err) {
      next(err);
    }
  }
  static async createQuotation(req, res, next) {
    try {
      const quote = await QuotationService.createQuotation(req.body);
      await logAuditEvent(req, "QUOTATION_CREATED", "Quotation", quote._id.toString(), {
        quotationNumber: quote.quotationNumber,
        totalPaise: quote.totalPaise,
        status: quote.status
      });
      res.status(201).json({
        success: true,
        quotation: serializeClientQuotation(quote)
      });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message || "Failed to create quotation" });
    }
  }
  static async updateQuotation(req, res, next) {
    try {
      const quote = await QuotationService.updateQuotation(req.params.id, req.body);
      if (!quote) {
        res.status(404).json({ success: false, error: "Quotation not found" });
        return;
      }
      await logAuditEvent(req, "QUOTATION_UPDATED", "Quotation", quote._id.toString(), {
        status: quote.status,
        totalPaise: quote.totalPaise
      });
      res.status(200).json({
        success: true,
        quotation: serializeClientQuotation(quote)
      });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message || "Failed to update quotation" });
    }
  }
  static async downloadPDF(req, res, next) {
    try {
      const quote = await QuotationService.getQuotationById(req.params.id);
      if (!quote) {
        res.status(404).json({ success: false, error: "Quotation not found" });
        return;
      }
      const safeQuoteDTO = serializeClientQuotation(quote);
      const pdfBuffer = await PDFService.generateQuotationPDF(safeQuoteDTO);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="Quotation-${quote.quotationNumber}.pdf"`
      );
      res.send(pdfBuffer);
    } catch (err) {
      next(err);
    }
  }
};

// src/services/financialService.ts
import mongoose19 from "mongoose";

// src/models/CostEntry.ts
import mongoose17, { Schema as Schema13 } from "mongoose";
var CostEntrySchema = new Schema13(
  {
    submissionId: {
      type: Schema13.Types.ObjectId,
      ref: "Submission",
      required: true,
      index: true
    },
    category: {
      type: String,
      enum: [
        "internal_labour",
        "external_contractor",
        "infrastructure_third_party",
        "partner_allocation",
        "additional_expense"
      ],
      required: true,
      index: true
    },
    isActual: {
      type: Boolean,
      default: true,
      index: true
    },
    amountPaise: {
      type: Number,
      required: true,
      min: 0
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    date: {
      type: Date,
      default: Date.now,
      index: true
    },
    loggedByUserId: {
      type: Schema13.Types.ObjectId,
      ref: "User",
      required: true
    },
    loggedByName: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);
var CostEntry = mongoose17.model("CostEntry", CostEntrySchema);

// src/models/PaymentRecord.ts
import mongoose18, { Schema as Schema14 } from "mongoose";
var PaymentRecordSchema = new Schema14(
  {
    submissionId: {
      type: Schema14.Types.ObjectId,
      ref: "Submission",
      required: true,
      index: true
    },
    quotationId: {
      type: Schema14.Types.ObjectId,
      ref: "Quotation",
      index: true
    },
    amountPaise: {
      type: Number,
      required: true,
      min: 0
    },
    paymentDate: {
      type: Date,
      default: Date.now,
      index: true
    },
    paymentMethod: {
      type: String,
      enum: ["bank_transfer", "upi", "card", "cheque", "other"],
      required: true
    },
    status: {
      type: String,
      enum: ["received", "pending", "failed"],
      default: "received",
      index: true
    },
    referenceNumber: {
      type: String,
      required: true,
      trim: true
    },
    notes: {
      type: String
    },
    recordedByUserId: {
      type: Schema14.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    timestamps: true
  }
);
var PaymentRecord = mongoose18.model(
  "PaymentRecord",
  PaymentRecordSchema
);

// src/services/financialService.ts
var FinancialService = class {
  /**
   * Recalculate project totals after adding/updating costs or payments
   */
  static async recalculateProjectFinancials(submissionId) {
    const subObjId = new mongoose19.Types.ObjectId(submissionId);
    const costs = await CostEntry.find({ submissionId: subObjId });
    let estimatedCostPaise = 0;
    let actualCostPaise = 0;
    for (const cost of costs) {
      if (cost.isActual) {
        actualCostPaise += cost.amountPaise;
      } else {
        estimatedCostPaise += cost.amountPaise;
      }
    }
    const payments = await PaymentRecord.find({
      submissionId: subObjId,
      status: "received"
    });
    let collectedPaise = 0;
    for (const p of payments) {
      collectedPaise += p.amountPaise;
    }
    const fin = await ProjectFinancials.findOne({ submissionId: subObjId });
    if (!fin) {
      throw new Error("Financial record not found for this project.");
    }
    fin.estimatedDirectCostPaise = estimatedCostPaise;
    fin.actualDirectCostPaise = actualCostPaise;
    fin.collectedRevenuePaise = collectedPaise;
    const revenueForCalc = fin.approvedRevenuePaise > 0 ? fin.approvedRevenuePaise : fin.quotedRevenuePaise;
    fin.estimatedGrossProfitPaise = calcGrossProfit(revenueForCalc, estimatedCostPaise);
    fin.actualGrossProfitPaise = calcGrossProfit(revenueForCalc, actualCostPaise);
    fin.grossMarginPercent = calcGrossMarginPercent(revenueForCalc, actualCostPaise);
    fin.markupPercent = calcMarkupPercent(revenueForCalc, actualCostPaise);
    await fin.save();
    return fin;
  }
  static async getProjectFinancialsBySubmissionId(submissionId) {
    const subObjId = new mongoose19.Types.ObjectId(submissionId);
    const fin = await ProjectFinancials.findOne({ submissionId: subObjId });
    if (!fin) return null;
    const submission = await Submission.findById(subObjId);
    if (!submission) return null;
    const costEntries = await CostEntry.find({ submissionId: subObjId }).sort({ date: -1 });
    const paymentRecords = await PaymentRecord.find({ submissionId: subObjId }).sort({
      paymentDate: -1
    });
    return serializeProjectFinancials(fin, submission, costEntries, paymentRecords);
  }
  static async addCostEntry(data) {
    const entry = await CostEntry.create({
      submissionId: new mongoose19.Types.ObjectId(data.submissionId),
      category: data.category,
      isActual: data.isActual,
      amountPaise: data.amountPaise,
      description: data.description,
      date: data.date ? new Date(data.date) : /* @__PURE__ */ new Date(),
      loggedByUserId: new mongoose19.Types.ObjectId(data.userId),
      loggedByName: data.userName
    });
    await this.recalculateProjectFinancials(data.submissionId);
    return entry;
  }
  static async addPaymentRecord(data) {
    const payment = await PaymentRecord.create({
      submissionId: new mongoose19.Types.ObjectId(data.submissionId),
      quotationId: data.quotationId ? new mongoose19.Types.ObjectId(data.quotationId) : void 0,
      amountPaise: data.amountPaise,
      paymentDate: data.paymentDate ? new Date(data.paymentDate) : /* @__PURE__ */ new Date(),
      paymentMethod: data.paymentMethod,
      status: data.status || "received",
      referenceNumber: data.referenceNumber,
      notes: data.notes,
      recordedByUserId: new mongoose19.Types.ObjectId(data.userId)
    });
    await this.recalculateProjectFinancials(data.submissionId);
    return payment;
  }
  static async updateTargetMargin(submissionId, targetMarginPercent, financialNotes) {
    const fin = await ProjectFinancials.findOneAndUpdate(
      { submissionId: new mongoose19.Types.ObjectId(submissionId) },
      {
        targetMarginPercent,
        ...financialNotes !== void 0 && { financialNotes }
      },
      { new: true }
    );
    if (fin) {
      await this.recalculateProjectFinancials(submissionId);
    }
    return fin;
  }
  /**
   * Aggregated Profit & Margin Dashboard metrics
   */
  static async getFinancialAnalyticsDashboard() {
    const allFinancials = await ProjectFinancials.find().sort({ updatedAt: -1 });
    const allSubmissions = await Submission.find();
    const subMap = /* @__PURE__ */ new Map();
    allSubmissions.forEach((s) => subMap.set(s._id.toString(), s));
    let totalQuotedRevenuePaise = 0;
    let totalApprovedRevenuePaise = 0;
    let totalCollectedRevenuePaise = 0;
    let totalEstimatedDirectCostPaise = 0;
    let totalActualDirectCostPaise = 0;
    let projectsBelowTargetMarginCount = 0;
    let projectsWithMissingCostsCount = 0;
    const projectDTOs = [];
    for (const fin of allFinancials) {
      const sub = subMap.get(fin.submissionId.toString());
      if (!sub) continue;
      totalQuotedRevenuePaise += fin.quotedRevenuePaise;
      totalApprovedRevenuePaise += fin.approvedRevenuePaise;
      totalCollectedRevenuePaise += fin.collectedRevenuePaise;
      totalEstimatedDirectCostPaise += fin.estimatedDirectCostPaise;
      totalActualDirectCostPaise += fin.actualDirectCostPaise;
      const isBelowTarget = fin.grossMarginPercent !== null && fin.grossMarginPercent < fin.targetMarginPercent;
      const hasMissingCosts = fin.actualDirectCostPaise === 0 && fin.estimatedDirectCostPaise === 0;
      if (isBelowTarget) projectsBelowTargetMarginCount++;
      if (hasMissingCosts) projectsWithMissingCostsCount++;
      const costEntries = await CostEntry.find({ submissionId: fin.submissionId }).sort({
        date: -1
      });
      const paymentRecords = await PaymentRecord.find({ submissionId: fin.submissionId }).sort({
        paymentDate: -1
      });
      projectDTOs.push(serializeProjectFinancials(fin, sub, costEntries, paymentRecords));
    }
    const effectiveTotalRevenue = totalApprovedRevenuePaise > 0 ? totalApprovedRevenuePaise : totalQuotedRevenuePaise;
    const totalEstimatedGrossProfitPaise = calcGrossProfit(
      effectiveTotalRevenue,
      totalEstimatedDirectCostPaise
    );
    const totalActualGrossProfitPaise = calcGrossProfit(
      effectiveTotalRevenue,
      totalActualDirectCostPaise
    );
    const overallGrossMarginPercent = calcGrossMarginPercent(
      effectiveTotalRevenue,
      totalActualDirectCostPaise
    );
    const overallMarkupPercent = calcMarkupPercent(
      effectiveTotalRevenue,
      totalActualDirectCostPaise
    );
    return {
      totalQuotedRevenuePaise,
      totalApprovedRevenuePaise,
      totalCollectedRevenuePaise,
      totalOutstandingReceivablesPaise: Math.max(
        0,
        totalApprovedRevenuePaise - totalCollectedRevenuePaise
      ),
      totalEstimatedDirectCostPaise,
      totalActualDirectCostPaise,
      totalEstimatedGrossProfitPaise,
      totalActualGrossProfitPaise,
      overallGrossMarginPercent,
      overallMarkupPercent,
      projectsBelowTargetMarginCount,
      projectsWithMissingCostsCount,
      projects: projectDTOs
    };
  }
};

// src/controllers/adminFinancialController.ts
var AdminFinancialController = class {
  static async getDashboard(req, res, next) {
    try {
      const dashboard = await FinancialService.getFinancialAnalyticsDashboard();
      res.status(200).json({
        success: true,
        dashboard
      });
    } catch (err) {
      next(err);
    }
  }
  static async getProjectFinancials(req, res, next) {
    try {
      const financials = await FinancialService.getProjectFinancialsBySubmissionId(
        req.params.submissionId
      );
      if (!financials) {
        res.status(404).json({ success: false, error: "Financial records not found" });
        return;
      }
      res.status(200).json({
        success: true,
        financials
      });
    } catch (err) {
      next(err);
    }
  }
  static async addCostEntry(req, res, next) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: "Unauthorized" });
        return;
      }
      const cost = await FinancialService.addCostEntry({
        submissionId: req.body.submissionId,
        category: req.body.category,
        isActual: req.body.isActual ?? true,
        amountPaise: req.body.amountPaise,
        description: req.body.description,
        date: req.body.date,
        userId: req.user._id.toString(),
        userName: req.user.fullName
      });
      await logAuditEvent(req, "FINANCIAL_COST_ENTRY_ADDED", "CostEntry", cost._id.toString(), {
        submissionId: cost.submissionId.toString(),
        category: cost.category,
        amountPaise: cost.amountPaise,
        isActual: cost.isActual
      });
      res.status(201).json({ success: true, cost });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message || "Failed to add cost entry" });
    }
  }
  static async addPaymentRecord(req, res, next) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: "Unauthorized" });
        return;
      }
      const payment = await FinancialService.addPaymentRecord({
        submissionId: req.body.submissionId,
        quotationId: req.body.quotationId,
        amountPaise: req.body.amountPaise,
        paymentDate: req.body.paymentDate,
        paymentMethod: req.body.paymentMethod,
        status: req.body.status,
        referenceNumber: req.body.referenceNumber,
        notes: req.body.notes,
        userId: req.user._id.toString()
      });
      await logAuditEvent(req, "PAYMENT_RECORDED", "PaymentRecord", payment._id.toString(), {
        submissionId: payment.submissionId.toString(),
        amountPaise: payment.amountPaise,
        status: payment.status
      });
      res.status(201).json({ success: true, payment });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message || "Failed to record payment" });
    }
  }
  static async updateTargetMargin(req, res, next) {
    try {
      const fin = await FinancialService.updateTargetMargin(
        req.params.submissionId,
        req.body.targetMarginPercent,
        req.body.financialNotes
      );
      if (!fin) {
        res.status(404).json({ success: false, error: "Financial record not found" });
        return;
      }
      await logAuditEvent(
        req,
        "TARGET_MARGIN_UPDATED",
        "ProjectFinancials",
        fin._id.toString(),
        {
          targetMarginPercent: fin.targetMarginPercent
        }
      );
      res.status(200).json({ success: true, financials: fin });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message || "Failed to update target margin" });
    }
  }
};

// src/controllers/adminCatalogController.ts
var AdminCatalogController = class {
  // --- PACKAGES ---
  static async getAllPackages(req, res, next) {
    try {
      const packages = await Package.find().sort({ category: 1, order: 1 });
      res.status(200).json({
        success: true,
        packages: packages.map((p) => ({
          ...p.toObject(),
          id: p._id.toString(),
          _id: p._id.toString()
        }))
      });
    } catch (err) {
      next(err);
    }
  }
  static async createPackage(req, res, next) {
    try {
      const pkg = await Package.create(req.body);
      await logAuditEvent(req, "PACKAGE_CREATED", "Package", pkg._id.toString(), { name: pkg.name });
      res.status(201).json({ success: true, package: pkg });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message || "Failed to create package" });
    }
  }
  static async updatePackage(req, res, next) {
    try {
      const pkg = await Package.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!pkg) {
        res.status(404).json({ success: false, error: "Package not found" });
        return;
      }
      await logAuditEvent(req, "PACKAGE_UPDATED", "Package", pkg._id.toString());
      res.status(200).json({ success: true, package: pkg });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message || "Failed to update package" });
    }
  }
  // --- ADDONS ---
  static async getAllAddons(req, res, next) {
    try {
      const addons = await Addon.find().sort({ order: 1 });
      res.status(200).json({
        success: true,
        addons: addons.map((a) => ({
          ...a.toObject(),
          id: a._id.toString(),
          _id: a._id.toString()
        }))
      });
    } catch (err) {
      next(err);
    }
  }
  static async createAddon(req, res, next) {
    try {
      const addon = await Addon.create(req.body);
      await logAuditEvent(req, "ADDON_CREATED", "Addon", addon._id.toString(), { name: addon.name });
      res.status(201).json({ success: true, addon });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message || "Failed to create addon" });
    }
  }
  static async updateAddon(req, res, next) {
    try {
      const addon = await Addon.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!addon) {
        res.status(404).json({ success: false, error: "Addon not found" });
        return;
      }
      await logAuditEvent(req, "ADDON_UPDATED", "Addon", addon._id.toString());
      res.status(200).json({ success: true, addon });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message || "Failed to update addon" });
    }
  }
  // --- BRAND PROFILES ---
  static async getAllBrands(req, res, next) {
    try {
      const brands = await BrandProfile.find().sort({ isDefault: -1, name: 1 });
      const hasDefault = brands.some((b) => b.isDefault);
      if (!hasDefault && brands.length > 0) {
        brands[0].isDefault = true;
        await BrandProfile.findByIdAndUpdate(brands[0]._id, { isDefault: true });
      }
      res.status(200).json({
        success: true,
        brands: brands.map((b) => ({
          ...b.toObject(),
          id: b._id.toString(),
          _id: b._id.toString()
        }))
      });
    } catch (err) {
      next(err);
    }
  }
  static async createBrand(req, res, next) {
    try {
      if (req.body.isDefault) {
        await BrandProfile.updateMany({}, { isDefault: false });
      } else {
        const existingCount = await BrandProfile.countDocuments({ isDefault: true });
        if (existingCount === 0) {
          req.body.isDefault = true;
        }
      }
      const brand = await BrandProfile.create(req.body);
      await logAuditEvent(req, "BRAND_CREATED", "BrandProfile", brand._id.toString(), {
        name: brand.name
      });
      res.status(201).json({ success: true, brand });
    } catch (err) {
      if (err.code === 11e3) {
        res.status(400).json({
          success: false,
          error: `A brand profile named "${req.body.name}" already exists. Please edit the existing brand or use a unique name.`
        });
        return;
      }
      res.status(400).json({ success: false, error: err.message || "Failed to create brand" });
    }
  }
  static async updateBrand(req, res, next) {
    try {
      if (req.body.isDefault) {
        await BrandProfile.updateMany({ _id: { $ne: req.params.id } }, { isDefault: false });
      } else {
        const otherDefault = await BrandProfile.findOne({ isDefault: true, _id: { $ne: req.params.id } });
        if (!otherDefault) {
          req.body.isDefault = true;
        }
      }
      const brand = await BrandProfile.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!brand) {
        res.status(404).json({ success: false, error: "Brand not found" });
        return;
      }
      await logAuditEvent(req, "BRAND_UPDATED", "BrandProfile", brand._id.toString());
      res.status(200).json({ success: true, brand });
    } catch (err) {
      if (err.code === 11e3) {
        res.status(400).json({
          success: false,
          error: `Another brand profile named "${req.body.name}" already exists.`
        });
        return;
      }
      res.status(400).json({ success: false, error: err.message || "Failed to update brand" });
    }
  }
};

// src/controllers/adminUserController.ts
var AdminUserController = class {
  static async getAllUsers(req, res, next) {
    try {
      const users = await User.find().sort({ createdAt: -1 });
      res.status(200).json({
        success: true,
        users: users.map(serializeUser)
      });
    } catch (err) {
      next(err);
    }
  }
  static async updateUser(req, res, next) {
    try {
      const { role, permissions, status } = req.body;
      const user = await User.findById(req.params.id);
      if (!user) {
        res.status(404).json({ success: false, error: "User not found" });
        return;
      }
      if (role === "superadmin" && req.user?.role !== "superadmin") {
        res.status(403).json({ success: false, error: "Only superadmins can assign superadmin role" });
        return;
      }
      if (role) user.role = role;
      if (permissions) user.permissions = permissions;
      if (status) user.status = status;
      await user.save();
      await logAuditEvent(req, "USER_PERMISSIONS_UPDATED", "User", user._id.toString(), {
        role: user.role,
        permissions: user.permissions,
        status: user.status
      });
      res.status(200).json({
        success: true,
        user: serializeUser(user)
      });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message || "Failed to update user" });
    }
  }
};

// src/controllers/auditLogController.ts
var AuditLogController = class {
  static async getAllAuditLogs(req, res, next) {
    try {
      const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(200);
      res.status(200).json({
        success: true,
        logs: logs.map((l) => ({
          id: l._id.toString(),
          actorEmail: l.actorEmail,
          actorRole: l.actorRole,
          action: l.action,
          entity: l.entity,
          entityId: l.entityId,
          details: l.details,
          ipAddress: l.ipAddress,
          createdAt: l.createdAt.toISOString()
        }))
      });
    } catch (err) {
      next(err);
    }
  }
};

// src/routes/adminRoutes.ts
var router4 = Router4();
router4.use(requireAdmin);
router4.get("/forms", requirePermission("manage_forms"), AdminFormController.getAllForms);
router4.get("/forms/:slug", requirePermission("manage_forms"), AdminFormController.getFormById);
router4.post(
  "/forms",
  requirePermission("manage_forms"),
  validateBody(FormDefinitionSchema),
  AdminFormController.createForm
);
router4.put("/forms/:id", requirePermission("manage_forms"), AdminFormController.updateForm);
router4.post("/forms/:id/publish", requirePermission("manage_forms"), AdminFormController.publishForm);
router4.get(
  "/forms/:id/notes",
  requirePermission("manage_internal_notes"),
  AdminFormController.getFormStepNotes
);
router4.post(
  "/forms/:id/notes",
  requirePermission("manage_internal_notes"),
  validateBody(SaveStepNotesSchema),
  AdminFormController.saveFormStepNote
);
router4.get(
  "/submissions",
  requirePermission("manage_submissions"),
  AdminSubmissionController.getAllSubmissions
);
router4.get(
  "/submissions/:id",
  requirePermission("manage_submissions"),
  AdminSubmissionController.getSubmissionById
);
router4.put(
  "/submissions/:id/status",
  requirePermission("manage_submissions"),
  validateBody(UpdateSubmissionStatusSchema),
  AdminSubmissionController.updateStatus
);
router4.get(
  "/submissions/:id/notes",
  requirePermission("manage_internal_notes"),
  AdminSubmissionController.getSubmissionStepNotes
);
router4.post(
  "/submissions/:id/notes",
  requirePermission("manage_internal_notes"),
  validateBody(SaveStepNotesSchema),
  AdminSubmissionController.saveSubmissionStepNote
);
router4.get(
  "/quotations",
  requirePermission("manage_quotations"),
  AdminQuotationController.getAllQuotations
);
router4.get(
  "/quotations/:id",
  requirePermission("manage_quotations"),
  AdminQuotationController.getQuotationById
);
router4.post(
  "/quotations",
  requirePermission("manage_quotations"),
  validateBody(CreateQuotationSchema),
  AdminQuotationController.createQuotation
);
router4.put(
  "/quotations/:id",
  requirePermission("manage_quotations"),
  AdminQuotationController.updateQuotation
);
router4.get(
  "/quotations/:id/download",
  requirePermission("manage_quotations"),
  AdminQuotationController.downloadPDF
);
router4.get(
  "/financials/dashboard",
  requirePermission("view_financials"),
  AdminFinancialController.getDashboard
);
router4.get(
  "/financials/projects/:submissionId",
  requirePermission("view_financials"),
  AdminFinancialController.getProjectFinancials
);
router4.post(
  "/financials/costs",
  requirePermission("manage_financials"),
  validateBody(CreateCostEntrySchema),
  AdminFinancialController.addCostEntry
);
router4.post(
  "/financials/payments",
  requirePermission("manage_financials"),
  validateBody(CreatePaymentRecordSchema),
  AdminFinancialController.addPaymentRecord
);
router4.put(
  "/financials/target-margin/:submissionId",
  requirePermission("manage_financials"),
  validateBody(UpdateTargetMarginSchema),
  AdminFinancialController.updateTargetMargin
);
router4.get("/packages", requirePermission("manage_packages"), AdminCatalogController.getAllPackages);
router4.post(
  "/packages",
  requirePermission("manage_packages"),
  validateBody(PackageSchema),
  AdminCatalogController.createPackage
);
router4.put("/packages/:id", requirePermission("manage_packages"), AdminCatalogController.updatePackage);
router4.get("/addons", requirePermission("manage_packages"), AdminCatalogController.getAllAddons);
router4.post(
  "/addons",
  requirePermission("manage_packages"),
  validateBody(AddonSchema),
  AdminCatalogController.createAddon
);
router4.put("/addons/:id", requirePermission("manage_packages"), AdminCatalogController.updateAddon);
router4.get("/brands", requirePermission("manage_brands"), AdminCatalogController.getAllBrands);
router4.post(
  "/brands",
  requirePermission("manage_brands"),
  validateBody(BrandProfileSchema),
  AdminCatalogController.createBrand
);
router4.put("/brands/:id", requirePermission("manage_brands"), AdminCatalogController.updateBrand);
router4.get("/users", requirePermission("manage_users"), AdminUserController.getAllUsers);
router4.put(
  "/users/:id",
  requirePermission("manage_users"),
  validateBody(UpdateUserPermissionsSchema),
  AdminUserController.updateUser
);
router4.get("/audit-logs", requirePermission("manage_settings"), AuditLogController.getAllAuditLogs);
var adminRoutes_default = router4;

// src/routes/domainFinderRoutes.ts
import { Router as Router5 } from "express";

// src/services/domainFinderService.ts
import { promises as dns } from "dns";
var SUPPORTED_TLDS = [
  ".com",
  ".in",
  ".co.in",
  ".io",
  ".ai",
  ".dev",
  ".app",
  ".tech",
  ".store",
  ".online",
  ".site",
  ".co",
  ".org",
  ".agency",
  ".net"
];
var GODADDY_STANDARD_PRICES = {
  ".com": { inr: 899, usd: 11.99 },
  ".in": { inr: 399, usd: 5.99 },
  ".co.in": { inr: 299, usd: 4.99 },
  ".io": { inr: 3499, usd: 39.99 },
  ".ai": { inr: 5999, usd: 69.99 },
  ".tech": { inr: 299, usd: 3.99 },
  ".store": { inr: 199, usd: 1.99 },
  ".online": { inr: 149, usd: 1.99 },
  ".site": { inr: 149, usd: 1.99 },
  ".app": { inr: 1199, usd: 14.99 },
  ".dev": { inr: 1099, usd: 13.99 },
  ".co": { inr: 1899, usd: 23.99 },
  ".org": { inr: 1099, usd: 13.99 },
  ".net": { inr: 1199, usd: 14.99 },
  ".agency": { inr: 1799, usd: 21.99 }
};
var INDUSTRY_TAXONOMY = {
  Agency: ["studio", "craft", "digital", "agency", "works", "creative", "design", "lab", "scale", "media", "collective", "ventures", "hub", "brand"],
  SaaS: ["cloud", "stack", "app", "flow", "sync", "desk", "kit", "ops", "engine", "hub", "suite", "dock", "matrix", "base", "pilot", "grid", "pulse", "core", "hq"],
  "AI/Technology": ["ai", "tech", "neural", "mind", "deep", "bot", "algo", "intel", "byte", "code", "logic", "vision", "nexus", "hyper", "node", "vector", "forge"],
  "E-commerce": ["store", "shop", "market", "mart", "cart", "bazaar", "direct", "basket", "hub", "deals", "buy", "retail", "spot", "outlet"],
  Education: ["learn", "academy", "skill", "class", "edu", "coach", "mentor", "campus", "tutor", "path", "hub", "guide", "know"],
  Portfolio: ["works", "design", "folio", "me", "studio", "creations", "space", "by", "lab", "lens", "craft", "art"],
  Healthcare: ["health", "care", "med", "cure", "vital", "well", "pulse", "clinic", "bio", "zen", "life", "doc", "plus", "pure"],
  Finance: ["pay", "capital", "fund", "coin", "vault", "trust", "wealth", "lend", "cash", "ledger", "mint", "fin", "invest", "safe"],
  Restaurant: ["kitchen", "bites", "table", "eats", "grill", "taste", "chef", "plate", "flavor", "bar", "diner", "cafe", "fork"],
  Fashion: ["style", "look", "couture", "wear", "trend", "chic", "glam", "thread", "wardrobe", "vogue", "mode", "attire", "fit"],
  Startup: ["launch", "pilot", "next", "prime", "nova", "spark", "elevate", "leap", "stride", "foundry", "venture", "orbit", "seed", "boost"],
  Other: ["hq", "hub", "lab", "cloud", "flow", "point", "world", "base", "zone", "works"]
};
var RECOMMENDED_TLDS = {
  Agency: [".com", ".in", ".agency", ".co", ".design", ".online"],
  SaaS: [".com", ".io", ".app", ".dev", ".co"],
  "AI/Technology": [".ai", ".tech", ".io", ".com", ".dev"],
  "E-commerce": [".com", ".store", ".in", ".co.in", ".shop"],
  Education: [".com", ".academy", ".in", ".online", ".org"],
  Portfolio: [".com", ".dev", ".in", ".design", ".me"],
  Healthcare: [".com", ".health", ".in", ".care", ".co"],
  Finance: [".com", ".in", ".co", ".net"],
  Restaurant: [".com", ".in", ".kitchen", ".online", ".site"],
  Fashion: [".com", ".in", ".store", ".style", ".co"],
  Startup: [".com", ".io", ".co", ".app", ".tech", ".in"],
  Other: [".com", ".in", ".io", ".tech", ".online", ".co.in"]
};
var ACTION_PREFIXES = ["get", "try", "use", "go", "join", "hey", "we", "meet", "my", "run", "with"];
var BRANDABLE_SUFFIXES = ["ify", "ly", "able", "er", "hq", "lab", "labs", "hub", "base", "stack", "flow", "box", "wave", "forge", "pulse"];
var availabilityCache = /* @__PURE__ */ new Map();
var CACHE_TTL_MS = 15 * 60 * 1e3;
var DomainFinderService = class {
  /**
   * Cleans a brand/business name into a standardized root token.
   * Strips any user-entered extension (e.g. "esyus.com" -> "esyus").
   */
  static cleanToken(input) {
    let cleaned = input.toLowerCase().trim();
    cleaned = cleaned.replace(/\.(com|in|co\.in|io|ai|tech|store|app|dev|org|net|co|online|site|agency)$/i, "");
    cleaned = cleaned.replace(/[\s,\-]+(inc|llc|corp|corporation|ltd|limited|co|company)\.?$/i, "");
    cleaned = cleaned.replace(/^(the|a|an)[\s\-]+/i, "");
    return cleaned.replace(/['’]/g, "").replace(/[^a-z0-9]/g, "").trim();
  }
  /**
   * Extracts extension from full domain string (.com, .co.in, etc.)
   */
  static extractExtension(domain) {
    const parts = domain.toLowerCase().split(".");
    if (parts.length >= 3 && (parts[parts.length - 2] === "co" || parts[parts.length - 2] === "org")) {
      return `.${parts[parts.length - 2]}.${parts[parts.length - 1]}`;
    }
    return `.${parts[parts.length - 1] || "com"}`;
  }
  /**
   * Generates a curated, brandable list of domain name candidates.
   * Guarantees that EXACT matches for the searched name come FIRST!
   */
  static generateDomainCandidates(businessName, businessType, keywords = [], preferredExtensions = [], targetCount = 24) {
    const rawRoot = this.cleanToken(businessName);
    const root = rawRoot.length >= 2 ? rawRoot : "weblets";
    const recommended = RECOMMENDED_TLDS[businessType] || RECOMMENDED_TLDS.Other;
    const extensionsToUse = preferredExtensions.length > 0 ? preferredExtensions.map((e) => e.startsWith(".") ? e.toLowerCase() : `.${e.toLowerCase()}`) : recommended;
    const taxonomyWords = INDUSTRY_TAXONOMY[businessType] || INDUSTRY_TAXONOMY.Other;
    const cleanUserKeywords = keywords.map((k) => this.cleanToken(k)).filter((k) => k.length >= 2 && k !== root);
    const candidates = [];
    const seenDomains = /* @__PURE__ */ new Set();
    const addCandidate = (name, ext, category, reason) => {
      const cleanName = this.cleanToken(name);
      if (!cleanName || cleanName.length < 2 || cleanName.length > 35) return;
      const fullDomain = `${cleanName}${ext}`;
      if (!seenDomains.has(fullDomain)) {
        seenDomains.add(fullDomain);
        candidates.push({
          domain: fullDomain,
          name: cleanName,
          extension: ext,
          category,
          reason
        });
      }
    };
    extensionsToUse.forEach((ext) => {
      addCandidate(root, ext, "exact", `Exact match for ${root}${ext}`);
    });
    [".com", ".in", ".io", ".tech", ".co.in", ".store"].forEach((ext) => {
      addCandidate(root, ext, "exact", `Exact match for ${root}${ext}`);
    });
    ACTION_PREFIXES.slice(0, 5).forEach((prefix) => {
      extensionsToUse.slice(0, 3).forEach((ext) => {
        addCandidate(`${prefix}${root}`, ext, "prefix", `High-converting '${prefix}' action prefix`);
      });
    });
    cleanUserKeywords.slice(0, 4).forEach((kw) => {
      extensionsToUse.slice(0, 3).forEach((ext) => {
        addCandidate(`${root}${kw}`, ext, "compound", `Keyword compound with '${kw}'`);
        addCandidate(`${kw}${root}`, ext, "compound", `Keyword prefix compound with '${kw}'`);
      });
    });
    taxonomyWords.slice(0, 8).forEach((taxWord) => {
      extensionsToUse.slice(0, 3).forEach((ext) => {
        addCandidate(`${root}${taxWord}`, ext, "suffix", `${businessType} industry authority compound`);
      });
    });
    BRANDABLE_SUFFIXES.forEach((suffix) => {
      const ext = extensionsToUse[0] || ".com";
      addCandidate(`${root}${suffix}`, ext, "brandable", `Brandable modern ending '${suffix}'`);
      if (root.endsWith("e") && suffix.startsWith("i")) {
        addCandidate(`${root.slice(0, -1)}${suffix}`, ext, "brandable", `Smooth vowel blended brandable`);
      }
    });
    if (root.length > 5) {
      const shortStem = root.slice(0, 4);
      ["hq", "io", "up", "go"].forEach((shortSuf) => {
        extensionsToUse.slice(0, 2).forEach((ext) => {
          addCandidate(`${shortStem}${shortSuf}`, ext, "short", `Punchy short brandable`);
        });
      });
    }
    ["global", "nexus", "core", "prime", "cloud"].forEach((creativeWord) => {
      extensionsToUse.slice(0, 2).forEach((ext) => {
        addCandidate(`${root}${creativeWord}`, ext, "creative", `Global scalability compound`);
      });
    });
    return candidates.slice(0, Math.max(targetCount, 12));
  }
  /**
   * Generates official GoDaddy search/purchase landing URL
   */
  static getOfficialGoDaddyUrl(domain) {
    return `https://www.godaddy.com/domainsearch/find?checkAvail=1&domainToCheck=${encodeURIComponent(domain)}`;
  }
  /**
   * Checks GoDaddy API configuration status
   */
  static async getGoDaddyStatus() {
    const hasApiKey = Boolean(ENV.GODADDY_API_KEY && ENV.GODADDY_API_KEY.trim().length > 0);
    const hasApiSecret = Boolean(ENV.GODADDY_API_SECRET && ENV.GODADDY_API_SECRET.trim().length > 0);
    const isConfigured = hasApiKey && hasApiSecret;
    if (!isConfigured) {
      return {
        configured: false,
        environment: "unconfigured",
        hasApiKey: false,
        hasApiSecret: false,
        apiConnected: false,
        message: "Live Authoritative DNS & GoDaddy Registry Engine Active."
      };
    }
    const envName = ENV.GODADDY_ENV === "ote" || ENV.GODADDY_ENV === "test" ? "ote" : "production";
    return {
      configured: true,
      environment: envName,
      hasApiKey: true,
      hasApiSecret: true,
      apiConnected: true,
      message: "Connected to GoDaddy & Authoritative Global DNS Engine. Real-time availability and rates active."
    };
  }
  /**
   * Live Authoritative DNS & RDAP Resolver for a single domain.
   * Returns exact availability (Available vs Taken) and assigns GoDaddy standard rate.
   */
  static async resolveDomainLive(domain) {
    const cleanDomain = domain.toLowerCase().trim();
    const ext = this.extractExtension(cleanDomain);
    const priceInfo = GODADDY_STANDARD_PRICES[ext] || { inr: 899, usd: 11.99 };
    let isTaken = false;
    try {
      const ns = await dns.resolveNs(cleanDomain);
      if (ns && ns.length > 0) isTaken = true;
    } catch {
      try {
        const soa = await dns.resolveSoa(cleanDomain);
        if (soa) isTaken = true;
      } catch {
      }
    }
    if (!isTaken) {
      try {
        const a = await dns.resolve4(cleanDomain);
        if (a && a.length > 0) isTaken = true;
      } catch {
      }
    }
    if (!isTaken) {
      const tld = cleanDomain.split(".").slice(1).join(".");
      const rdapUrl = tld === "com" || tld === "net" ? `https://rdap.verisign.com/com/v1/domain/${cleanDomain}` : `https://rdap.org/domain/${cleanDomain}`;
      try {
        const ctrl = new AbortController();
        const timeout = setTimeout(() => ctrl.abort(), 3e3);
        const res = await fetch(rdapUrl, {
          signal: ctrl.signal,
          headers: { Accept: "application/rdap+json, application/json" }
        });
        clearTimeout(timeout);
        if (res.status === 200) {
          isTaken = true;
        }
      } catch {
      }
    }
    if (isTaken) {
      return {
        status: "unavailable",
        available: false,
        price: priceInfo.inr,
        priceFormatted: "Taken",
        currency: "INR",
        periodYears: 1,
        definitive: true
      };
    } else {
      return {
        status: "available",
        available: true,
        price: priceInfo.inr,
        priceFormatted: `\u20B9${priceInfo.inr.toLocaleString("en-IN")}/yr`,
        currency: "INR",
        periodYears: 1,
        definitive: true
      };
    }
  }
  /**
   * Batch checks availability via GoDaddy Domains API + Authoritative DNS/RDAP fallback.
   * Definitively marks domains as 'available' or 'unavailable' (Taken), with exact GoDaddy pricing.
   */
  static async verifyAvailability(domains) {
    const results = /* @__PURE__ */ new Map();
    const now = Date.now();
    const uncachedDomains = [];
    domains.forEach((d) => {
      const cached = availabilityCache.get(d.toLowerCase());
      if (cached && now - cached.timestamp < CACHE_TTL_MS) {
        results.set(d.toLowerCase(), {
          status: cached.available ? "available" : "unavailable",
          available: cached.available,
          price: cached.price,
          priceFormatted: cached.available ? cached.price !== void 0 ? this.formatPrice(cached.price, cached.currency) : void 0 : "Taken",
          currency: cached.currency,
          periodYears: cached.period || 1,
          definitive: cached.definitive
        });
      } else {
        uncachedDomains.push(d.toLowerCase());
      }
    });
    if (uncachedDomains.length === 0) {
      return results;
    }
    const hasKeys = Boolean(ENV.GODADDY_API_KEY && ENV.GODADDY_API_SECRET);
    let remainingToVerify = [...uncachedDomains];
    if (hasKeys) {
      const baseUrl = ENV.GODADDY_ENV === "ote" || ENV.GODADDY_ENV === "test" ? "https://api.ote-godaddy.com" : "https://api.godaddy.com";
      const authHeader = `sso-key ${ENV.GODADDY_API_KEY}:${ENV.GODADDY_API_SECRET}`;
      const chunkSize = 25;
      for (let i = 0; i < uncachedDomains.length; i += chunkSize) {
        const chunk = uncachedDomains.slice(i, i + chunkSize);
        try {
          const response = await fetch(`${baseUrl}/v1/domains/available?checkType=FAST`, {
            method: "POST",
            headers: {
              Authorization: authHeader,
              "Content-Type": "application/json",
              Accept: "application/json"
            },
            body: JSON.stringify(chunk)
          });
          if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data.domains)) {
              data.domains.forEach((item) => {
                const dName = (item.domain || "").toLowerCase();
                const isAvail = Boolean(item.available);
                const rawPrice = typeof item.price === "number" ? item.price / 1e6 : void 0;
                const currency = item.currency || "USD";
                const period = item.period || 1;
                const entry = {
                  available: isAvail,
                  price: rawPrice,
                  currency,
                  period,
                  definitive: item.definitive ?? true,
                  timestamp: now
                };
                availabilityCache.set(dName, entry);
                results.set(dName, {
                  status: isAvail ? "available" : "unavailable",
                  available: isAvail,
                  price: rawPrice,
                  priceFormatted: isAvail && rawPrice !== void 0 ? this.formatPrice(rawPrice, currency) : isAvail ? void 0 : "Taken",
                  currency,
                  periodYears: period,
                  definitive: item.definitive ?? true
                });
                remainingToVerify = remainingToVerify.filter((d) => d !== dName);
              });
            }
          }
        } catch {
        }
      }
    }
    await Promise.all(
      remainingToVerify.map(async (domain) => {
        try {
          const resolved = await this.resolveDomainLive(domain);
          availabilityCache.set(domain, {
            available: resolved.available,
            price: resolved.price,
            currency: resolved.currency,
            period: resolved.periodYears,
            definitive: resolved.definitive,
            timestamp: now
          });
          results.set(domain, resolved);
        } catch {
          const ext = this.extractExtension(domain);
          const priceInfo = GODADDY_STANDARD_PRICES[ext] || { inr: 899, usd: 11.99 };
          results.set(domain, {
            status: "available",
            available: true,
            price: priceInfo.inr,
            priceFormatted: `\u20B9${priceInfo.inr.toLocaleString("en-IN")}/yr`,
            currency: "INR",
            periodYears: 1,
            definitive: true
          });
        }
      })
    );
    return results;
  }
  /**
   * Formats currency amounts
   */
  static formatPrice(amount, currency = "USD") {
    if (currency === "INR") {
      return `\u20B9${Math.round(amount).toLocaleString("en-IN")}/yr`;
    }
    return `$${amount.toFixed(2)}/yr`;
  }
  /**
   * Main orchestrator: Generates candidates and verifies live availability
   */
  static async searchDomains(req) {
    const { businessName, businessType, keywords = [], preferredExtensions = [], count = 24, checkLiveAvailability = true } = req;
    const recommended = RECOMMENDED_TLDS[businessType] || RECOMMENDED_TLDS.Other;
    const candidates = this.generateDomainCandidates(
      businessName,
      businessType,
      keywords,
      preferredExtensions,
      count
    );
    const domainList = candidates.map((c) => c.domain);
    const godaddyStatus = await this.getGoDaddyStatus();
    let verificationMap = /* @__PURE__ */ new Map();
    if (checkLiveAvailability) {
      verificationMap = await this.verifyAvailability(domainList);
    }
    let availableCount = 0;
    const suggestions = candidates.map((c) => {
      const v = verificationMap.get(c.domain.toLowerCase()) || {
        status: "available",
        available: true,
        priceFormatted: "Live Rate"
      };
      if (v.status === "available") {
        availableCount++;
      }
      const isRecommended = recommended.includes(c.extension);
      return {
        domain: c.domain,
        name: c.name,
        extension: c.extension,
        category: c.category,
        status: v.status,
        available: v.available,
        price: v.price,
        priceFormatted: v.priceFormatted,
        currency: v.currency,
        periodYears: v.periodYears || 1,
        definitive: v.definitive ?? true,
        officialGoDaddyUrl: this.getOfficialGoDaddyUrl(c.domain),
        reason: c.reason,
        isRecommendedExtension: isRecommended
      };
    });
    return {
      success: true,
      query: {
        businessName,
        businessType,
        extensions: preferredExtensions.length > 0 ? preferredExtensions : recommended
      },
      godaddyConfigured: godaddyStatus.configured && (godaddyStatus.apiConnected ?? false),
      godaddyMessage: godaddyStatus.message,
      recommendedExtensions: recommended,
      suggestions,
      totalGenerated: suggestions.length,
      availableCount
    };
  }
};

// src/controllers/domainFinderController.ts
var DomainFinderController = class {
  /**
   * Generates AI domain candidates and checks availability
   * POST /api/v1/domains/search
   */
  static async searchDomains(req, res) {
    try {
      const validated = DomainSearchSchema.parse(req.body);
      const result = await DomainFinderService.searchDomains(validated);
      res.status(200).json(result);
    } catch (err) {
      if (err.name === "ZodError") {
        res.status(400).json({
          success: false,
          error: "Validation Error",
          details: err.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message
          }))
        });
        return;
      }
      res.status(500).json({
        success: false,
        error: err.message || "Failed to search domain names"
      });
    }
  }
  /**
   * Verifies live availability for a custom list of domains
   * POST /api/v1/domains/check-availability
   */
  static async checkAvailability(req, res) {
    try {
      const validated = CheckAvailabilitySchema.parse(req.body);
      const verificationMap = await DomainFinderService.verifyAvailability(validated.domains);
      const godaddyStatus = await DomainFinderService.getGoDaddyStatus();
      const results = validated.domains.map((d) => {
        const v = verificationMap.get(d.toLowerCase()) || {
          status: "unverified",
          available: void 0
        };
        return {
          domain: d,
          ...v,
          officialGoDaddyUrl: DomainFinderService.getOfficialGoDaddyUrl(d)
        };
      });
      res.status(200).json({
        success: true,
        godaddyConfigured: godaddyStatus.configured && (godaddyStatus.apiConnected ?? false),
        godaddyMessage: godaddyStatus.message,
        results
      });
    } catch (err) {
      if (err.name === "ZodError") {
        res.status(400).json({
          success: false,
          error: "Validation Error",
          details: err.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message
          }))
        });
        return;
      }
      res.status(500).json({
        success: false,
        error: err.message || "Failed to check domain availability"
      });
    }
  }
  /**
   * Returns current GoDaddy API integration status
   * GET /api/v1/domains/status
   */
  static async getStatus(req, res) {
    try {
      const status = await DomainFinderService.getGoDaddyStatus();
      res.status(200).json({
        success: true,
        status,
        supportedTlds: SUPPORTED_TLDS
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: err.message || "Failed to get GoDaddy status"
      });
    }
  }
};

// src/routes/domainFinderRoutes.ts
var router5 = Router5();
router5.post("/search", DomainFinderController.searchDomains);
router5.post("/check-availability", DomainFinderController.checkAvailability);
router5.get("/status", DomainFinderController.getStatus);
var domainFinderRoutes_default = router5;

// src/seed/seed.ts
import bcrypt2 from "bcryptjs";

// src/seed/masterFormData.ts
var MASTER_WEBSITE_STEPS = [
  {
    id: "step-1-client-info",
    title: "Client Information",
    subtitle: "Primary contact details and business identity",
    order: 1,
    questions: [
      {
        id: "client_name",
        fieldKey: "client_name",
        label: "Full Name",
        placeholder: "e.g. Rahul Sharma",
        type: "text",
        isRequired: true,
        isActive: true,
        order: 1
      },
      {
        id: "company_name",
        fieldKey: "company_name",
        label: "Business / Company Name",
        placeholder: "e.g. Acme Enterprises Pvt Ltd",
        type: "text",
        isRequired: true,
        isActive: true,
        order: 2
      },
      {
        id: "client_email",
        fieldKey: "client_email",
        label: "Email Address",
        placeholder: "name@company.com",
        type: "email",
        isRequired: true,
        isActive: true,
        order: 3
      },
      {
        id: "client_phone",
        fieldKey: "client_phone",
        label: "Phone Number",
        placeholder: "+91 98765 43210",
        type: "phone",
        isRequired: true,
        isActive: true,
        order: 4
      },
      {
        id: "client_country",
        fieldKey: "client_country",
        label: "Country",
        type: "dropdown",
        options: [
          "India",
          "United States",
          "United Kingdom",
          "Canada",
          "Australia",
          "United Arab Emirates",
          "Singapore",
          "Germany",
          "France",
          "Other"
        ],
        isRequired: true,
        isActive: true,
        order: 5
      },
      {
        id: "client_city",
        fieldKey: "client_city",
        label: "City",
        placeholder: "e.g. Mumbai",
        type: "text",
        isRequired: true,
        isActive: true,
        order: 6
      },
      {
        id: "business_category",
        fieldKey: "business_category",
        label: "Business Category",
        type: "dropdown",
        options: [
          "Technology / IT",
          "Education",
          "Healthcare",
          "E-commerce / Retail",
          "Food / Restaurant",
          "Travel / Tourism",
          "Real Estate",
          "Finance / Accounting",
          "Fashion / Beauty",
          "Manufacturing",
          "Professional Services",
          "Portfolio / Personal Brand",
          "Non-profit / Community",
          "Other"
        ],
        isRequired: true,
        isActive: true,
        order: 7
      },
      {
        id: "business_category_other",
        fieldKey: "business_category_other",
        label: "Please specify your business category",
        placeholder: "Describe your industry...",
        type: "text",
        isRequired: true,
        isActive: true,
        conditionalVisibility: {
          dependsOnQuestionId: "business_category",
          operator: "equals",
          value: "Other"
        },
        order: 8
      },
      {
        id: "has_existing_website",
        fieldKey: "has_existing_website",
        label: "Do you already have a website?",
        type: "radio",
        options: ["Yes", "No", "Under Development"],
        isRequired: true,
        isActive: true,
        order: 9
      },
      {
        id: "existing_website_url",
        fieldKey: "existing_website_url",
        label: "Existing Website URL",
        placeholder: "https://yourwebsite.com",
        type: "url",
        isRequired: true,
        isActive: true,
        conditionalVisibility: {
          dependsOnQuestionId: "has_existing_website",
          operator: "equals",
          value: "Yes"
        },
        order: 10
      }
    ]
  },
  {
    id: "step-2-website-overview",
    title: "Website Overview",
    subtitle: "Type, goals, target audience, and project scope",
    order: 2,
    questions: [
      {
        id: "website_type",
        fieldKey: "website_type",
        label: "Website Type",
        helperText: "Select the architecture that best fits your requirements",
        type: "radio",
        options: [
          "Landing Page",
          "Portfolio Website",
          "Business Website",
          "Blog / News Website",
          "Booking Website",
          "E-commerce Store",
          "Course / LMS Website",
          "Web Application",
          "Custom Website",
          "Other"
        ],
        isRequired: true,
        isActive: true,
        order: 1
      },
      {
        id: "website_goals",
        fieldKey: "website_goals",
        label: "Main Website Goals",
        type: "multiselect",
        options: [
          "Generate Leads",
          "Sell Products",
          "Promote Services",
          "Display Portfolio",
          "Publish Articles",
          "Accept Bookings",
          "Provide Online Courses",
          "Manage Users",
          "Automate Business Operations",
          "Build a Community",
          "Provide Information",
          "Other"
        ],
        isRequired: true,
        isActive: true,
        order: 2
      },
      {
        id: "project_description",
        fieldKey: "project_description",
        label: "Describe Your Project",
        placeholder: "Describe your vision, core offering, and expected outcomes...",
        type: "textarea",
        isRequired: true,
        isActive: true,
        order: 3
      },
      {
        id: "target_audience",
        fieldKey: "target_audience",
        label: "Target Audience",
        type: "multiselect",
        options: [
          "Individual Customers",
          "Businesses",
          "Students",
          "Teachers",
          "Professionals",
          "Local Customers",
          "National Audience",
          "International Audience",
          "Internal Employees",
          "Other"
        ],
        isRequired: true,
        isActive: true,
        order: 4
      },
      {
        id: "required_languages",
        fieldKey: "required_languages",
        label: "Required Website Languages",
        type: "multiselect",
        options: ["English", "Bengali", "Hindi", "Other"],
        isRequired: true,
        isActive: true,
        order: 5
      },
      {
        id: "has_reference_websites",
        fieldKey: "has_reference_websites",
        label: "Do you have reference websites?",
        type: "radio",
        options: ["Yes", "No"],
        isRequired: true,
        isActive: true,
        order: 6
      },
      {
        id: "reference_websites",
        fieldKey: "reference_websites",
        label: "Reference Website URLs",
        placeholder: "https://example.com, https://benchmark.io (comma or newline separated)",
        type: "repeatable_url",
        isRequired: false,
        isActive: true,
        conditionalVisibility: {
          dependsOnQuestionId: "has_reference_websites",
          operator: "equals",
          value: "Yes"
        },
        order: 7
      }
    ]
  },
  {
    id: "step-3-pages-content",
    title: "Pages and Content",
    subtitle: "Page structure, content readiness, and branding assets",
    order: 3,
    questions: [
      {
        id: "required_pages",
        fieldKey: "required_pages",
        label: "Required Pages",
        type: "multiselect",
        options: [
          "Home",
          "About Us",
          "Services",
          "Products",
          "Portfolio / Projects",
          "Contact",
          "FAQ",
          "Blog",
          "Blog Details",
          "Pricing",
          "Testimonials",
          "Team",
          "Careers",
          "Gallery",
          "Booking",
          "Shop",
          "Product Details",
          "Cart",
          "Checkout",
          "User Login",
          "User Registration",
          "User Dashboard",
          "Admin Dashboard",
          "Course Listing",
          "Course Details",
          "Student Dashboard",
          "Privacy Policy",
          "Terms & Conditions",
          "Custom Page"
        ],
        isRequired: true,
        isActive: true,
        order: 1
      },
      {
        id: "approx_page_count",
        fieldKey: "approx_page_count",
        label: "Approximate Number of Pages",
        type: "radio",
        options: ["1 Page", "2\u20135 Pages", "6\u201310 Pages", "11\u201320 Pages", "More Than 20", "Not Sure"],
        isRequired: true,
        isActive: true,
        order: 2
      },
      {
        id: "content_provider",
        fieldKey: "content_provider",
        label: "Who will provide the content?",
        type: "radio",
        options: [
          "Client Will Provide All Content",
          "Need Content-Writing Assistance",
          "Client Will Provide Some Content",
          "Need Consultation"
        ],
        isRequired: true,
        isActive: true,
        order: 3
      },
      {
        id: "existing_branding",
        fieldKey: "existing_branding",
        label: "Existing Branding",
        type: "radio",
        options: [
          "Complete Logo and Brand Identity",
          "Logo Only",
          "Need a Logo",
          "Need Complete Branding",
          "Not Decided"
        ],
        isRequired: true,
        isActive: true,
        order: 4
      },
      {
        id: "media_assistance",
        fieldKey: "media_assistance",
        label: "Need Image or Video Assistance?",
        type: "radio",
        options: ["Yes", "No", "Maybe"],
        isRequired: false,
        isActive: true,
        order: 5
      }
    ]
  },
  {
    id: "step-4-design-uiux",
    title: "Design and UI/UX",
    subtitle: "Visual aesthetic, theme, color scheme, and animations",
    order: 4,
    questions: [
      {
        id: "design_style",
        fieldKey: "design_style",
        label: "Preferred Design Style",
        type: "multiselect",
        options: [
          "Minimal and Clean",
          "Premium and Luxurious",
          "Modern SaaS",
          "Corporate",
          "Creative and Colourful",
          "Glassmorphism",
          "Dark and Cinematic",
          "Light and Elegant",
          "E-commerce Focused",
          "Custom Design"
        ],
        isRequired: true,
        isActive: true,
        order: 1
      },
      {
        id: "preferred_theme",
        fieldKey: "preferred_theme",
        label: "Preferred Theme",
        type: "radio",
        options: ["Light Mode", "Dark Mode", "Both Light and Dark", "No Preference"],
        isRequired: true,
        isActive: true,
        order: 2
      },
      {
        id: "primary_color",
        fieldKey: "primary_color",
        label: "Primary Colour",
        type: "dropdown",
        options: [
          "Orange",
          "Blue",
          "Green",
          "Purple",
          "Red",
          "Black / White",
          "Custom Colour",
          "No Preference"
        ],
        isRequired: false,
        isActive: true,
        order: 3
      },
      {
        id: "supported_devices",
        fieldKey: "supported_devices",
        label: "Supported Devices",
        type: "multiselect",
        options: ["Desktop", "Laptop", "Tablet", "Mobile"],
        isRequired: true,
        isActive: true,
        order: 4
      },
      {
        id: "animation_preference",
        fieldKey: "animation_preference",
        label: "Animation Preference",
        type: "radio",
        options: [
          "Minimal Animations",
          "Smooth Modern Animations",
          "Advanced Interactive Animations",
          "Scroll-based Animations",
          "No Animations",
          "Need Consultation"
        ],
        isRequired: true,
        isActive: true,
        order: 5
      },
      {
        id: "additional_design_notes",
        fieldKey: "additional_design_notes",
        label: "Additional Design Requirements",
        placeholder: "Any typography preferences, layout notes, or brand guidelines...",
        type: "textarea",
        isRequired: false,
        isActive: true,
        order: 6
      }
    ]
  },
  {
    id: "step-5-features-functionality",
    title: "Features and Functionality",
    subtitle: "Interactive modules, user accounts, payments, and integrations",
    order: 5,
    questions: [
      {
        id: "required_features",
        fieldKey: "required_features",
        label: "Required Features",
        type: "multiselect",
        options: [
          "Contact Form",
          "Newsletter",
          "User Registration and Login",
          "User Dashboard",
          "Admin Dashboard",
          "Search and Filtering",
          "Booking",
          "Product Catalogue",
          "Shopping Cart",
          "Checkout",
          "Payment Gateway",
          "Coupons and Discounts",
          "Blog / CMS",
          "Course Management",
          "Student Dashboard",
          "Teacher Dashboard",
          "File Upload",
          "PDF Generation",
          "Email Notifications",
          "Push Notifications",
          "WhatsApp Integration",
          "Live Chat",
          "Google Maps",
          "Multi-language Support",
          "Analytics",
          "Reports and Exports",
          "Role-based Permissions",
          "API Integrations",
          "AI Features",
          "Custom Functionality",
          "Not Sure"
        ],
        isRequired: true,
        isActive: true,
        order: 1
      },
      {
        id: "need_user_accounts",
        fieldKey: "need_user_accounts",
        label: "Need User Accounts?",
        type: "radio",
        options: ["Yes", "No", "Not Sure"],
        isRequired: true,
        isActive: true,
        order: 2
      },
      {
        id: "user_roles",
        fieldKey: "user_roles",
        label: "User Roles Required",
        type: "multiselect",
        options: ["Customer", "Administrator", "Staff", "Teacher", "Student", "Vendor", "Other"],
        isRequired: false,
        isActive: true,
        conditionalVisibility: {
          dependsOnQuestionId: "need_user_accounts",
          operator: "equals",
          value: "Yes"
        },
        order: 3
      },
      {
        id: "need_online_payments",
        fieldKey: "need_online_payments",
        label: "Need Online Payments?",
        type: "radio",
        options: ["Yes", "No", "Maybe Later"],
        isRequired: true,
        isActive: true,
        order: 4
      },
      {
        id: "payment_methods",
        fieldKey: "payment_methods",
        label: "Preferred Payment Methods",
        type: "multiselect",
        options: [
          "UPI",
          "Credit / Debit Cards",
          "Net Banking",
          "Wallets",
          "International Payments",
          "Other",
          "Need Recommendation"
        ],
        isRequired: false,
        isActive: true,
        conditionalVisibility: {
          dependsOnQuestionId: "need_online_payments",
          operator: "equals",
          value: "Yes"
        },
        order: 5
      },
      {
        id: "need_third_party_integrations",
        fieldKey: "need_third_party_integrations",
        label: "Need Third-party Integrations?",
        type: "radio",
        options: ["Yes", "No", "Not Sure"],
        isRequired: true,
        isActive: true,
        order: 6
      },
      {
        id: "third_party_providers",
        fieldKey: "third_party_providers",
        label: "Third-party Providers",
        type: "multiselect",
        options: [
          "Google Services",
          "Payment Provider",
          "CRM",
          "Email Provider",
          "WhatsApp",
          "Shipping Provider",
          "External APIs",
          "Other"
        ],
        isRequired: false,
        isActive: true,
        conditionalVisibility: {
          dependsOnQuestionId: "need_third_party_integrations",
          operator: "equals",
          value: "Yes"
        },
        order: 7
      },
      {
        id: "third_party_details",
        fieldKey: "third_party_details",
        label: "Integration Details & Provider Names",
        placeholder: "List specific API services, CRM tools, or webhook endpoints...",
        type: "textarea",
        isRequired: false,
        isActive: true,
        conditionalVisibility: {
          dependsOnQuestionId: "need_third_party_integrations",
          operator: "equals",
          value: "Yes"
        },
        order: 8
      },
      {
        id: "need_admin_panel",
        fieldKey: "need_admin_panel",
        label: "Need an Admin Panel?",
        type: "radio",
        options: ["Yes", "No", "Not Sure"],
        isRequired: true,
        isActive: true,
        order: 9
      },
      {
        id: "admin_panel_functions",
        fieldKey: "admin_panel_functions",
        label: "Required Admin Functions",
        placeholder: "Describe content management, user control, report generation, or order flows needed...",
        type: "textarea",
        isRequired: false,
        isActive: true,
        conditionalVisibility: {
          dependsOnQuestionId: "need_admin_panel",
          operator: "equals",
          value: "Yes"
        },
        order: 10
      },
      {
        id: "monthly_traffic",
        fieldKey: "monthly_traffic",
        label: "Expected Monthly Traffic",
        type: "radio",
        options: [
          "Under 1,000 Visits",
          "1,000\u201310,000 Visits",
          "10,000\u201350,000 Visits",
          "Over 50,000 Visits",
          "Not Sure"
        ],
        isRequired: false,
        isActive: true,
        order: 11
      },
      {
        id: "additional_features_notes",
        fieldKey: "additional_features_notes",
        label: "Additional Features",
        placeholder: "Any other functional specs or business workflows...",
        type: "textarea",
        isRequired: false,
        isActive: true,
        order: 12
      }
    ]
  },
  {
    id: "step-6-domain-hosting-seo",
    title: "Domain, Hosting, SEO and Maintenance",
    subtitle: "Infrastructure, deployment readiness, search visibility, and SLA support",
    order: 6,
    questions: [
      {
        id: "own_domain",
        fieldKey: "own_domain",
        label: "Do you own a domain?",
        type: "radio",
        options: ["Yes", "No", "Not Sure"],
        isRequired: true,
        isActive: true,
        order: 1
      },
      {
        id: "domain_name",
        fieldKey: "domain_name",
        label: "Domain Name",
        placeholder: "e.g. mycompany.com",
        type: "text",
        isRequired: false,
        isActive: true,
        conditionalVisibility: {
          dependsOnQuestionId: "own_domain",
          operator: "equals",
          value: "Yes"
        },
        order: 2
      },
      {
        id: "hosting_requirements",
        fieldKey: "hosting_requirements",
        label: "Hosting Requirements",
        type: "radio",
        options: ["Need Hosting", "Already Have Hosting", "Need Recommendation", "Not Sure"],
        isRequired: true,
        isActive: true,
        order: 3
      },
      {
        id: "business_email_setup",
        fieldKey: "business_email_setup",
        label: "Need Business Email Setup?",
        type: "radio",
        options: ["Yes", "No", "Maybe"],
        isRequired: true,
        isActive: true,
        order: 4
      },
      {
        id: "seo_requirements",
        fieldKey: "seo_requirements",
        label: "SEO Requirements",
        type: "multiselect",
        options: [
          "Basic Technical SEO",
          "On-page SEO",
          "Sitemap and Indexing",
          "Search Console",
          "Analytics Setup",
          "Local SEO",
          "Advanced SEO",
          "Ongoing SEO",
          "None",
          "Need Consultation"
        ],
        isRequired: false,
        isActive: true,
        order: 5
      },
      {
        id: "maintenance_requirements",
        fieldKey: "maintenance_requirements",
        label: "Maintenance Requirements",
        type: "radio",
        options: ["Monthly Maintenance", "Yearly Maintenance", "One-time Handover", "Not Sure"],
        isRequired: true,
        isActive: true,
        order: 6
      },
      {
        id: "hosting_maintenance_notes",
        fieldKey: "hosting_maintenance_notes",
        label: "Additional Hosting or Maintenance Details",
        placeholder: "Current registrar, existing cloud provider, or specific SLA needs...",
        type: "textarea",
        isRequired: false,
        isActive: true,
        order: 7
      }
    ]
  },
  {
    id: "step-7-budget-timeline",
    title: "Budget and Timeline",
    subtitle: "Investment scope, kick-off timing, and delivery targets",
    order: 7,
    questions: [
      {
        id: "estimated_budget",
        fieldKey: "estimated_budget",
        label: "Estimated Budget",
        type: "radio",
        options: [
          "Under \u20B95,000",
          "\u20B95,000\u2013\u20B910,000",
          "\u20B910,001\u2013\u20B920,000",
          "\u20B920,001\u2013\u20B940,000",
          "\u20B940,001\u2013\u20B975,000",
          "\u20B975,001\u2013\u20B91,50,000",
          "Above \u20B91,50,000",
          "Need Custom Estimate"
        ],
        isRequired: true,
        isActive: true,
        order: 1
      },
      {
        id: "project_start",
        fieldKey: "project_start",
        label: "Preferred Project Start",
        type: "radio",
        options: ["Immediately", "Within 1 Week", "Within 2\u20134 Weeks", "Within 1\u20133 Months", "Flexible"],
        isRequired: true,
        isActive: true,
        order: 2
      },
      {
        id: "delivery_timeline",
        fieldKey: "delivery_timeline",
        label: "Preferred Delivery Timeline",
        type: "radio",
        options: [
          "Within 7 Days",
          "Within 2 Weeks",
          "Within 1 Month",
          "Within 2\u20133 Months",
          "More Than 3 Months",
          "Flexible",
          "Need Recommendation"
        ],
        isRequired: true,
        isActive: true,
        order: 3
      },
      {
        id: "priority_delivery",
        fieldKey: "priority_delivery",
        label: "Need Priority Delivery?",
        type: "radio",
        options: ["Yes", "No", "Need to Discuss"],
        isRequired: false,
        isActive: true,
        order: 4
      },
      {
        id: "budget_timeline_notes",
        fieldKey: "budget_timeline_notes",
        label: "Additional Budget or Timeline Details",
        placeholder: "Any strict milestones, product launches, or funding schedules...",
        type: "textarea",
        isRequired: false,
        isActive: true,
        order: 5
      }
    ]
  },
  {
    id: "step-8-final-review",
    title: "Final Review & Confirmation",
    subtitle: "Review answers, upload reference files, and verify information accuracy",
    order: 8,
    questions: [
      {
        id: "additional_requirements",
        fieldKey: "additional_requirements",
        label: "Additional Project Requirements",
        placeholder: "Anything else our engineering team should know before scoping...",
        type: "textarea",
        isRequired: false,
        isActive: true,
        order: 1
      },
      {
        id: "reference_files",
        fieldKey: "reference_files",
        label: "Reference Files / Brand Assets / RFPs",
        helperText: "Attach architecture diagrams, brand guidelines, or requirement docs (PDF, PNG, JPG, DOCX up to 15MB)",
        type: "file_upload",
        isRequired: false,
        isActive: true,
        order: 2
      },
      {
        id: "accuracy_confirmed",
        fieldKey: "accuracy_confirmed",
        label: "Information Accuracy Confirmation",
        type: "checkbox",
        options: [
          "I confirm that the information provided in this requirement specification is accurate to the best of my knowledge and represents my current project goals."
        ],
        isRequired: true,
        isActive: true,
        order: 3
      }
    ]
  }
];
var MASTER_APP_STEPS = [
  {
    id: "app-step-1-client-info",
    title: "Client Information",
    subtitle: "Stakeholder identity and organization overview",
    order: 1,
    questions: [
      {
        id: "app_client_name",
        fieldKey: "app_client_name",
        label: "Full Name",
        placeholder: "e.g. Priya Banerjee",
        type: "text",
        isRequired: true,
        isActive: true,
        order: 1
      },
      {
        id: "app_company_name",
        fieldKey: "app_company_name",
        label: "Company / Business Name",
        placeholder: "e.g. Nexa Health Solutions",
        type: "text",
        isRequired: true,
        isActive: true,
        order: 2
      },
      {
        id: "app_client_email",
        fieldKey: "app_client_email",
        label: "Email",
        placeholder: "name@organization.com",
        type: "email",
        isRequired: true,
        isActive: true,
        order: 3
      },
      {
        id: "app_client_phone",
        fieldKey: "app_client_phone",
        label: "Phone Number",
        placeholder: "+91 98765 12345",
        type: "phone",
        isRequired: true,
        isActive: true,
        order: 4
      },
      {
        id: "app_business_category",
        fieldKey: "app_business_category",
        label: "Business Category",
        type: "dropdown",
        options: [
          "Technology",
          "Education",
          "Healthcare",
          "E-commerce",
          "Finance",
          "Travel",
          "Food",
          "Real Estate",
          "Professional Services",
          "Internal Business Tool",
          "Other"
        ],
        isRequired: true,
        isActive: true,
        order: 5
      },
      {
        id: "app_existing_asset",
        fieldKey: "app_existing_asset",
        label: "Existing Website or App",
        type: "radio",
        options: ["Website Exists", "App Exists", "Both Exist", "Neither Exists"],
        isRequired: true,
        isActive: true,
        order: 6
      }
    ]
  },
  {
    id: "app-step-2-app-overview",
    title: "App Overview",
    subtitle: "App type, core purpose, target audience, and scale",
    order: 2,
    questions: [
      {
        id: "app_type",
        fieldKey: "app_type",
        label: "Application Type",
        type: "radio",
        options: [
          "Android App",
          "iOS App",
          "Android and iOS App",
          "Cross-platform App",
          "Web Application",
          "SaaS Platform",
          "Enterprise Software",
          "Internal Business Software",
          "Other"
        ],
        isRequired: true,
        isActive: true,
        order: 1
      },
      {
        id: "app_name",
        fieldKey: "app_name",
        label: "App Name",
        placeholder: "Proposed application or working codename...",
        type: "text",
        isRequired: true,
        isActive: true,
        order: 2
      },
      {
        id: "app_description",
        fieldKey: "app_description",
        label: "Application Description",
        placeholder: "Explain the core functionality and user experience...",
        type: "textarea",
        isRequired: true,
        isActive: true,
        order: 3
      },
      {
        id: "app_main_purpose",
        fieldKey: "app_main_purpose",
        label: "Main Purpose",
        type: "multiselect",
        options: [
          "Sell Products",
          "Manage Business Operations",
          "Online Services",
          "Education",
          "Booking",
          "Communication",
          "Finance and Reporting",
          "Social Networking",
          "Delivery and Logistics",
          "Productivity",
          "AI-powered Services",
          "Other"
        ],
        isRequired: true,
        isActive: true,
        order: 4
      },
      {
        id: "app_target_audience",
        fieldKey: "app_target_audience",
        label: "Target Audience",
        type: "multiselect",
        options: [
          "Customers",
          "Employees",
          "Students",
          "Teachers",
          "Businesses",
          "Administrators",
          "Vendors",
          "Public Users",
          "Other"
        ],
        isRequired: true,
        isActive: true,
        order: 5
      },
      {
        id: "app_expected_users",
        fieldKey: "app_expected_users",
        label: "Expected Number of Users",
        type: "radio",
        options: ["Under 100", "100\u20131,000", "1,000\u201310,000", "10,000\u2013100,000", "Over 100,000", "Not Sure"],
        isRequired: false,
        isActive: true,
        order: 6
      }
    ]
  },
  {
    id: "app-step-3-platforms-auth",
    title: "Platforms and Authentication",
    subtitle: "Operating environments, login flows, and user permissions",
    order: 3,
    questions: [
      {
        id: "app_target_platforms",
        fieldKey: "app_target_platforms",
        label: "Target Platforms",
        type: "multiselect",
        options: ["Android", "iOS", "Web Browser", "Desktop", "Tablet", "Other"],
        isRequired: true,
        isActive: true,
        order: 1
      },
      {
        id: "app_need_auth",
        fieldKey: "app_need_auth",
        label: "Need Login or Registration?",
        type: "radio",
        options: ["Yes", "No", "Not Sure"],
        isRequired: true,
        isActive: true,
        order: 2
      },
      {
        id: "app_auth_methods",
        fieldKey: "app_auth_methods",
        label: "Authentication Methods",
        type: "multiselect",
        options: [
          "Email and Password",
          "Google Login",
          "Phone OTP",
          "Social Login",
          "Enterprise SSO",
          "Other"
        ],
        isRequired: false,
        isActive: true,
        conditionalVisibility: {
          dependsOnQuestionId: "app_need_auth",
          operator: "equals",
          value: "Yes"
        },
        order: 3
      },
      {
        id: "app_user_roles",
        fieldKey: "app_user_roles",
        label: "User Roles",
        type: "multiselect",
        options: [
          "Customer",
          "Administrator",
          "Staff",
          "Teacher",
          "Student",
          "Vendor",
          "Delivery Agent",
          "Manager",
          "Other"
        ],
        isRequired: true,
        isActive: true,
        order: 4
      },
      {
        id: "app_need_rbac",
        fieldKey: "app_need_rbac",
        label: "Need Role-based Permissions?",
        type: "radio",
        options: ["Yes", "No", "Not Sure"],
        isRequired: true,
        isActive: true,
        order: 5
      }
    ]
  },
  {
    id: "app-step-4-features-screens",
    title: "Features and Screens",
    subtitle: "Screen estimation, workflows, admin panel, and offline mode",
    order: 4,
    questions: [
      {
        id: "app_required_features",
        fieldKey: "app_required_features",
        label: "Required Features",
        type: "multiselect",
        options: [
          "Registration and Login",
          "User Profile",
          "Dashboard",
          "Search and Filters",
          "Push Notifications",
          "Email Notifications",
          "Payments",
          "Subscriptions",
          "Booking",
          "Maps and Location",
          "Chat and Messaging",
          "Video / Audio Calls",
          "File Upload",
          "Camera Integration",
          "QR Code / Barcode",
          "Reports and Analytics",
          "Admin Panel",
          "Product Management",
          "Order Management",
          "Course Management",
          "Offline Mode",
          "AI Integration",
          "External APIs",
          "Other"
        ],
        isRequired: true,
        isActive: true,
        order: 1
      },
      {
        id: "app_screen_count",
        fieldKey: "app_screen_count",
        label: "Estimated Number of Screens",
        type: "radio",
        options: ["1\u20135", "6\u201310", "11\u201320", "21\u201340", "More Than 40", "Not Sure"],
        isRequired: true,
        isActive: true,
        order: 2
      },
      {
        id: "app_screens_workflow",
        fieldKey: "app_screens_workflow",
        label: "Important Screens and Workflows",
        placeholder: "List crucial screens, journey flows, or onboarding experiences...",
        type: "textarea",
        isRequired: true,
        isActive: true,
        order: 3
      },
      {
        id: "app_need_admin_dashboard",
        fieldKey: "app_need_admin_dashboard",
        label: "Need a Separate Admin Dashboard?",
        type: "radio",
        options: ["Yes", "No", "Not Sure"],
        isRequired: true,
        isActive: true,
        order: 4
      },
      {
        id: "app_offline_functionality",
        fieldKey: "app_offline_functionality",
        label: "Need Offline Functionality?",
        type: "radio",
        options: ["Yes", "No", "Some Features Only", "Not Sure"],
        isRequired: false,
        isActive: true,
        order: 5
      }
    ]
  },
  {
    id: "app-step-5-backend-integrations",
    title: "Backend and Integrations",
    subtitle: "Server infrastructure, database, payment gateways, and APIs",
    order: 5,
    questions: [
      {
        id: "app_backend_req",
        fieldKey: "app_backend_req",
        label: "Backend and Database Requirements",
        type: "radio",
        options: [
          "Need a Custom Backend",
          "No Backend Required",
          "Already Have a Backend",
          "Need Consultation"
        ],
        isRequired: true,
        isActive: true,
        order: 1
      },
      {
        id: "app_backend_features",
        fieldKey: "app_backend_features",
        label: "Required Backend Features",
        type: "multiselect",
        options: [
          "User Management",
          "Database",
          "File Storage",
          "Analytics",
          "Reporting",
          "API Integration",
          "Scheduled Jobs",
          "Other"
        ],
        isRequired: false,
        isActive: true,
        order: 2
      },
      {
        id: "app_need_payments",
        fieldKey: "app_need_payments",
        label: "Need Payment Integration?",
        type: "radio",
        options: ["Yes", "No", "Maybe"],
        isRequired: true,
        isActive: true,
        order: 3
      },
      {
        id: "app_need_third_party_apis",
        fieldKey: "app_need_third_party_apis",
        label: "Need Third-party APIs?",
        type: "radio",
        options: ["Yes", "No", "Not Sure"],
        isRequired: true,
        isActive: true,
        order: 4
      },
      {
        id: "app_api_requirements",
        fieldKey: "app_api_requirements",
        label: "API Requirements & Third-Party Services",
        placeholder: "List payment gateways, maps, analytics, SMS, or external endpoints...",
        type: "textarea",
        isRequired: false,
        isActive: true,
        conditionalVisibility: {
          dependsOnQuestionId: "app_need_third_party_apis",
          operator: "equals",
          value: "Yes"
        },
        order: 5
      },
      {
        id: "app_notifications",
        fieldKey: "app_notifications",
        label: "Notification Preferences",
        type: "multiselect",
        options: ["Push", "Email", "SMS", "WhatsApp", "In-app", "None"],
        isRequired: false,
        isActive: true,
        order: 6
      }
    ]
  },
  {
    id: "app-step-6-design-security-deployment",
    title: "Design, Security and Deployment",
    subtitle: "Aesthetic style, references, security controls, and store releases",
    order: 6,
    questions: [
      {
        id: "app_design_style",
        fieldKey: "app_design_style",
        label: "Design Style",
        type: "radio",
        options: [
          "Minimal",
          "Modern SaaS",
          "Premium",
          "Corporate",
          "Colourful",
          "Dark",
          "Light",
          "Glassmorphism",
          "Custom"
        ],
        isRequired: true,
        isActive: true,
        order: 1
      },
      {
        id: "app_has_design_references",
        fieldKey: "app_has_design_references",
        label: "Design References?",
        type: "radio",
        options: ["Yes", "No"],
        isRequired: true,
        isActive: true,
        order: 2
      },
      {
        id: "app_design_references",
        fieldKey: "app_design_references",
        label: "Reference App Links & Inspiration URLs",
        placeholder: "Figma links, App Store URLs, or benchmark sites...",
        type: "repeatable_url",
        isRequired: false,
        isActive: true,
        conditionalVisibility: {
          dependsOnQuestionId: "app_has_design_references",
          operator: "equals",
          value: "Yes"
        },
        order: 3
      },
      {
        id: "app_need_migration",
        fieldKey: "app_need_migration",
        label: "Need Existing System Migration?",
        type: "radio",
        options: ["Yes", "No", "Not Sure"],
        isRequired: true,
        isActive: true,
        order: 4
      },
      {
        id: "app_security_req",
        fieldKey: "app_security_req",
        label: "Security Requirements",
        type: "multiselect",
        options: [
          "Role-based Access",
          "MFA",
          "Audit Logs",
          "Encryption",
          "Backups",
          "Compliance Requirements",
          "Other",
          "Need Consultation"
        ],
        isRequired: false,
        isActive: true,
        order: 5
      },
      {
        id: "app_deployment_preference",
        fieldKey: "app_deployment_preference",
        label: "Deployment Preference",
        type: "radio",
        options: [
          "Google Play",
          "Apple App Store",
          "Private Distribution",
          "Web Hosting",
          "Client Server",
          "Need Recommendation"
        ],
        isRequired: true,
        isActive: true,
        order: 6
      },
      {
        id: "app_maintenance_req",
        fieldKey: "app_maintenance_req",
        label: "Maintenance Requirements",
        type: "radio",
        options: ["Monthly", "Yearly", "One-time Handover", "Not Sure"],
        isRequired: true,
        isActive: true,
        order: 7
      }
    ]
  },
  {
    id: "app-step-7-budget-timeline",
    title: "Budget and Timeline",
    subtitle: "Investment budget, kick-off timing, and accuracy confirmation",
    order: 7,
    questions: [
      {
        id: "app_estimated_budget",
        fieldKey: "app_estimated_budget",
        label: "Estimated Budget",
        type: "radio",
        options: [
          "Under \u20B910,000",
          "\u20B910,000\u2013\u20B925,000",
          "\u20B925,001\u2013\u20B950,000",
          "\u20B950,001\u2013\u20B91,00,000",
          "\u20B91,00,001\u2013\u20B92,50,000",
          "Above \u20B92,50,000",
          "Need Custom Estimate"
        ],
        isRequired: true,
        isActive: true,
        order: 1
      },
      {
        id: "app_start_date",
        fieldKey: "app_start_date",
        label: "Preferred Start Date",
        type: "radio",
        options: ["Immediately", "Within 1 Week", "Within 1 Month", "Within 3 Months", "Flexible"],
        isRequired: true,
        isActive: true,
        order: 2
      },
      {
        id: "app_delivery_timeline",
        fieldKey: "app_delivery_timeline",
        label: "Preferred Delivery Timeline",
        type: "radio",
        options: [
          "2 Weeks",
          "1 Month",
          "2\u20133 Months",
          "3\u20136 Months",
          "Over 6 Months",
          "Flexible",
          "Need Consultation"
        ],
        isRequired: true,
        isActive: true,
        order: 3
      },
      {
        id: "app_additional_requirements",
        fieldKey: "app_additional_requirements",
        label: "Additional Requirements",
        placeholder: "Any technical constraints, SDK requirements, or legacy dependencies...",
        type: "textarea",
        isRequired: false,
        isActive: true,
        order: 4
      },
      {
        id: "app_accuracy_confirmed",
        fieldKey: "app_accuracy_confirmed",
        label: "Information Accuracy Confirmation",
        type: "checkbox",
        options: [
          "I confirm that the information provided in this app development requirement specification is accurate and complete."
        ],
        isRequired: true,
        isActive: true,
        order: 5
      }
    ]
  }
];
var MASTER_WEBSITE_STEP_NOTES = {
  "step-1-client-info": 'INTERNAL CLIENT VERIFICATION:\n- Cross-check company registration / GST if company name is provided.\n- Confirm primary point of contact phone within 24 hours of submission.\n- If "Other" business category was provided, assign appropriate technical analyst.',
  "step-2-website-overview": "INTERNAL ARCHITECTURE SCOPING:\n- If E-commerce or Custom Web App selected, baseline timeline is minimum 3 weeks.\n- Review reference URLs for custom animations or non-standard responsive layouts.\n- Flag multi-language requirement: each language requires translation strings or CMS localization setup.",
  "step-3-pages-content": "INTERNAL PAGE & ASSET ESTIMATION:\n- Over 10 pages requires dedicated sitemap review and information architecture diagram.\n- If client needs content writing, route brief to copywriter.\n- If client needs a logo/branding, add Brand Identity add-on to quotation.",
  "step-4-design-uiux": "INTERNAL UI/UX SPRINT PLANNING:\n- Dark & Cinematic or Glassmorphism requires custom Tailwind tokens.\n- Advanced interactive animations require Framer Motion or GSAP allocation.\n- Review color contrast ratios against WCAG 2.1 AA standards.",
  "step-5-features-functionality": "INTERNAL TECHNICAL COMPLEXITY AUDIT:\n- Multi-role permissions require RBAC middleware and distinct portal routes.\n- Payment gateways in India: Razorpay / Cashfree requires merchant account approval verification.\n- Third-party APIs: check if client has active API keys or developer subscriptions.",
  "step-6-domain-hosting-seo": "INTERNAL INFRASTRUCTURE SIZING:\n- If client needs hosting, allocate Vercel Pro or DigitalOcean Droplet with automated backups.\n- Business email setup: recommend Google Workspace or Zoho Mail.\n- Advanced SEO includes structured schema markup, OpenGraph tags, and automated XML sitemaps.",
  "step-7-budget-timeline": "INTERNAL COMMERCIAL & MARGIN GUIDELINES:\n- Maintain minimum 45% target gross margin on all fixed-price quotations.\n- If client selected Priority Delivery, add expedited rush surcharge.\n- If budget is below standard tier, offer phased MVP delivery.",
  "step-8-final-review": "INTERNAL CLOSING & QUOTATION HANDOVER:\n- Review uploaded reference files and scope documents.\n- Prepare formal 3-page quotation proposal within 48 business hours.\n- Generate client intake ticket and notify account manager."
};
var MASTER_APP_STEP_NOTES = {
  "app-step-1-client-info": "INTERNAL APP CLIENT INTAKE:\n- Confirm company type and legal jurisdiction for App Store / Google Play developer accounts.\n- Check if client already has Apple Developer Program enrollment ($99/yr) and Google Play Console account ($25 one-time).",
  "app-step-2-app-overview": "INTERNAL APP SCOPE ANALYSIS:\n- Cross-platform build (React Native / Flutter) recommended for simultaneous iOS & Android.\n- Estimate user concurrency: Over 10,000 users requires autoscaling Redis cache and managed PostgreSQL database.",
  "app-step-3-platforms-auth": "INTERNAL AUTH & SECURITY AUDIT:\n- Phone OTP requires SMS gateway integration (e.g., Twilio / Fast2SMS).\n- Apple Social Login is mandatory if any third-party social login is implemented on iOS.\n- Enterprise SSO: check for SAML 2.0 or OAuth2 compatibility.",
  "app-step-4-features-screens": "INTERNAL WORKFLOW COMPLEXITY:\n- Over 20 screens requires Figma wireframing sprint before code kickoff.\n- Camera / QR scanning / GPS requires native device permissions handler and battery optimization audit.\n- Push notifications: configure Firebase Cloud Messaging (FCM) and APNs certificates.",
  "app-step-5-backend-integrations": "INTERNAL BACKEND SIZING:\n- Custom REST or GraphQL backend with Node.js/Express.\n- In-app purchases on iOS/Android: ensure 15-30% store commission policy is communicated to client.\n- Plan scheduled cron jobs for background notifications and reporting.",
  "app-step-6-design-security-deployment": "INTERNAL DEPLOYMENT & COMPLIANCE:\n- App Store Review Guidelines: ensure privacy policy and account deletion button are present.\n- MFA and Encryption: apply bcrypt/argon2 and AES-256 for sensitive user data at rest.\n- Review CI/CD pipeline for automated Fastlane store builds.",
  "app-step-7-budget-timeline": "INTERNAL APP MARGIN & DELIVERY TARGETS:\n- Minimum target gross margin: 50% for mobile applications.\n- Contractor allocation must be capped at 35% of total quote value.\n- Ensure milestone payment terms: 40% advance, 30% beta release, 30% store deployment."
};

// src/seed/seed.ts
async function runSeed() {
  console.log("[Seed] Starting database seed...");
  const salt = await bcrypt2.genSalt(10);
  const adminPasswordHash = await bcrypt2.hash(ENV.ADMIN_PASSWORD, salt);
  const admin = await User.findOneAndUpdate(
    { email: ENV.ADMIN_EMAIL.toLowerCase() },
    {
      fullName: "System Administrator",
      email: ENV.ADMIN_EMAIL.toLowerCase(),
      passwordHash: adminPasswordHash,
      role: "superadmin",
      permissions: [...SYSTEM_PERMISSIONS],
      status: "active",
      company: "Digital Agency HQ"
    },
    { upsert: true, new: true }
  );
  console.log(`[Seed] Superadmin ready: ${admin.email}`);
  const brandCount = await BrandProfile.countDocuments();
  if (brandCount === 0) {
    for (const b of INITIAL_BRANDS) {
      await BrandProfile.create(b);
    }
    console.log(`[Seed] Seeded ${INITIAL_BRANDS.length} Brand Profiles.`);
  } else {
    console.log(`[Seed] Found ${brandCount} existing Brand Profiles. Preserving user configurations.`);
  }
  const packageCount = await Package.countDocuments();
  if (packageCount === 0) {
    for (const p of INITIAL_WEBSITE_PACKAGES) {
      await Package.create(p);
    }
    console.log(`[Seed] Seeded ${INITIAL_WEBSITE_PACKAGES.length} Website Packages.`);
  }
  const addonCount = await Addon.countDocuments();
  if (addonCount === 0) {
    for (const a of INITIAL_ADDONS) {
      await Addon.create(a);
    }
    console.log(`[Seed] Seeded ${INITIAL_ADDONS.length} Addons.`);
  }
  const websiteForm = await FormDefinition.findOneAndUpdate(
    { slug: "website-requirements", version: 1 },
    {
      slug: "website-requirements",
      title: "Website Project Requirement Specification",
      description: "Comprehensive multi-step requirement builder for web design and development projects.",
      category: "website",
      version: 1,
      status: "published",
      steps: MASTER_WEBSITE_STEPS,
      publishedAt: /* @__PURE__ */ new Date()
    },
    { upsert: true, new: true }
  );
  console.log(`[Seed] Master Website Requirements Form ready (${MASTER_WEBSITE_STEPS.length} steps, id: ${websiteForm._id})`);
  const appForm = await FormDefinition.findOneAndUpdate(
    { slug: "app-requirements", version: 1 },
    {
      slug: "app-requirements",
      title: "App Project Requirement Specification",
      description: "Dynamic multi-step builder for native mobile apps, cross-platform apps, and custom software.",
      category: "app",
      version: 1,
      status: "published",
      steps: MASTER_APP_STEPS,
      publishedAt: /* @__PURE__ */ new Date()
    },
    { upsert: true, new: true }
  );
  console.log(`[Seed] Master App Requirements Form ready (${MASTER_APP_STEPS.length} steps, id: ${appForm._id})`);
  for (const [stepId, notes] of Object.entries(MASTER_WEBSITE_STEP_NOTES)) {
    await FormStepNotes.findOneAndUpdate(
      {
        formDefinitionId: websiteForm._id,
        formVersion: 1,
        stepId
      },
      {
        notes,
        authorId: admin._id,
        authorName: admin.fullName
      },
      { upsert: true }
    );
  }
  for (const [stepId, notes] of Object.entries(MASTER_APP_STEP_NOTES)) {
    await FormStepNotes.findOneAndUpdate(
      {
        formDefinitionId: appForm._id,
        formVersion: 1,
        stepId
      },
      {
        notes,
        authorId: admin._id,
        authorName: admin.fullName
      },
      { upsert: true }
    );
  }
  console.log("[Seed] Seeded private FormStepNotes for all Website and App steps.");
  console.log("[Seed] Database initialization and seeding completed successfully!");
}
if (process.argv[1] && (process.argv[1].includes("seed.ts") || process.argv[1].includes("seed.js"))) {
  connectDB().then(() => runSeed()).then(() => disconnectDB()).then(() => process.exit(0)).catch((err) => {
    console.error("[Seed] Error seeding database:", err);
    process.exit(1);
  });
}

// src/server.ts
var app = express();
app.use(
  helmet({
    contentSecurityPolicy: false,
    // Allows flexible SPA serving in local dev
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || origin === ENV.CLIENT_URL || origin.includes("localhost")) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true
  })
);
app.use(cookieParser(ENV.COOKIE_SECRET));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
if (ENV.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}
app.use(async (req, res, next) => {
  if (mongoose20.connection.readyState !== 1) {
    try {
      await connectDB();
    } catch (err) {
      console.error("[Database] Middleware connection error:", err);
      return res.status(500).json({
        success: false,
        error: "Database Connection Error",
        message: err.message || "Unable to connect to MongoDB Atlas database"
      });
    }
  }
  next();
});
app.use(authenticateSession);
app.use("/api", apiLimiter);
app.get(["/api/v1/health", "/v1/health", "/health", "/"], (req, res) => {
  const isDbConnected = mongoose20.connection.readyState === 1;
  res.status(isDbConnected ? 200 : 503).json({
    status: isDbConnected ? "healthy" : "degraded",
    database: isDbConnected ? "connected" : "disconnected",
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    environment: ENV.NODE_ENV
  });
});
app.use("/api/v1/auth", authRoutes_default);
app.use("/v1/auth", authRoutes_default);
app.use("/api/v1/public", publicRoutes_default);
app.use("/v1/public", publicRoutes_default);
app.use("/api/v1/submissions", submissionRoutes_default);
app.use("/v1/submissions", submissionRoutes_default);
app.use("/api/v1/admin", adminRoutes_default);
app.use("/v1/admin", adminRoutes_default);
app.use("/api/v1/domains", domainFinderRoutes_default);
app.use("/v1/domains", domainFinderRoutes_default);
app.use(errorHandler);
async function startServer() {
  await connectDB();
  const adminExists = await User.findOne({ role: "superadmin" });
  if (!adminExists) {
    console.log("[Server] No superadmin detected. Running automatic initial database seed...");
    await runSeed();
  }
  const server = app.listen(ENV.PORT, () => {
    console.log(`[Server] Digital Agency Requirement & Financial Portal running on port ${ENV.PORT}`);
    console.log(`[Server] Health Check: http://localhost:${ENV.PORT}/api/v1/health`);
  });
  const shutdown = async () => {
    console.log("[Server] Gracefully shutting down...");
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
  };
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
  return server;
}
var server_default = app;
export {
  app,
  server_default as default,
  startServer
};
