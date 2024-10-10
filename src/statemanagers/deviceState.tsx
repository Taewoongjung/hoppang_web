import {makeAutoObservable} from 'mobx';

class DeviceState {
    deviceId = '';

    constructor() {
        makeAutoObservable(this);
    }

    setDeviceId(state: string) {
        this.deviceId = state;
    }

    getDeviceIdState = () => {
        return this.deviceId;
    }
}

const deviceStateInstance = new DeviceState();
export default deviceStateInstance;
