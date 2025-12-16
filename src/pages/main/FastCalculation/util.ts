export const invalidateMandatoryData = () => {
    localStorage.removeItem('simple-estimate-address');

    localStorage.removeItem('simple-estimate-area');

    localStorage.removeItem('simple-estimate-bay');

    localStorage.removeItem('simple-estimate-expansion');

    localStorage.removeItem('simple-estimate-resident');

    localStorage.removeItem('simple-estimate-data');
}
