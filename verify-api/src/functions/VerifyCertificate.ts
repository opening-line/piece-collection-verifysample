import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { Buffer } from "buffer";
import { Verifier } from '@nemtus/symbol-sdk-typescript/esm/symbol/KeyPair';
import { PublicKey, Signature } from "@nemtus/symbol-sdk-typescript/esm/CryptoTypes";

interface RequestBody {
    pub_key: string;
    signature: string;
    payload: Payload;
}

interface Payload {
    mosaic_id: string;
    verifier: string;
    create_timestamp: number;
}

interface SuccessResponse {
    result: 'ok' | 'ng';
    mosaic_id: string;
    create_timestamp: number;
}

interface ErrorResponse {
    message: string;
}

function validateRequest(data: any): { isValid: boolean; error?: string } {
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

export async function VerifyCertificate(
    request: HttpRequest,
    context: InvocationContext
): Promise<HttpResponseInit> {
    context.log(`Certificate verification request received for url "${request.url}"`);
    try {
        // リクエストボディの取得とパース
        const requestBody = await request.json() as RequestBody;
        // バリデーション
        const validation = validateRequest(requestBody);
        if (!validation.isValid) {
            const errorResponse: ErrorResponse = {
                message: validation.error!
            };
            return {
                status: 400,
                jsonBody: errorResponse
            };
        }
        // 検証
        const publicAccount = new PublicKey(requestBody.pub_key);
        const sig = new Signature(requestBody.signature);
        const v = new Verifier(publicAccount)
        const isVerified = v.verify(
            Buffer.from(JSON.stringify(requestBody.payload), "utf-8"),
            sig,
        );

        const response: SuccessResponse = {
            result: isVerified ? 'ok' : 'ng',
            mosaic_id: requestBody.payload.mosaic_id,
            create_timestamp: requestBody.payload.create_timestamp
        };

        return {
            status: isVerified ? 200 : 400,
            jsonBody: response
        };
    } catch (error) {
        const errorResponse: ErrorResponse = {
            message: "リクエストの処理中にエラーが発生しました"
        };
        return {
            status: 400,
            jsonBody: errorResponse
        };
    }
}

app.http('VerifyCertificate', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: VerifyCertificate
});