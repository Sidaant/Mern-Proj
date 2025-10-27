export interface TokenPayload {
    userId: string;
    email: string;
}
export interface RefreshTokenPayload extends TokenPayload {
    tokenId: string;
}
export declare const generateAccessToken: (payload: TokenPayload) => string;
export declare const generateRefreshToken: (payload: RefreshTokenPayload) => string;
export declare const verifyAccessToken: (token: string) => TokenPayload;
export declare const verifyRefreshToken: (token: string) => RefreshTokenPayload;
export declare const generateTokenPair: (userId: string, email: string) => {
    accessToken: string;
    refreshToken: string;
    tokenId: string;
};
//# sourceMappingURL=jwt.d.ts.map