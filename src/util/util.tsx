import chassisTypeOptions from "../definition/chassisType";

export const getLabelOfChassisType = (target:string) => {
    return chassisTypeOptions.find(
        (a) => a.value === target
    )?.label;
}
