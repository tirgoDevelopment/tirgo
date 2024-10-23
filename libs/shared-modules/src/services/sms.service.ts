// mail.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as rp from 'request-promise';
import { Config } from '../index';
import { Repository } from 'typeorm';
import * as crypto from "crypto";
import * as sendpulse from "sendpulse-api";

@Injectable()
export class SmsService {

  constructor(
    @InjectRepository(Config) private readonly configRepository: Repository<Config>,
  ) {
  }
  async sendSmsGlobal(phone, code) {
    let API_USER_ID = "8b633b534e645924569a7fb772ee1546";
    let API_SECRET = "e16dac0175e1f9a1d2641f435ab915bc";
    let TOKEN_STORAGE = "/tmp/";
    try {
      // Initialize sendpulse and return a promise to wait for its result
      await new Promise((resolve, reject) => {
        sendpulse.init(API_USER_ID, API_SECRET, TOKEN_STORAGE, function (res) {
            if (res) {
                resolve(res);  // Resolve when sendpulse initializes successfully
            } else {
                reject(new Error("Failed to initialize SendPulse API."));
            }
        });
      });

      // Now, send the SMS as a promise
      const sendSms = await new Promise((resolve, reject) => {
        sendpulse.smsSend(
            function (data) {
                if (data && data.result) {
                    resolve(data);  // Resolve the promise if SMS is sent successfully
                } else {
                    reject(new Error("SMS sending failed."));  // Reject if there’s an issue
                }
            },
            "TIRGO",                     // Sender name
            ["+" + phone],               // Phone number
            code,                        // SMS body (message content)
            null,                        // Date: set to `null` for immediate sending
            false,                       // Transliterate: set to `false` for no transliteration
            0                            // Route: default route (0)
        );
    });
    console.log("SMS sent successfully:", sendSms);
    return sendSms;  // Return the SMS send result
    } catch (err) {
      throw Error
    } finally {
    }
  }

  async sendSmsLocal(phone, code) {
    console.log('local sms', phone);
    console.log('local sms', code);
    try {

      let options = {
        method: "POST",
        uri: "http://91.204.239.44/broker-api/send",
        json: true,
        body: {
          messages: [
            {
              recipient: "" + phone,
              "message-id": "a" + new Date().getTime().toString(),
              sms: {
                originator: "3700",
                content: {
                  text: "Confirmation code " + code,
                },
              },
            },
          ],
        },
        headers: {
          Authorization:
            "Basic " + Buffer.from("tirgo:C63Fs89yuN").toString("base64"),
        },
      };
      let rp_res = await rp(options);
      if (rp_res === "Request is received") {
        return "waiting";
      } else {
        return false;
      }
    } catch (err) {
      console.log(err)
      throw Error
    } finally {
      console.log("finally");
    }
  }

  async sendSmsOson(phone, text) {
    console.log(phone, "phone OSON");
    console.log(text, "phone code OSON");
    const txn_id = this.generateUniqueId();
    const str_hash = this.generateHash(
      txn_id,
      "tirgo",
      "TIRGO",
      phone,
      "f498f64594b4f0b844ba45b79d4d0d4f"
    );
    const message = text;
    const params = {
      from: "TIRGO",
      phone_number: phone,
      msg: message,
      str_hash: str_hash,
      txn_id: txn_id,
      login: "tirgo",
    };
    let options = {
      method: "GET",
      uri: `https://api.osonsms.com/sendsms_v1.php?login=${params.login}&from=${params.from}&phone_number=${params.phone_number}&msg=${params.msg}&txn_id=${params.txn_id}&str_hash=${params.str_hash}`,
      json: false,
    };
    try {
      let rp_res = await rp(options);
      if (JSON.parse(rp_res).status == "ok") {
        return "waiting";
      } else {
        return false;
      }
    } catch (err) {
      return false;
    } finally {
      console.log("finally");
    }
}

  async sendSmsRu(phone, code) {
    try {
      let options = {
        method: "GET",
        uri:
          "http://api.iqsms.ru/messages/v2/send/?phone=" +
          phone +
          "&text=Confirmation code " +
          code,
        json: false,
        headers: {
          Authorization:
            "Basic " + Buffer.from("tirgo1:TIRGOSMS").toString("base64"),
        },
      };
      await rp(options);
      return true;
    } catch (err: any) {
      console.log(err);
      throw Error
    }
  }

  async sendOtp(phoneNumber: string, code: number) {
    let res;
    if (phoneNumber.substr(0, 3) === "998") {
      res = await this.sendSmsLocal(phoneNumber, code);
      console.log("res1", res);
      //res = await sendSms(phone,code,country_code)
    } else if (phoneNumber.substr(0, 3) === "992") {
      res = await this.sendSmsOson(phoneNumber, code);
      console.log("res2", res);
      //res = await sendSms(phone,code,country_code)
    } else if (phoneNumber.substr(0, 2) === "79") {
      res = await this.sendSmsRu(phoneNumber, code);
    } else {
      res = await this.sendSmsGlobal(phoneNumber, code);
    }
    return res;
  }

  async generateUniqueId() {
    return crypto.randomBytes(16).toString("hex");
  }
  
  async generateHash(txn_id, login, sender, phone_number, hash) {
    const dlm = ";";
    const hashString = `${txn_id}${dlm}${login}${dlm}${sender}${dlm}${phone_number}${dlm}${hash}`;
    return crypto.createHash("sha256").update(hashString).digest("hex");
  }
}
