////// ERRORS //////

export class InvalidPropertyError extends Error {
    constructor(arg, field) {
        super(arg)
        this.field = field
    }
}

export class RelatedObjectError extends Error {
    constructor(arg, collection, targetKey, targetValue) {
        super(arg)
        this.collection = collection
        this.targetKey = targetKey
        this.targetValue = targetValue
    }
}

////// MODELS //////

const STRICT = true

class BaseModel {
    constructor(data) {
        const {name} = data
        this.name = this.validateName(name, STRICT)
        this.createdAt = + new Date()
        delete data.name
        delete data.created_at
    }

    validateName(value, strict=false) {
        const testValue = String(value)
        if (!testValue) {
            throw new InvalidPropertyError("This field is required", "name")
        }
        if (strict && testValue !== value) {
            throw new InvalidPropertyError("This value must be a string", "name")
        }
        return testValue
    }
}

export class TableSpecification extends BaseModel {
    /* eslint-disable semi */
    static collectionName = "tablespecification"
    /* eslint-enable semi */

    constructor({...data}) {
        super(data)
        const {columns, others} = data
        this.columns = columns
        Object.assign(this, others)
    }
}

export class TableRow {
    /* eslint-disable semi */
    static collectionName = "tablerow";
    static requires = {
        [TableSpecification.collectionName]: ["tableName", "name"]
    };
    /* eslint-enable semi */

    constructor(data, related) {
        const {tableName, columnData} = data
        this.tableName = this.validateTableName(tableName, related)
        Object.assign(this, columnData)
    }

    validateTableName(name, related) {
        Object.keys(this.requires).forEach(
            (requiredCollection) => {
                const foundObject = related[requiredCollection]
                if (!foundObject || foundObject.length === 0) {
                    throw new RelatedObjectError(
                        "Couldn't find related object",
                        requiredCollection,
                        this.required[requiredCollection],
                        name
                    )
                }
            }
        )
        const newName = String(name)
        if (!newName || newName !== name) {
            throw new InvalidPropertyError(
                "This field is required and must be a string", "tableName"
            )
        }
        return newName
    }
}


export class Tag extends BaseModel {
    /* eslint-disable semi */
    static collectionName = "tag";
    /* eslint-enable semi */

    constructor({...data}) {
        super(data)
        const {parent, description, others} = data
        this.parent = parent || null
        this.description = description || ""
        Object.assign(this, others)
    }
}


export class Trait extends BaseModel {
    /* eslint-disable semi */
    static collectionName = "tag";
    static DIE = "die";
    static EXPONENT = "exponent";
    static DEFAULT = "default";
    /* eslint-enable semi */

    constructor({...data}) {
        super(data)
        const {level, description, type, others} = data
        this.level = level || 0
        this.description = description || ""
        this.type = this.validateType(type)
        Object.assign(this, others)
    }

    validateType(value) {
        const newValue = this.types.find(type => value === type )
        if (!newValue) {
            throw new InvalidPropertyError(`Value must be one of ${this.types.join(", ")}`, "type")
        }
        return newValue
    }

    get types() {
        return [
            this.DIE,
            this.EXPONENT,
            this.DEFAULT,
        ]
    }
}

export class Aspect extends BaseModel {
    /* eslint-disable semi */
    static collectionName = "aspect";
    /* eslint-enable semi */
    constructor({...data}) {
        super(data)
        const {description, others} = data
        this.description = description || ""
        Object.assign(this, others)
    }
}

export class ItemSpecification extends BaseModel {
    /* eslint-disable semi */
    static collectionName = "itemspecification";
    /* eslint-enable semi */
    constructor({...data}) {
        super(data)
        const {fields} = data
        this.fields = this.validateFields(fields)
    }

    validateFields(fields) {
        if (!Array.isArray(fields)) {
            return InvalidPropertyError("Fields must be a list", this.name)
        }
        return fields.map(FieldSpecification)
    }
}

export class FieldSpecification{
    constructor(data) {
        const {name, type, options, keyMapType, keyMap} = data
        this.name = this.validateName(name)
        this.type = this.validateType(type)
        this.options = this.validateOptions(options)
        this.keyMapType = this.validateKeyMapType(keyMapType)
        this.keyMap = this.validateKeyMap(keyMap)
    }

    /* eslint-disable semi */
    static fieldTypes = {
        string: String,
        integer: (value) => parseInt(value, 10),
        boolean: Boolean,
    }

    static keyMapTypes = {
        integerMap: (value) => parseInt(value, 10),
        imageMap: String,
    }
    /* eslint-enable semi */
    validateName(value, strict=false) {
        const testValue = String(value)
        if (!testValue) {
            throw new InvalidPropertyError("This field is required", "name")
        }
        if (strict && testValue !== value) {
            throw new InvalidPropertyError("This value must be a string", "name")
        }
        return testValue
    }

    validateOptions(options) {
        if (!Array.isArray(options)) {
            throw new InvalidPropertyError("'options' must be a list", this.name)
        }
        const newOptionValues = options.map(this.validateValueType)
        return newOptionValues
    }

    validateType(type) {
        const newValue = Object.keys(this.fieldTypes).find(validType => type===validType)
        if (!newValue) {
            throw new InvalidPropertyError("Invalid type", this.name)
        }
        return newValue
    }

    validateValueType(value) {
        const typeConstructor = this.fieldTypes[this.type]
        const newValue = typeConstructor(value)
        if (newValue !== value) {
            throw new InvalidPropertyError("Invalid option value type", this.name)
        }
        return newValue
    }

    validateKeyMapType(type) {
        const newValue = Object.keys(this.keyMapTypes).find(validType => type===validType)
        if (!newValue) {
            throw new InvalidPropertyError("Invalid keymap type", this.name)
        }
        return newValue
    }

    validateKeyMapKey(key) {
        const newValue = Object.keys(this.options).find(validKey => key === validKey)
        if (!newValue) {
            throw new InvalidPropertyError("Invalid type", this.name)
        }
        return newValue
    }

    validateKeyMapValue(value) {
        const typeConstructor = this.keyMapTypes[this.keyMapType]
        const newValue = typeConstructor(value)
        // TODO required?
        if (newValue !== value) {
            throw new InvalidPropertyError("Invalid option value type", this.name)
        }
        return newValue
    }

    validateKeyMap(keyMap) {
        if (typeof keyMap !== "object") {
            throw new InvalidPropertyError("Keymap must be a map", this.name)
        }
        const keyMapKeys = Object.keys.map(this.validateKeyMapKey)
        const newKeyMap = keyMapKeys.reduce(
            (newMap, key) => ({[key]: this.validateKeyMapValue(keyMap[key])}),
            {}
        )
        return newKeyMap
    }
}
