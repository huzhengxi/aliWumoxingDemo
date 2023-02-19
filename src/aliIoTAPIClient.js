import crypto from "crypto";
import querystring from "querystring";
import axios from "axios";

/**
 * 用户登录名称 huzhengxi@1163862921906040.onaliyun.com
登录密码 sflhzx1226
AccessKey ID LTAI5tPEMQDDk1AgEvFjxMF8
AccessKey Secret letXbRyeXYhAfZyc4vXXGc4S0cZs1D
 */
// huzhengxi
const AccessKey = "LTAI5tPEMQDDk1AgEvFjxMF8";
const AccessKeySecret = "letXbRyeXYhAfZyc4vXXGc4S0cZs1D";

class AliIoTAPIClient {
  constructor(config) {
    this.config = config;
    this.client = axios.create({
      baseURL: `https://iot.${config.regionId}.aliyuncs.com`,
    });
  }

  async queryDeviceData(deviceId, productKey, startTime, endTime) {
    const action = "QueryDevicePropertyData";
    const identifier = "temperature"; // 查询的属性名称

    const params = {
      Action: action,
      Format: this.config.format,
      Asc: "1",
      StartTime: startTime,
      EndTime: endTime,
      Identifier: identifier,
      PageSize: "50",
      DeviceName: deviceId,
      ProductKey: productKey,
      RegionId: this.config.regionId,
    };

    const url = this.buildRequestURL(params);
    const response = await this.client.get(url);

    return response.data;
  }

  buildRequestURL(params) {
    params.SignatureMethod = "HMAC-SHA1";
    params.SignatureNonce = String(
      Date.now() + Math.floor(Math.random() * 1000)
    );
    params.SignatureVersion = "1.0";
    params.AccessKeyId = this.config.accessKeyId;
    params.Timestamp = new Date().toISOString();
    params.Version = "2018-01-20";
    const keys = Object.keys(params).sort();

    const canonicalizedQueryString = keys
      .map(
        (key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
      )
      .join("&");
    const stringToSign = `GET&%2F&${encodeURIComponent(
      canonicalizedQueryString
    )}`;
    const signature = crypto
      .createHmac("sha1", `${this.config.accessKeySecret}&`)
      .update(stringToSign)
      .digest("base64");
    params.Signature = signature;

    const qs = querystring.stringify(params);
    return `/?${qs}`;
  }
}

const config = {
  accessKeyId: AccessKey,
  accessKeySecret: AccessKeySecret,
  regionId: "cn-shanghai",
  format: "JSON",
};

const client = new AliIoTAPIClient(config);

const deviceId = "a30359d72ce6f12f4e060b1d80e51975";
const productKey = "a1UBvjMc9FM";
const startTime = new Date("2023-02-18T00:00:00.000Z").getTime();
const endTime = new Date("2023-02-19T00:00:00.000Z").getTime();

client
  .queryDeviceData(deviceId, productKey, startTime, endTime)
  .then((data) => {
    console.log(data);
    console.log("请求成功");
  })
  .catch((err) => {
    console.error(err);
    console.warn("请求失败");
  });
