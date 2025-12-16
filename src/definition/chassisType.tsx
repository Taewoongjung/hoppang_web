const chassisTypeOptions = [
    { value: 'BalconySingle', label: '발코니단창' },
    { value: 'BalconyDouble', label: '발코니이중창' },
    { value: 'InteriorSingle', label: '내창단창' },
    { value: 'InteriorDouble', label: '내창이중창'},
    { value: 'LivingRoomSliding', label: '거실분합창' },
    { value: 'Fixed', label: '픽스창' },
    { value: 'Turning', label: '터닝도어' },
]
export default chassisTypeOptions;

export const getChassisTypeValue = (label: string, defaultValue: string = ''): string => {
    const option = chassisTypeOptions.find(opt => opt.label === label);
    return option?.value ?? defaultValue;
};
