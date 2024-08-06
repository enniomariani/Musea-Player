import {describe, expect, it} from "@jest/globals";
import {GlobalSetting} from "main/globalSettings/GlobalSetting.js";

describe("test constructor ", ()=>{
   it("should set the private vars to the passed vars in the constructor", ()=>{
       let nameSettingsFile:string = "nameSettingsFile";
       let name:string = "name";
       let varType:string = GlobalSetting.TYPE_NUMBER;
       let value:number = 100;

       let globalSetting:GlobalSetting = new GlobalSetting(nameSettingsFile, name, varType, value);
       expect(globalSetting.nameInSettingsFile).toBe(nameSettingsFile);
       expect(globalSetting.name).toBe(name);
       expect(globalSetting.varType).toBe(varType);
       expect(globalSetting.value).toBe(value);
   });

    it("should throw an error if the passed vartype is not one of the static types defined in the class", ()=>{
        let nameSettingsFile:string = "nameSettingsFile";
        let name:string = "name";
        let varType:string = "other-TypeXY";
        let value:number = 100;
        expect(() => new GlobalSetting(nameSettingsFile, name, varType, value)).toThrow();
    });

    it("should throw an error if the passed var-type is NUMBER, but the default-value is not a number", ()=>{
        let nameSettingsFile:string = "nameSettingsFile";
        let name:string = "name";
        let varType:string = GlobalSetting.TYPE_NUMBER;
        let value:string = "100";
        expect(() => new GlobalSetting(nameSettingsFile, name, varType, value)).toThrow();
    });

    it("should throw an error if the passed var-type is BOOLEAN, but the default-value is not a boolean", ()=>{
        let nameSettingsFile:string = "nameSettingsFile";
        let name:string = "name";
        let varType:string = GlobalSetting.TYPE_BOOLEAN;
        let value:string = "100";
        expect(() => new GlobalSetting(nameSettingsFile, name, varType, value)).toThrow();
    });

    it("should throw an error if the passed var-type is STRING, but the default-value is not a string", ()=>{
        let nameSettingsFile:string = "nameSettingsFile";
        let name:string = "name";
        let varType:string = GlobalSetting.TYPE_STRING;
        let value:boolean = true;
        expect(() => new GlobalSetting(nameSettingsFile, name, varType, value)).toThrow();
    });
});