
import {Verify} from "../validation/Verify";
export class CwValidationResults{
  valid:boolean


  constructor(valid:boolean) {
    this.valid = valid;
  }
}

export class DataTypeModel {
  type:string


  constructor(typeDef:any) {
    this.type = typeDef.type;
  }
}

var Registry = {};

export class CwInputDefinition {
  type:string
  placeholder:string
  dataType: DataTypeModel
  name:string


  constructor(id:string, name:string) {
    this.type = id
    this.name = name
  }

  verify(value:any):CwValidationResults {
    return new CwValidationResults(true)
  }

  static registerType(typeId:string, type:Function){
    Registry[typeId] = type
  }

  static fromJson(json:any, name:string):CwInputDefinition{
    let m = Registry[json.id || json.type].fromJson(json, name);
    m.placeholder = json.placeholder
    m.dataType = json.dataType
    return m;
  }
}

export class CwSpacerInputDefinition extends CwInputDefinition {
  private flex;

  constructor(flex:number) {
    super("spacer", null);
    this.flex = flex
  }
}


export class CwTextInputModel extends CwInputDefinition {
  minLength:number = 0
  maxLength:number = 255


  constructor(id:string, name:string) {
    super(id, name);
  }

  verify(value:string):CwValidationResults {
    let valid = true;
    if(this.minLength > 0){
      valid = value != null && value.length >= this.minLength
    }
    if(value) {
      valid = valid && value.length <= this.maxLength
    }
    return new CwValidationResults(valid)
  }

  static fromJson(json:any, name:string):CwTextInputModel {
    let m = new CwTextInputModel(json.id, name);
    m.minLength = json.dataType.minLength
    m.maxLength = json.dataType.maxLength
    return m
  }
}
CwInputDefinition.registerType("text", CwTextInputModel)

export class CwDropdownInputModel extends CwInputDefinition {
  options: {[key:string]: any}
  allowAdditions: boolean
  minSelections:number = 0
  maxSelections:number = 1
  selected:Array<any>

  constructor(id:string, name:string) {
    super(id, name)
    this.selected = []
  }

  verify(selections:any):CwValidationResults {
    let valid  = true
    if(Verify.isString(selections)){
      selections = [selections]
    }
    if(this.minSelections > 0){
      valid = selections != null && selections.length >= this.minSelections
    }
    if(selections != null){
      valid = valid && selections.length <= this.maxSelections
    }
    return new CwValidationResults(valid)
  }

  static fromJson(json:any, name:string):CwDropdownInputModel {
    let m = new CwDropdownInputModel(json.id, name);
    m.options = json.options
    m.allowAdditions = json.allowAdditions
    m.minSelections = json.minSelections
    m.maxSelections = json.maxSelections
    let defV = json.dataType.defaultValue
    m.selected = (defV == null || defV === '') ? [] : [defV]
    return m
  }
}

CwInputDefinition.registerType("dropdown", CwDropdownInputModel)



export class ParameterDefinition {
  defaultValue:string
  priority: number
  key:string
  inputType: CwInputDefinition


  constructor() {
  }

  static fromJson(json:any):ParameterDefinition{
    let m = new ParameterDefinition
    let defV = json.defaultValue
    m.defaultValue = (defV == null || defV === '') ? null : defV
    m.priority = json.priority
    m.key = json.key
    m.inputType = CwInputDefinition.fromJson(json.inputType, m.key)
    return m;
  }
}


