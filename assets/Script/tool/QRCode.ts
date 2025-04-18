
const { ccclass, property, executeInEditMode } = cc._decorator;

export const QRCodePlugin = (() => { function t(t) { this.mode = r.MODE_8BIT_BYTE, this.data = t } function e(t, e) { this.typeNumber = t, this.errorCorrectLevel = e, this.modules = null, this.moduleCount = 0, this.dataCache = null, this.dataList = new Array } t.prototype = { getLength: function (t) { return this.data.length }, write: function (t) { for (var e = 0; e < this.data.length; e++)t.put(this.data.charCodeAt(e), 8) } }, e.prototype = { addData: function (e) { var r = new t(e); this.dataList.push(r), this.dataCache = null }, isDark: function (t, e) { if (t < 0 || this.moduleCount <= t || e < 0 || this.moduleCount <= e) throw new Error(t + "," + e); return this.modules[t][e] }, getModuleCount: function () { return this.moduleCount }, make: function () { if (this.typeNumber < 1) { var t = 1; for (t = 1; t < 40; t++) { for (var e = v.getRSBlocks(t, this.errorCorrectLevel), r = new B, n = 0, o = 0; o < e.length; o++)n += e[o].dataCount; for (o = 0; o < this.dataList.length; o++) { var i = this.dataList[o]; r.put(i.mode, 4), r.put(i.getLength(), f.getLengthInBits(i.mode, t)), i.write(r) } if (r.getLengthInBits() <= 8 * n) break } this.typeNumber = t } this.makeImpl(!1, this.getBestMaskPattern()) }, makeImpl: function (t, r) { this.moduleCount = 4 * this.typeNumber + 17, this.modules = new Array(this.moduleCount); for (var n = 0; n < this.moduleCount; n++) { this.modules[n] = new Array(this.moduleCount); for (var o = 0; o < this.moduleCount; o++)this.modules[n][o] = null } this.setupPositionProbePattern(0, 0), this.setupPositionProbePattern(this.moduleCount - 7, 0), this.setupPositionProbePattern(0, this.moduleCount - 7), this.setupPositionAdjustPattern(), this.setupTimingPattern(), this.setupTypeInfo(t, r), this.typeNumber >= 7 && this.setupTypeNumber(t), null == this.dataCache && (this.dataCache = e.createData(this.typeNumber, this.errorCorrectLevel, this.dataList)), this.mapData(this.dataCache, r) }, setupPositionProbePattern: function (t, e) { for (var r = -1; r <= 7; r++)if (!(t + r <= -1 || this.moduleCount <= t + r)) for (var n = -1; n <= 7; n++)e + n <= -1 || this.moduleCount <= e + n || (this.modules[t + r][e + n] = 0 <= r && r <= 6 && (0 == n || 6 == n) || 0 <= n && n <= 6 && (0 == r || 6 == r) || 2 <= r && r <= 4 && 2 <= n && n <= 4) }, getBestMaskPattern: function () { for (var t = 0, e = 0, r = 0; r < 8; r++) { this.makeImpl(!0, r); var n = f.getLostPoint(this); (0 == r || t > n) && (t = n, e = r) } return e }, createMovieClip: function (t, e, r) { var n = t.createEmptyMovieClip(e, r), o = 1; this.make(); for (var i = 0; i < this.modules.length; i++)for (var s = i * o, u = 0; u < this.modules[i].length; u++) { var a = u * o; this.modules[i][u] && (n.beginFill(0, 100), n.moveTo(a, s), n.lineTo(a + o, s), n.lineTo(a + o, s + o), n.lineTo(a, s + o), n.endFill()) } return n }, setupTimingPattern: function () { for (var t = 8; t < this.moduleCount - 8; t++)null == this.modules[t][6] && (this.modules[t][6] = t % 2 == 0); for (var e = 8; e < this.moduleCount - 8; e++)null == this.modules[6][e] && (this.modules[6][e] = e % 2 == 0) }, setupPositionAdjustPattern: function () { for (var t = f.getPatternPosition(this.typeNumber), e = 0; e < t.length; e++)for (var r = 0; r < t.length; r++) { var n = t[e], o = t[r]; if (null == this.modules[n][o]) for (var i = -2; i <= 2; i++)for (var s = -2; s <= 2; s++)this.modules[n + i][o + s] = -2 == i || 2 == i || -2 == s || 2 == s || 0 == i && 0 == s } }, setupTypeNumber: function (t) { for (var e = f.getBCHTypeNumber(this.typeNumber), r = 0; r < 18; r++) { var n = !t && 1 == (e >> r & 1); this.modules[Math.floor(r / 3)][r % 3 + this.moduleCount - 8 - 3] = n } for (r = 0; r < 18; r++) { n = !t && 1 == (e >> r & 1); this.modules[r % 3 + this.moduleCount - 8 - 3][Math.floor(r / 3)] = n } }, setupTypeInfo: function (t, e) { for (var r = this.errorCorrectLevel << 3 | e, n = f.getBCHTypeInfo(r), o = 0; o < 15; o++) { var i = !t && 1 == (n >> o & 1); o < 6 ? this.modules[o][8] = i : o < 8 ? this.modules[o + 1][8] = i : this.modules[this.moduleCount - 15 + o][8] = i } for (o = 0; o < 15; o++) { i = !t && 1 == (n >> o & 1); o < 8 ? this.modules[8][this.moduleCount - o - 1] = i : o < 9 ? this.modules[8][15 - o - 1 + 1] = i : this.modules[8][15 - o - 1] = i } this.modules[this.moduleCount - 8][8] = !t }, mapData: function (t, e) { for (var r = -1, n = this.moduleCount - 1, o = 7, i = 0, s = this.moduleCount - 1; s > 0; s -= 2)for (6 == s && s--; 1;) { for (var u = 0; u < 2; u++)if (null == this.modules[n][s - u]) { var a = !1; i < t.length && (a = 1 == (t[i] >>> o & 1)), f.getMask(e, n, s - u) && (a = !a), this.modules[n][s - u] = a, -1 == --o && (i++, o = 7) } if ((n += r) < 0 || this.moduleCount <= n) { n -= r, r = -r; break } } } }, e.PAD0 = 236, e.PAD1 = 17, e.createData = function (t, r, n) { for (var o = v.getRSBlocks(t, r), i = new B, s = 0; s < n.length; s++) { var u = n[s]; i.put(u.mode, 4), i.put(u.getLength(), f.getLengthInBits(u.mode, t)), u.write(i) } var a = 0; for (s = 0; s < o.length; s++)a += o[s].dataCount; if (i.getLengthInBits() > 8 * a) throw new Error("code length overflow. (" + i.getLengthInBits() + ">" + 8 * a + ")"); for (i.getLengthInBits() + 4 <= 8 * a && i.put(0, 4); i.getLengthInBits() % 8 != 0;)i.putBit(!1); for (; 1 && !(i.getLengthInBits() >= 8 * a) && (i.put(e.PAD0, 8), !(i.getLengthInBits() >= 8 * a));)i.put(e.PAD1, 8); return e.createBytes(i, o) }, e.createBytes = function (t, e) { for (var r = 0, n = 0, o = 0, i = new Array(e.length), s = new Array(e.length), u = 0; u < e.length; u++) { var a = e[u].dataCount, h = e[u].totalCount - a; n = Math.max(n, a), o = Math.max(o, h), i[u] = new Array(a); for (var l = 0; l < i[u].length; l++)i[u][l] = 255 & t.buffer[l + r]; r += a; var g = f.getErrorCorrectPolynomial(h), c = new d(i[u], g.getLength() - 1).mod(g); s[u] = new Array(g.getLength() - 1); for (l = 0; l < s[u].length; l++) { var m = l + c.getLength() - s[u].length; s[u][l] = m >= 0 ? c.get(m) : 0 } } var v = 0; for (l = 0; l < e.length; l++)v += e[l].totalCount; var B = new Array(v), L = 0; for (l = 0; l < n; l++)for (u = 0; u < e.length; u++)l < i[u].length && (B[L++] = i[u][l]); for (l = 0; l < o; l++)for (u = 0; u < e.length; u++)l < s[u].length && (B[L++] = s[u][l]); return B }; var r = { MODE_NUMBER: 1 << 0, MODE_ALPHA_NUM: 1 << 1, MODE_8BIT_BYTE: 1 << 2, MODE_KANJI: 1 << 3 }, n = { L: 1, M: 0, Q: 3, H: 2 }; e.QRErrorCorrectLevel = n; for (var o = 0, i = 1, s = 2, u = 3, a = 4, h = 5, l = 6, g = 7, f = { PATTERN_POSITION_TABLE: [[], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34], [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50], [6, 30, 54], [6, 32, 58], [6, 34, 62], [6, 26, 46, 66], [6, 26, 48, 70], [6, 26, 50, 74], [6, 30, 54, 78], [6, 30, 56, 82], [6, 30, 58, 86], [6, 34, 62, 90], [6, 28, 50, 72, 94], [6, 26, 50, 74, 98], [6, 30, 54, 78, 102], [6, 28, 54, 80, 106], [6, 32, 58, 84, 110], [6, 30, 58, 86, 114], [6, 34, 62, 90, 118], [6, 26, 50, 74, 98, 122], [6, 30, 54, 78, 102, 126], [6, 26, 52, 78, 104, 130], [6, 30, 56, 82, 108, 134], [6, 34, 60, 86, 112, 138], [6, 30, 58, 86, 114, 142], [6, 34, 62, 90, 118, 146], [6, 30, 54, 78, 102, 126, 150], [6, 24, 50, 76, 102, 128, 154], [6, 28, 54, 80, 106, 132, 158], [6, 32, 58, 84, 110, 136, 162], [6, 26, 54, 82, 110, 138, 166], [6, 30, 58, 86, 114, 142, 170]], G15: 1 << 10 | 1 << 8 | 1 << 5 | 1 << 4 | 1 << 2 | 1 << 1 | 1 << 0, G18: 1 << 12 | 1 << 11 | 1 << 10 | 1 << 9 | 1 << 8 | 1 << 5 | 1 << 2 | 1 << 0, G15_MASK: 1 << 14 | 1 << 12 | 1 << 10 | 1 << 4 | 1 << 1, getBCHTypeInfo: function (t) { for (var e = t << 10; f.getBCHDigit(e) - f.getBCHDigit(f.G15) >= 0;)e ^= f.G15 << f.getBCHDigit(e) - f.getBCHDigit(f.G15); return (t << 10 | e) ^ f.G15_MASK }, getBCHTypeNumber: function (t) { for (var e = t << 12; f.getBCHDigit(e) - f.getBCHDigit(f.G18) >= 0;)e ^= f.G18 << f.getBCHDigit(e) - f.getBCHDigit(f.G18); return t << 12 | e }, getBCHDigit: function (t) { for (var e = 0; 0 != t;)e++, t >>>= 1; return e }, getPatternPosition: function (t) { return f.PATTERN_POSITION_TABLE[t - 1] }, getMask: function (t, e, r) { switch (t) { case o: return (e + r) % 2 == 0; case i: return e % 2 == 0; case s: return r % 3 == 0; case u: return (e + r) % 3 == 0; case a: return (Math.floor(e / 2) + Math.floor(r / 3)) % 2 == 0; case h: return e * r % 2 + e * r % 3 == 0; case l: return (e * r % 2 + e * r % 3) % 2 == 0; case g: return (e * r % 3 + (e + r) % 2) % 2 == 0; default: throw new Error("bad maskPattern:" + t) } }, getErrorCorrectPolynomial: function (t) { for (var e = new d([1], 0), r = 0; r < t; r++)e = e.multiply(new d([1, c.gexp(r)], 0)); return e }, getLengthInBits: function (t, e) { if (1 <= e && e < 10) switch (t) { case r.MODE_NUMBER: return 10; case r.MODE_ALPHA_NUM: return 9; case r.MODE_8BIT_BYTE: case r.MODE_KANJI: return 8; default: throw new Error("mode:" + t) } else if (e < 27) switch (t) { case r.MODE_NUMBER: return 12; case r.MODE_ALPHA_NUM: return 11; case r.MODE_8BIT_BYTE: return 16; case r.MODE_KANJI: return 10; default: throw new Error("mode:" + t) } else { if (!(e < 41)) throw new Error("type:" + e); switch (t) { case r.MODE_NUMBER: return 14; case r.MODE_ALPHA_NUM: return 13; case r.MODE_8BIT_BYTE: return 16; case r.MODE_KANJI: return 12; default: throw new Error("mode:" + t) } } }, getLostPoint: function (t) { for (var e = t.getModuleCount(), r = 0, n = 0; n < e; n++)for (var o = 0; o < e; o++) { for (var i = 0, s = t.isDark(n, o), u = -1; u <= 1; u++)if (!(n + u < 0 || e <= n + u)) for (var a = -1; a <= 1; a++)o + a < 0 || e <= o + a || 0 == u && 0 == a || s == t.isDark(n + u, o + a) && i++; i > 5 && (r += 3 + i - 5) } for (n = 0; n < e - 1; n++)for (o = 0; o < e - 1; o++) { var h = 0; t.isDark(n, o) && h++, t.isDark(n + 1, o) && h++, t.isDark(n, o + 1) && h++, t.isDark(n + 1, o + 1) && h++, 0 != h && 4 != h || (r += 3) } for (n = 0; n < e; n++)for (o = 0; o < e - 6; o++)t.isDark(n, o) && !t.isDark(n, o + 1) && t.isDark(n, o + 2) && t.isDark(n, o + 3) && t.isDark(n, o + 4) && !t.isDark(n, o + 5) && t.isDark(n, o + 6) && (r += 40); for (o = 0; o < e; o++)for (n = 0; n < e - 6; n++)t.isDark(n, o) && !t.isDark(n + 1, o) && t.isDark(n + 2, o) && t.isDark(n + 3, o) && t.isDark(n + 4, o) && !t.isDark(n + 5, o) && t.isDark(n + 6, o) && (r += 40); var l = 0; for (o = 0; o < e; o++)for (n = 0; n < e; n++)t.isDark(n, o) && l++; return r += 10 * (Math.abs(100 * l / e / e - 50) / 5) } }, c = { glog: function (t) { if (t < 1) throw new Error("glog(" + t + ")"); return c.LOG_TABLE[t] }, gexp: function (t) { for (; t < 0;)t += 255; for (; t >= 256;)t -= 255; return c.EXP_TABLE[t] }, EXP_TABLE: new Array(256), LOG_TABLE: new Array(256) }, m = 0; m < 8; m++)c.EXP_TABLE[m] = 1 << m; for (m = 8; m < 256; m++)c.EXP_TABLE[m] = c.EXP_TABLE[m - 4] ^ c.EXP_TABLE[m - 5] ^ c.EXP_TABLE[m - 6] ^ c.EXP_TABLE[m - 8]; for (m = 0; m < 255; m++)c.LOG_TABLE[c.EXP_TABLE[m]] = m; function d(t, e) { if (void 0 == t.length) throw new Error(t.length + "/" + e); for (var r = 0; r < t.length && 0 == t[r];)r++; this.num = new Array(t.length - r + e); for (var n = 0; n < t.length - r; n++)this.num[n] = t[n + r] } function v(t, e) { this.totalCount = t, this.dataCount = e } function B() { this.buffer = new Array, this.length = 0 } return d.prototype = { get: function (t) { return this.num[t] }, getLength: function () { return this.num.length }, multiply: function (t) { for (var e = new Array(this.getLength() + t.getLength() - 1), r = 0; r < this.getLength(); r++)for (var n = 0; n < t.getLength(); n++)e[r + n] ^= c.gexp(c.glog(this.get(r)) + c.glog(t.get(n))); return new d(e, 0) }, mod: function (t) { if (this.getLength() - t.getLength() < 0) return this; for (var e = c.glog(this.get(0)) - c.glog(t.get(0)), r = new Array(this.getLength()), n = 0; n < this.getLength(); n++)r[n] = this.get(n); for (n = 0; n < t.getLength(); n++)r[n] ^= c.gexp(c.glog(t.get(n)) + e); return new d(r, 0).mod(t) } }, v.RS_BLOCK_TABLE = [[1, 26, 19], [1, 26, 16], [1, 26, 13], [1, 26, 9], [1, 44, 34], [1, 44, 28], [1, 44, 22], [1, 44, 16], [1, 70, 55], [1, 70, 44], [2, 35, 17], [2, 35, 13], [1, 100, 80], [2, 50, 32], [2, 50, 24], [4, 25, 9], [1, 134, 108], [2, 67, 43], [2, 33, 15, 2, 34, 16], [2, 33, 11, 2, 34, 12], [2, 86, 68], [4, 43, 27], [4, 43, 19], [4, 43, 15], [2, 98, 78], [4, 49, 31], [2, 32, 14, 4, 33, 15], [4, 39, 13, 1, 40, 14], [2, 121, 97], [2, 60, 38, 2, 61, 39], [4, 40, 18, 2, 41, 19], [4, 40, 14, 2, 41, 15], [2, 146, 116], [3, 58, 36, 2, 59, 37], [4, 36, 16, 4, 37, 17], [4, 36, 12, 4, 37, 13], [2, 86, 68, 2, 87, 69], [4, 69, 43, 1, 70, 44], [6, 43, 19, 2, 44, 20], [6, 43, 15, 2, 44, 16], [4, 101, 81], [1, 80, 50, 4, 81, 51], [4, 50, 22, 4, 51, 23], [3, 36, 12, 8, 37, 13], [2, 116, 92, 2, 117, 93], [6, 58, 36, 2, 59, 37], [4, 46, 20, 6, 47, 21], [7, 42, 14, 4, 43, 15], [4, 133, 107], [8, 59, 37, 1, 60, 38], [8, 44, 20, 4, 45, 21], [12, 33, 11, 4, 34, 12], [3, 145, 115, 1, 146, 116], [4, 64, 40, 5, 65, 41], [11, 36, 16, 5, 37, 17], [11, 36, 12, 5, 37, 13], [5, 109, 87, 1, 110, 88], [5, 65, 41, 5, 66, 42], [5, 54, 24, 7, 55, 25], [11, 36, 12], [5, 122, 98, 1, 123, 99], [7, 73, 45, 3, 74, 46], [15, 43, 19, 2, 44, 20], [3, 45, 15, 13, 46, 16], [1, 135, 107, 5, 136, 108], [10, 74, 46, 1, 75, 47], [1, 50, 22, 15, 51, 23], [2, 42, 14, 17, 43, 15], [5, 150, 120, 1, 151, 121], [9, 69, 43, 4, 70, 44], [17, 50, 22, 1, 51, 23], [2, 42, 14, 19, 43, 15], [3, 141, 113, 4, 142, 114], [3, 70, 44, 11, 71, 45], [17, 47, 21, 4, 48, 22], [9, 39, 13, 16, 40, 14], [3, 135, 107, 5, 136, 108], [3, 67, 41, 13, 68, 42], [15, 54, 24, 5, 55, 25], [15, 43, 15, 10, 44, 16], [4, 144, 116, 4, 145, 117], [17, 68, 42], [17, 50, 22, 6, 51, 23], [19, 46, 16, 6, 47, 17], [2, 139, 111, 7, 140, 112], [17, 74, 46], [7, 54, 24, 16, 55, 25], [34, 37, 13], [4, 151, 121, 5, 152, 122], [4, 75, 47, 14, 76, 48], [11, 54, 24, 14, 55, 25], [16, 45, 15, 14, 46, 16], [6, 147, 117, 4, 148, 118], [6, 73, 45, 14, 74, 46], [11, 54, 24, 16, 55, 25], [30, 46, 16, 2, 47, 17], [8, 132, 106, 4, 133, 107], [8, 75, 47, 13, 76, 48], [7, 54, 24, 22, 55, 25], [22, 45, 15, 13, 46, 16], [10, 142, 114, 2, 143, 115], [19, 74, 46, 4, 75, 47], [28, 50, 22, 6, 51, 23], [33, 46, 16, 4, 47, 17], [8, 152, 122, 4, 153, 123], [22, 73, 45, 3, 74, 46], [8, 53, 23, 26, 54, 24], [12, 45, 15, 28, 46, 16], [3, 147, 117, 10, 148, 118], [3, 73, 45, 23, 74, 46], [4, 54, 24, 31, 55, 25], [11, 45, 15, 31, 46, 16], [7, 146, 116, 7, 147, 117], [21, 73, 45, 7, 74, 46], [1, 53, 23, 37, 54, 24], [19, 45, 15, 26, 46, 16], [5, 145, 115, 10, 146, 116], [19, 75, 47, 10, 76, 48], [15, 54, 24, 25, 55, 25], [23, 45, 15, 25, 46, 16], [13, 145, 115, 3, 146, 116], [2, 74, 46, 29, 75, 47], [42, 54, 24, 1, 55, 25], [23, 45, 15, 28, 46, 16], [17, 145, 115], [10, 74, 46, 23, 75, 47], [10, 54, 24, 35, 55, 25], [19, 45, 15, 35, 46, 16], [17, 145, 115, 1, 146, 116], [14, 74, 46, 21, 75, 47], [29, 54, 24, 19, 55, 25], [11, 45, 15, 46, 46, 16], [13, 145, 115, 6, 146, 116], [14, 74, 46, 23, 75, 47], [44, 54, 24, 7, 55, 25], [59, 46, 16, 1, 47, 17], [12, 151, 121, 7, 152, 122], [12, 75, 47, 26, 76, 48], [39, 54, 24, 14, 55, 25], [22, 45, 15, 41, 46, 16], [6, 151, 121, 14, 152, 122], [6, 75, 47, 34, 76, 48], [46, 54, 24, 10, 55, 25], [2, 45, 15, 64, 46, 16], [17, 152, 122, 4, 153, 123], [29, 74, 46, 14, 75, 47], [49, 54, 24, 10, 55, 25], [24, 45, 15, 46, 46, 16], [4, 152, 122, 18, 153, 123], [13, 74, 46, 32, 75, 47], [48, 54, 24, 14, 55, 25], [42, 45, 15, 32, 46, 16], [20, 147, 117, 4, 148, 118], [40, 75, 47, 7, 76, 48], [43, 54, 24, 22, 55, 25], [10, 45, 15, 67, 46, 16], [19, 148, 118, 6, 149, 119], [18, 75, 47, 31, 76, 48], [34, 54, 24, 34, 55, 25], [20, 45, 15, 61, 46, 16]], v.getRSBlocks = function (t, e) { var r = v.getRsBlockTable(t, e); if (void 0 == r) throw new Error("bad rs block @ typeNumber:" + t + "/errorCorrectLevel:" + e); for (var n = r.length / 3, o = new Array, i = 0; i < n; i++)for (var s = r[3 * i + 0], u = r[3 * i + 1], a = r[3 * i + 2], h = 0; h < s; h++)o.push(new v(u, a)); return o }, v.getRsBlockTable = function (t, e) { switch (e) { case n.L: return v.RS_BLOCK_TABLE[4 * (t - 1) + 0]; case n.M: return v.RS_BLOCK_TABLE[4 * (t - 1) + 1]; case n.Q: return v.RS_BLOCK_TABLE[4 * (t - 1) + 2]; case n.H: return v.RS_BLOCK_TABLE[4 * (t - 1) + 3]; default: return } }, B.prototype = { get: function (t) { var e = Math.floor(t / 8); return 1 == (this.buffer[e] >>> 7 - t % 8 & 1) }, put: function (t, e) { for (var r = 0; r < e; r++)this.putBit(1 == (t >>> e - r - 1 & 1)) }, getLengthInBits: function () { return this.length }, putBit: function (t) { var e = Math.floor(this.length / 8); this.buffer.length <= e && this.buffer.push(0), t && (this.buffer[e] |= 128 >>> this.length % 8), this.length++ } }, e })();

/**
 * 二维码绘制参数
 */
export interface QRCodeOptions {
    /**
     * 绘制的Graphics组件
     */
    graphic: cc.Graphics,
    /**
     * 绘制的文本
     */
    text: string,
    /**
     * 二维码的宽度
     */
    width: number,
    /**
     * 二维码的高度
     */
    height: number,
    /**
     * 前景色
     */
    foreground?: cc.Color,
    /**
     * 背景色
     */
    background?: cc.Color,
    /**
     * 内边距
     */
    boderWidth?: number,
    /**
     * icon
     */
    icon?: cc.SpriteFrame,
    /**
     * 样式
     */
    style?: number,
}

/**
 * 二维码样式
 */
export const QRCodeStyle = cc.Enum({
    /**
     * 默认样式
     */
    Default: 0,
    /**
     * 圆形样式
     */
    Circle: 1,
});

@ccclass
@executeInEditMode
export class QRCode extends cc.Component {

    @property({ tooltip: "二维码内容" })
    private String = "二维码内容";

    get string(): string {
        return this.String;
    }

    set string(value) {
        this.String = value;
    }

    @property({ type: cc.SpriteFrame, tooltip: "中间显示的icon" })
    private Icon: cc.SpriteFrame = null;

    get icon(): cc.SpriteFrame {
        return this.Icon;
    }

    set icon(value: cc.SpriteFrame) {
        this.Icon = value;
    }

    @property({ tooltip: "背景色" })
    private Background: cc.Color = cc.Color.WHITE;

    get background(): cc.Color {
        return this.Background;
    }

    set background(value: cc.Color) {
        this.Background = value;
    }

    @property({ tooltip: "前景色" })
    private Foreground: cc.Color = cc.Color.BLACK;

    get foreground(): cc.Color {
        return this.Foreground;
    }

    set foreground(value: cc.Color) {
        this.Foreground = value;
    }

    @property({ type: cc.Integer, tooltip: "二维码外边距" })
    private BorderWidth = 0;

    get borderWidth(): number {
        return this.BorderWidth;
    }

    set borderWidth(value: number) {
        this.BorderWidth = value;
    }

    @property({ type: QRCodeStyle, tooltip: "二维码样式" })
    private Style: number = QRCodeStyle.Default;

    get style(): number {
        return this.Style;
    }

    set style(value: number) {
        this.Style = value;
    }

    /**
     * 上一次的二维码参数
     */
    private _lastOptions: QRCodeOptions = null;
    /**
     * Graphics组件
     */
    private _graphics: cc.Graphics = null;
    /**
     * 宽度
     */
    private _width: number = 0;
    /**
     * 高度
     */
    private _height: number = 0;

    /**
     * 初始化Graphics组件
     */
    private initGraphics() {
        this._width = this.node.width;
        this._height = this.node.height;
        this.Background = this.Background || cc.Color.WHITE;
        this.Foreground = this.Foreground || cc.Color.BLACK;
        if (!this._graphics) {
            this._graphics = this.getComponent(cc.Graphics) || this.addComponent(cc.Graphics);
        }
    }

    /**
     * 绘制二维码
     * @param options QRCodeOptions 
     */
    public drawQRCode(options: QRCodeOptions): void {
        options.boderWidth = options.boderWidth || 0;
        options.style = options.style || QRCodeStyle.Default;
        options.background = options.background || cc.Color.WHITE;
        options.foreground = options.foreground || cc.Color.BLACK;

        options.graphic.clear();
        options.graphic.fillColor = options.background;
        options.graphic.rect(-options.width / 2, -options.height / 2, options.width, options.height);
        options.graphic.fill();

        const qrcWidth = options.width - options.boderWidth * 2;
        const qrcHeight = options.height - options.boderWidth * 2;

        options.graphic.fillColor = options.foreground;

        const qrc = new QRCodePlugin(-1, QRCodePlugin.QRErrorCorrectLevel.H);
        const qrcText = eval('\'' + encodeURI(options.text).replace(/%/gm, '\\x') + '\'');
        qrc.addData(qrcText);
        qrc.make();
        const count = qrc.getModuleCount();
        const tileWidth = qrcWidth / count;
        const tileHeight = qrcHeight / count;
        for (let row = 0; row < count; row++) {
            for (let col = 0; col < count; col++) {
                if (qrc.isDark(row, col)) {
                    let w = (Math.ceil((col + 1) * tileWidth) - Math.floor(col * tileWidth));
                    let h = (Math.ceil((row + 1) * tileWidth) - Math.floor(row * tileWidth));
                    if (options.style != QRCodeStyle.Circle) {
                        options.graphic.fillRect(Math.round(col * tileWidth) - options.width / 2 + options.boderWidth, Math.round(row * tileHeight) - options.height / 2 + options.boderWidth, w, h);
                    } else {
                        options.graphic.roundRect(Math.round(col * tileWidth) - options.width / 2 + options.boderWidth, Math.round(row * tileHeight) - options.height / 2 + options.boderWidth, w, h, tileWidth / 2);
                        options.graphic.fill();
                    }
                }
            }
        }

        let iconNode = this.node.getChildByName("icon");
        if (options.icon) {
            if (iconNode == null) {
                iconNode = new cc.Node("icon");
            }
            iconNode.setContentSize(new cc.Size(qrcWidth / 5, qrcHeight / 5));
            let sprite = iconNode.getComponent(cc.Sprite) || iconNode.addComponent(cc.Sprite);
            sprite.spriteFrame = options.icon;
            sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
            iconNode.parent = this.node;
        } else {
            if (iconNode != null) {
                iconNode.removeFromParent();
                iconNode.destroy();
            }
        }
    }
    public clearQRCode() {
        if (this._graphics) {
            this._graphics.clear();
            let icon = this.node.getChildByName("icon");
            if (cc.isValid(icon)) {
                icon.removeFromParent();
                icon.destroy();
            }
        }
    }
    /**
     * 二维码样式是否有变化 
     * @param options QRCodeOptions
     * @returns 
     */
    private hasChanged(options): boolean {
        const lastOptions = this._lastOptions;
        // console.error("lastOptions:", lastOptions);
        if (!lastOptions) {
            return true;
        }

        // console.log("options.text != lastOptions.text:", options.text != lastOptions.text);
        // console.log("options.width != lastOptions.width:", options.width != lastOptions.width);
        // console.log("options.height != lastOptions.height:", options.height != lastOptions.height);
        // console.log("options.padding != lastOptions.boderWidth:", options.padding != lastOptions.boderWidth);
        // console.log("options.background != lastOptions.background:", options.background != lastOptions.background);
        // console.log("options.foreground != lastOptions.foreground:", options.foreground != lastOptions.foreground);
        // console.log("options.icon != lastOptions.icon:", options.icon != lastOptions.icon);
        // console.log("options.style != lastOptions.style:", options.style != lastOptions.style);
        // console.log("=============================================================================")

        return options.text != lastOptions.text || options.width != lastOptions.width || options.height != lastOptions.height || options.padding != lastOptions.boderWidth
            || options.background != lastOptions.background || options.foreground != lastOptions.foreground || options.icon != lastOptions.icon || options.style != lastOptions.style;
    }
    /**
     * 刷新二维码
     * @param dt 
     * @returns 
     */
    protected update(dt: number): void {
        this.initGraphics();

        if (!this._graphics) {
            return;
        }

        if (!this.String || this.String == "") {
            this.clearQRCode();
            return;
        }

        const options: QRCodeOptions = {
            text: this.String,
            graphic: this._graphics,
            width: this._width,
            height: this._height,
            background: this.Background,
            foreground: this.Foreground,
            boderWidth: this.BorderWidth,
            icon: this.Icon,
            style: this.Style,
        }
        if (!this.hasChanged(options)) {
            return;
        }
        this.drawQRCode(options);
        this._lastOptions = options;
    }
}