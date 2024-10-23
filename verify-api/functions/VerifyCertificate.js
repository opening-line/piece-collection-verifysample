"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifyCertificate = void 0;
const functions_1 = require("@azure/functions");
const buffer_1 = require("buffer");
const KeyPair_1 = require("@nemtus/symbol-sdk-typescript/esm/symbol/KeyPair");
const CryptoTypes_1 = require("@nemtus/symbol-sdk-typescript/esm/CryptoTypes");
function validateRequest(data) {
    if (!data) {
        return { isValid: false, error: "リクエストボディが必要です" };
    }
    // 必須フィールドの存在チェック
    if (!data.pub_key) {
        return { isValid: false, error: "pub_key は必須フィールドです" };
    }
    if (!data.signature) {
        return { isValid: false, error: "signature は必須フィールドです" };
    }
    if (!data.payload) {
        return { isValid: false, error: "payload は必須フィールドです" };
    }
    // payloadのバリデーション
    if (!data.payload.mosaic_id) {
        return { isValid: false, error: "payload.mosaic_id は必須フィールドです" };
    }
    if (!data.payload.verifier) {
        return { isValid: false, error: "payload.verifier は必須フィールドです" };
    }
    if (!data.payload.create_timestamp) {
        return { isValid: false, error: "payload.create_timestamp は必須フィールドです" };
    }
    // 型チェック
    if (typeof data.pub_key !== 'string') {
        return { isValid: false, error: "pub_key は文字列である必要があります" };
    }
    if (typeof data.signature !== 'string') {
        return { isValid: false, error: "signature は文字列である必要があります" };
    }
    if (typeof data.payload.mosaic_id !== 'string') {
        return { isValid: false, error: "payload.mosaic_id は文字列である必要があります" };
    }
    if (typeof data.payload.verifier !== 'string') {
        return { isValid: false, error: "payload.verifier は文字列である必要があります" };
    }
    if (typeof data.payload.create_timestamp !== 'number') {
        return { isValid: false, error: "payload.create_timestamp は数値である必要があります" };
    }
    return { isValid: true };
}
function VerifyCertificate(request, context) {
    return __awaiter(this, void 0, void 0, function* () {
        context.log(`Certificate verification request received for url "${request.url}"`);
        try {
            // リクエストボディの取得とパース
            const requestBody = yield request.json();
            // バリデーション
            const validation = validateRequest(requestBody);
            if (!validation.isValid) {
                const errorResponse = {
                    message: validation.error
                };
                return {
                    status: 400,
                    jsonBody: errorResponse
                };
            }
            // 検証
            const publicAccount = new CryptoTypes_1.PublicKey(requestBody.pub_key);
            const sig = new CryptoTypes_1.Signature(requestBody.signature);
            const v = new KeyPair_1.Verifier(publicAccount);
            const isVerified = v.verify(buffer_1.Buffer.from(JSON.stringify(requestBody.payload), "utf-8"), sig);
            const response = {
                result: isVerified ? 'ok' : 'ng',
                mosaic_id: requestBody.payload.mosaic_id,
                create_timestamp: requestBody.payload.create_timestamp
            };
            return {
                status: isVerified ? 200 : 400,
                jsonBody: response
            };
        }
        catch (error) {
            const errorResponse = {
                message: "リクエストの処理中にエラーが発生しました"
            };
            return {
                status: 400,
                jsonBody: errorResponse
            };
        }
    });
}
exports.VerifyCertificate = VerifyCertificate;
functions_1.app.http('VerifyCertificate', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: VerifyCertificate
});
//# sourceMappingURL=VerifyCertificate.js.map