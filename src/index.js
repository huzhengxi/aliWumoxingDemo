import iot from "alibabacloud-iot-device-sdk";

const productKey = "a1UBvjMc9FM";
const productSecret = "sIPuZ8pfJA7spZaj";
const deviceName = "test1";
const deviceSecret = "a30359d72ce6f12f4e060b1d80e51975";

let publishTimeoutId;
let stopTimeoutId;
function publishFakeData(device, pubTopic, delay = 3000, stopTime = 60000) {
  if (publishTimeoutId) {
    console.warn('');
    clearInterval(publishTimeoutId);
  }
  if (stopTimeoutId) {
    console.log("发送测试数据停止", stopTimeoutId);
    clearTimeout(stopTimeoutId);
  }
  publishTimeoutId = setInterval(() => {
    const fakeData = {
      id: Date.now(),
      name: deviceName,
    };
    console.log("publishData:", fakeData);
    device.publish(pubTopic, JSON.stringify(fakeData));
  }, delay);
  stopTimeoutId = setTimeout(() => {
    clearInterval(publishTimeoutId);
  }, stopTime);
}

function test1() {
  const device = iot.device({
    brokerUrl: "mqtt://hiu3b5bJwCh.iot-as-mqtt.cn-shanghai.aliyuncs.com:1883/",
    productKey,
    deviceSecret,
    deviceName,
  });

  // 订阅topic
  const subTopic = `/${productKey}/${deviceName}/user/get`;
  // 发布topic
  const pubTopic = `/${productKey}/${deviceName}/user/update`;

  // ['connect', 'error', 'close', 'reconnect', 'offline', 'message']
  device.on("connect", () => {
    console.log("connect success");
    device.subscribe(subTopic);
    publishFakeData(device, pubTopic);
  });

  device.on("message", (topic, payload) => {
    console.log(`接收到[${topic}]数据:`, payload.toString());
    device.end();
  });
}

function test2() {
  const registerDeviceInfo = {
    productKey,
    productSecret,
    deviceName: `device-${(Math.random() * 10) | 0}`,
  };

  iot.register(registerDeviceInfo, (res) => {
    if (res.code != 200) {
      console.log("register failed", res);
      return;
    }
    console.log("register succeed", res);
  });
}

test1();
