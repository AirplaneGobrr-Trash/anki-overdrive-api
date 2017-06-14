import {VehicleMessage} from "../vehicle-message";
import {LightConfig} from "../../../main/de.msg.iot.anki/core/vehicle/light-config";
import {Vehicle} from "../../../main/de.msg.iot.anki/core/vehicle/vehicle-interface";

class SetLights extends VehicleMessage {

    private _lightConfig: LightConfig|Array<LightConfig>;
    private _channelCount: number;

    constructor(vehicle: Vehicle, config: LightConfig|Array<LightConfig>) {
        super(new Buffer(18), vehicle, 0x33, 17);
        let channelCount = 1,
            pos = 2;

        if (config instanceof Array)
            channelCount = config.length > 3 ? 3 : config.length;
        else
            config = [config];

        this.data.writeUInt8(channelCount, pos++);
        this._channelCount = channelCount;
        this.writeLightConfig(pos, config);
        this._lightConfig = config;

    }

    private writeLightConfig(pos: number, configs: Array<LightConfig>): void {
        for (let i = 0; i < configs.length && i < 3; ++i) {
            let config = configs[i];
            this.data.writeUInt8(config.channel, pos++);
            this.data.writeUInt8(config.effect, pos++);
            this.data.writeUInt8(config.start, pos++);
            this.data.writeUInt8(config.end, pos++);
            this.data.writeUInt8(config.cycles, pos++);
        }
    }
}

export {SetLights}
