export const invalidateMandatoryData = () => {
    // step0
    localStorage.removeItem('simple-estimate-address');

    // step1
    localStorage.removeItem('simple-estimate-area');

    // step2
    localStorage.removeItem('simple-estimate-bay');

    // step3
    localStorage.removeItem('simple-estimate-expansion');

    // step4
    localStorage.removeItem('simple-estimate-data');
}
