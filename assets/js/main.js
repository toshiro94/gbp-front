(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
//! moment.js

;(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    global.moment = factory()
}(this, (function () { 'use strict';

    var hookCallback;

    function hooks () {
        return hookCallback.apply(null, arguments);
    }

    // This is done to register the method called with moment()
    // without creating circular dependencies.
    function setHookCallback (callback) {
        hookCallback = callback;
    }

    function isArray(input) {
        return input instanceof Array || Object.prototype.toString.call(input) === '[object Array]';
    }

    function isObject(input) {
        // IE8 will treat undefined and null as object if it wasn't for
        // input != null
        return input != null && Object.prototype.toString.call(input) === '[object Object]';
    }

    function isObjectEmpty(obj) {
        if (Object.getOwnPropertyNames) {
            return (Object.getOwnPropertyNames(obj).length === 0);
        } else {
            var k;
            for (k in obj) {
                if (obj.hasOwnProperty(k)) {
                    return false;
                }
            }
            return true;
        }
    }

    function isUndefined(input) {
        return input === void 0;
    }

    function isNumber(input) {
        return typeof input === 'number' || Object.prototype.toString.call(input) === '[object Number]';
    }

    function isDate(input) {
        return input instanceof Date || Object.prototype.toString.call(input) === '[object Date]';
    }

    function map(arr, fn) {
        var res = [], i;
        for (i = 0; i < arr.length; ++i) {
            res.push(fn(arr[i], i));
        }
        return res;
    }

    function hasOwnProp(a, b) {
        return Object.prototype.hasOwnProperty.call(a, b);
    }

    function extend(a, b) {
        for (var i in b) {
            if (hasOwnProp(b, i)) {
                a[i] = b[i];
            }
        }

        if (hasOwnProp(b, 'toString')) {
            a.toString = b.toString;
        }

        if (hasOwnProp(b, 'valueOf')) {
            a.valueOf = b.valueOf;
        }

        return a;
    }

    function createUTC (input, format, locale, strict) {
        return createLocalOrUTC(input, format, locale, strict, true).utc();
    }

    function defaultParsingFlags() {
        // We need to deep clone this object.
        return {
            empty           : false,
            unusedTokens    : [],
            unusedInput     : [],
            overflow        : -2,
            charsLeftOver   : 0,
            nullInput       : false,
            invalidMonth    : null,
            invalidFormat   : false,
            userInvalidated : false,
            iso             : false,
            parsedDateParts : [],
            meridiem        : null,
            rfc2822         : false,
            weekdayMismatch : false
        };
    }

    function getParsingFlags(m) {
        if (m._pf == null) {
            m._pf = defaultParsingFlags();
        }
        return m._pf;
    }

    var some;
    if (Array.prototype.some) {
        some = Array.prototype.some;
    } else {
        some = function (fun) {
            var t = Object(this);
            var len = t.length >>> 0;

            for (var i = 0; i < len; i++) {
                if (i in t && fun.call(this, t[i], i, t)) {
                    return true;
                }
            }

            return false;
        };
    }

    function isValid(m) {
        if (m._isValid == null) {
            var flags = getParsingFlags(m);
            var parsedParts = some.call(flags.parsedDateParts, function (i) {
                return i != null;
            });
            var isNowValid = !isNaN(m._d.getTime()) &&
                flags.overflow < 0 &&
                !flags.empty &&
                !flags.invalidMonth &&
                !flags.invalidWeekday &&
                !flags.weekdayMismatch &&
                !flags.nullInput &&
                !flags.invalidFormat &&
                !flags.userInvalidated &&
                (!flags.meridiem || (flags.meridiem && parsedParts));

            if (m._strict) {
                isNowValid = isNowValid &&
                    flags.charsLeftOver === 0 &&
                    flags.unusedTokens.length === 0 &&
                    flags.bigHour === undefined;
            }

            if (Object.isFrozen == null || !Object.isFrozen(m)) {
                m._isValid = isNowValid;
            }
            else {
                return isNowValid;
            }
        }
        return m._isValid;
    }

    function createInvalid (flags) {
        var m = createUTC(NaN);
        if (flags != null) {
            extend(getParsingFlags(m), flags);
        }
        else {
            getParsingFlags(m).userInvalidated = true;
        }

        return m;
    }

    // Plugins that add properties should also add the key here (null value),
    // so we can properly clone ourselves.
    var momentProperties = hooks.momentProperties = [];

    function copyConfig(to, from) {
        var i, prop, val;

        if (!isUndefined(from._isAMomentObject)) {
            to._isAMomentObject = from._isAMomentObject;
        }
        if (!isUndefined(from._i)) {
            to._i = from._i;
        }
        if (!isUndefined(from._f)) {
            to._f = from._f;
        }
        if (!isUndefined(from._l)) {
            to._l = from._l;
        }
        if (!isUndefined(from._strict)) {
            to._strict = from._strict;
        }
        if (!isUndefined(from._tzm)) {
            to._tzm = from._tzm;
        }
        if (!isUndefined(from._isUTC)) {
            to._isUTC = from._isUTC;
        }
        if (!isUndefined(from._offset)) {
            to._offset = from._offset;
        }
        if (!isUndefined(from._pf)) {
            to._pf = getParsingFlags(from);
        }
        if (!isUndefined(from._locale)) {
            to._locale = from._locale;
        }

        if (momentProperties.length > 0) {
            for (i = 0; i < momentProperties.length; i++) {
                prop = momentProperties[i];
                val = from[prop];
                if (!isUndefined(val)) {
                    to[prop] = val;
                }
            }
        }

        return to;
    }

    var updateInProgress = false;

    // Moment prototype object
    function Moment(config) {
        copyConfig(this, config);
        this._d = new Date(config._d != null ? config._d.getTime() : NaN);
        if (!this.isValid()) {
            this._d = new Date(NaN);
        }
        // Prevent infinite loop in case updateOffset creates new moment
        // objects.
        if (updateInProgress === false) {
            updateInProgress = true;
            hooks.updateOffset(this);
            updateInProgress = false;
        }
    }

    function isMoment (obj) {
        return obj instanceof Moment || (obj != null && obj._isAMomentObject != null);
    }

    function absFloor (number) {
        if (number < 0) {
            // -0 -> 0
            return Math.ceil(number) || 0;
        } else {
            return Math.floor(number);
        }
    }

    function toInt(argumentForCoercion) {
        var coercedNumber = +argumentForCoercion,
            value = 0;

        if (coercedNumber !== 0 && isFinite(coercedNumber)) {
            value = absFloor(coercedNumber);
        }

        return value;
    }

    // compare two arrays, return the number of differences
    function compareArrays(array1, array2, dontConvert) {
        var len = Math.min(array1.length, array2.length),
            lengthDiff = Math.abs(array1.length - array2.length),
            diffs = 0,
            i;
        for (i = 0; i < len; i++) {
            if ((dontConvert && array1[i] !== array2[i]) ||
                (!dontConvert && toInt(array1[i]) !== toInt(array2[i]))) {
                diffs++;
            }
        }
        return diffs + lengthDiff;
    }

    function warn(msg) {
        if (hooks.suppressDeprecationWarnings === false &&
                (typeof console !==  'undefined') && console.warn) {
            console.warn('Deprecation warning: ' + msg);
        }
    }

    function deprecate(msg, fn) {
        var firstTime = true;

        return extend(function () {
            if (hooks.deprecationHandler != null) {
                hooks.deprecationHandler(null, msg);
            }
            if (firstTime) {
                var args = [];
                var arg;
                for (var i = 0; i < arguments.length; i++) {
                    arg = '';
                    if (typeof arguments[i] === 'object') {
                        arg += '\n[' + i + '] ';
                        for (var key in arguments[0]) {
                            arg += key + ': ' + arguments[0][key] + ', ';
                        }
                        arg = arg.slice(0, -2); // Remove trailing comma and space
                    } else {
                        arg = arguments[i];
                    }
                    args.push(arg);
                }
                warn(msg + '\nArguments: ' + Array.prototype.slice.call(args).join('') + '\n' + (new Error()).stack);
                firstTime = false;
            }
            return fn.apply(this, arguments);
        }, fn);
    }

    var deprecations = {};

    function deprecateSimple(name, msg) {
        if (hooks.deprecationHandler != null) {
            hooks.deprecationHandler(name, msg);
        }
        if (!deprecations[name]) {
            warn(msg);
            deprecations[name] = true;
        }
    }

    hooks.suppressDeprecationWarnings = false;
    hooks.deprecationHandler = null;

    function isFunction(input) {
        return input instanceof Function || Object.prototype.toString.call(input) === '[object Function]';
    }

    function set (config) {
        var prop, i;
        for (i in config) {
            prop = config[i];
            if (isFunction(prop)) {
                this[i] = prop;
            } else {
                this['_' + i] = prop;
            }
        }
        this._config = config;
        // Lenient ordinal parsing accepts just a number in addition to
        // number + (possibly) stuff coming from _dayOfMonthOrdinalParse.
        // TODO: Remove "ordinalParse" fallback in next major release.
        this._dayOfMonthOrdinalParseLenient = new RegExp(
            (this._dayOfMonthOrdinalParse.source || this._ordinalParse.source) +
                '|' + (/\d{1,2}/).source);
    }

    function mergeConfigs(parentConfig, childConfig) {
        var res = extend({}, parentConfig), prop;
        for (prop in childConfig) {
            if (hasOwnProp(childConfig, prop)) {
                if (isObject(parentConfig[prop]) && isObject(childConfig[prop])) {
                    res[prop] = {};
                    extend(res[prop], parentConfig[prop]);
                    extend(res[prop], childConfig[prop]);
                } else if (childConfig[prop] != null) {
                    res[prop] = childConfig[prop];
                } else {
                    delete res[prop];
                }
            }
        }
        for (prop in parentConfig) {
            if (hasOwnProp(parentConfig, prop) &&
                    !hasOwnProp(childConfig, prop) &&
                    isObject(parentConfig[prop])) {
                // make sure changes to properties don't modify parent config
                res[prop] = extend({}, res[prop]);
            }
        }
        return res;
    }

    function Locale(config) {
        if (config != null) {
            this.set(config);
        }
    }

    var keys;

    if (Object.keys) {
        keys = Object.keys;
    } else {
        keys = function (obj) {
            var i, res = [];
            for (i in obj) {
                if (hasOwnProp(obj, i)) {
                    res.push(i);
                }
            }
            return res;
        };
    }

    var defaultCalendar = {
        sameDay : '[Today at] LT',
        nextDay : '[Tomorrow at] LT',
        nextWeek : 'dddd [at] LT',
        lastDay : '[Yesterday at] LT',
        lastWeek : '[Last] dddd [at] LT',
        sameElse : 'L'
    };

    function calendar (key, mom, now) {
        var output = this._calendar[key] || this._calendar['sameElse'];
        return isFunction(output) ? output.call(mom, now) : output;
    }

    var defaultLongDateFormat = {
        LTS  : 'h:mm:ss A',
        LT   : 'h:mm A',
        L    : 'MM/DD/YYYY',
        LL   : 'MMMM D, YYYY',
        LLL  : 'MMMM D, YYYY h:mm A',
        LLLL : 'dddd, MMMM D, YYYY h:mm A'
    };

    function longDateFormat (key) {
        var format = this._longDateFormat[key],
            formatUpper = this._longDateFormat[key.toUpperCase()];

        if (format || !formatUpper) {
            return format;
        }

        this._longDateFormat[key] = formatUpper.replace(/MMMM|MM|DD|dddd/g, function (val) {
            return val.slice(1);
        });

        return this._longDateFormat[key];
    }

    var defaultInvalidDate = 'Invalid date';

    function invalidDate () {
        return this._invalidDate;
    }

    var defaultOrdinal = '%d';
    var defaultDayOfMonthOrdinalParse = /\d{1,2}/;

    function ordinal (number) {
        return this._ordinal.replace('%d', number);
    }

    var defaultRelativeTime = {
        future : 'in %s',
        past   : '%s ago',
        s  : 'a few seconds',
        ss : '%d seconds',
        m  : 'a minute',
        mm : '%d minutes',
        h  : 'an hour',
        hh : '%d hours',
        d  : 'a day',
        dd : '%d days',
        M  : 'a month',
        MM : '%d months',
        y  : 'a year',
        yy : '%d years'
    };

    function relativeTime (number, withoutSuffix, string, isFuture) {
        var output = this._relativeTime[string];
        return (isFunction(output)) ?
            output(number, withoutSuffix, string, isFuture) :
            output.replace(/%d/i, number);
    }

    function pastFuture (diff, output) {
        var format = this._relativeTime[diff > 0 ? 'future' : 'past'];
        return isFunction(format) ? format(output) : format.replace(/%s/i, output);
    }

    var aliases = {};

    function addUnitAlias (unit, shorthand) {
        var lowerCase = unit.toLowerCase();
        aliases[lowerCase] = aliases[lowerCase + 's'] = aliases[shorthand] = unit;
    }

    function normalizeUnits(units) {
        return typeof units === 'string' ? aliases[units] || aliases[units.toLowerCase()] : undefined;
    }

    function normalizeObjectUnits(inputObject) {
        var normalizedInput = {},
            normalizedProp,
            prop;

        for (prop in inputObject) {
            if (hasOwnProp(inputObject, prop)) {
                normalizedProp = normalizeUnits(prop);
                if (normalizedProp) {
                    normalizedInput[normalizedProp] = inputObject[prop];
                }
            }
        }

        return normalizedInput;
    }

    var priorities = {};

    function addUnitPriority(unit, priority) {
        priorities[unit] = priority;
    }

    function getPrioritizedUnits(unitsObj) {
        var units = [];
        for (var u in unitsObj) {
            units.push({unit: u, priority: priorities[u]});
        }
        units.sort(function (a, b) {
            return a.priority - b.priority;
        });
        return units;
    }

    function zeroFill(number, targetLength, forceSign) {
        var absNumber = '' + Math.abs(number),
            zerosToFill = targetLength - absNumber.length,
            sign = number >= 0;
        return (sign ? (forceSign ? '+' : '') : '-') +
            Math.pow(10, Math.max(0, zerosToFill)).toString().substr(1) + absNumber;
    }

    var formattingTokens = /(\[[^\[]*\])|(\\)?([Hh]mm(ss)?|Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Qo?|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|kk?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g;

    var localFormattingTokens = /(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g;

    var formatFunctions = {};

    var formatTokenFunctions = {};

    // token:    'M'
    // padded:   ['MM', 2]
    // ordinal:  'Mo'
    // callback: function () { this.month() + 1 }
    function addFormatToken (token, padded, ordinal, callback) {
        var func = callback;
        if (typeof callback === 'string') {
            func = function () {
                return this[callback]();
            };
        }
        if (token) {
            formatTokenFunctions[token] = func;
        }
        if (padded) {
            formatTokenFunctions[padded[0]] = function () {
                return zeroFill(func.apply(this, arguments), padded[1], padded[2]);
            };
        }
        if (ordinal) {
            formatTokenFunctions[ordinal] = function () {
                return this.localeData().ordinal(func.apply(this, arguments), token);
            };
        }
    }

    function removeFormattingTokens(input) {
        if (input.match(/\[[\s\S]/)) {
            return input.replace(/^\[|\]$/g, '');
        }
        return input.replace(/\\/g, '');
    }

    function makeFormatFunction(format) {
        var array = format.match(formattingTokens), i, length;

        for (i = 0, length = array.length; i < length; i++) {
            if (formatTokenFunctions[array[i]]) {
                array[i] = formatTokenFunctions[array[i]];
            } else {
                array[i] = removeFormattingTokens(array[i]);
            }
        }

        return function (mom) {
            var output = '', i;
            for (i = 0; i < length; i++) {
                output += isFunction(array[i]) ? array[i].call(mom, format) : array[i];
            }
            return output;
        };
    }

    // format date using native date object
    function formatMoment(m, format) {
        if (!m.isValid()) {
            return m.localeData().invalidDate();
        }

        format = expandFormat(format, m.localeData());
        formatFunctions[format] = formatFunctions[format] || makeFormatFunction(format);

        return formatFunctions[format](m);
    }

    function expandFormat(format, locale) {
        var i = 5;

        function replaceLongDateFormatTokens(input) {
            return locale.longDateFormat(input) || input;
        }

        localFormattingTokens.lastIndex = 0;
        while (i >= 0 && localFormattingTokens.test(format)) {
            format = format.replace(localFormattingTokens, replaceLongDateFormatTokens);
            localFormattingTokens.lastIndex = 0;
            i -= 1;
        }

        return format;
    }

    var match1         = /\d/;            //       0 - 9
    var match2         = /\d\d/;          //      00 - 99
    var match3         = /\d{3}/;         //     000 - 999
    var match4         = /\d{4}/;         //    0000 - 9999
    var match6         = /[+-]?\d{6}/;    // -999999 - 999999
    var match1to2      = /\d\d?/;         //       0 - 99
    var match3to4      = /\d\d\d\d?/;     //     999 - 9999
    var match5to6      = /\d\d\d\d\d\d?/; //   99999 - 999999
    var match1to3      = /\d{1,3}/;       //       0 - 999
    var match1to4      = /\d{1,4}/;       //       0 - 9999
    var match1to6      = /[+-]?\d{1,6}/;  // -999999 - 999999

    var matchUnsigned  = /\d+/;           //       0 - inf
    var matchSigned    = /[+-]?\d+/;      //    -inf - inf

    var matchOffset    = /Z|[+-]\d\d:?\d\d/gi; // +00:00 -00:00 +0000 -0000 or Z
    var matchShortOffset = /Z|[+-]\d\d(?::?\d\d)?/gi; // +00 -00 +00:00 -00:00 +0000 -0000 or Z

    var matchTimestamp = /[+-]?\d+(\.\d{1,3})?/; // 123456789 123456789.123

    // any word (or two) characters or numbers including two/three word month in arabic.
    // includes scottish gaelic two word and hyphenated months
    var matchWord = /[0-9]{0,256}['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFF07\uFF10-\uFFEF]{1,256}|[\u0600-\u06FF\/]{1,256}(\s*?[\u0600-\u06FF]{1,256}){1,2}/i;

    var regexes = {};

    function addRegexToken (token, regex, strictRegex) {
        regexes[token] = isFunction(regex) ? regex : function (isStrict, localeData) {
            return (isStrict && strictRegex) ? strictRegex : regex;
        };
    }

    function getParseRegexForToken (token, config) {
        if (!hasOwnProp(regexes, token)) {
            return new RegExp(unescapeFormat(token));
        }

        return regexes[token](config._strict, config._locale);
    }

    // Code from http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
    function unescapeFormat(s) {
        return regexEscape(s.replace('\\', '').replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function (matched, p1, p2, p3, p4) {
            return p1 || p2 || p3 || p4;
        }));
    }

    function regexEscape(s) {
        return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    }

    var tokens = {};

    function addParseToken (token, callback) {
        var i, func = callback;
        if (typeof token === 'string') {
            token = [token];
        }
        if (isNumber(callback)) {
            func = function (input, array) {
                array[callback] = toInt(input);
            };
        }
        for (i = 0; i < token.length; i++) {
            tokens[token[i]] = func;
        }
    }

    function addWeekParseToken (token, callback) {
        addParseToken(token, function (input, array, config, token) {
            config._w = config._w || {};
            callback(input, config._w, config, token);
        });
    }

    function addTimeToArrayFromToken(token, input, config) {
        if (input != null && hasOwnProp(tokens, token)) {
            tokens[token](input, config._a, config, token);
        }
    }

    var YEAR = 0;
    var MONTH = 1;
    var DATE = 2;
    var HOUR = 3;
    var MINUTE = 4;
    var SECOND = 5;
    var MILLISECOND = 6;
    var WEEK = 7;
    var WEEKDAY = 8;

    // FORMATTING

    addFormatToken('Y', 0, 0, function () {
        var y = this.year();
        return y <= 9999 ? '' + y : '+' + y;
    });

    addFormatToken(0, ['YY', 2], 0, function () {
        return this.year() % 100;
    });

    addFormatToken(0, ['YYYY',   4],       0, 'year');
    addFormatToken(0, ['YYYYY',  5],       0, 'year');
    addFormatToken(0, ['YYYYYY', 6, true], 0, 'year');

    // ALIASES

    addUnitAlias('year', 'y');

    // PRIORITIES

    addUnitPriority('year', 1);

    // PARSING

    addRegexToken('Y',      matchSigned);
    addRegexToken('YY',     match1to2, match2);
    addRegexToken('YYYY',   match1to4, match4);
    addRegexToken('YYYYY',  match1to6, match6);
    addRegexToken('YYYYYY', match1to6, match6);

    addParseToken(['YYYYY', 'YYYYYY'], YEAR);
    addParseToken('YYYY', function (input, array) {
        array[YEAR] = input.length === 2 ? hooks.parseTwoDigitYear(input) : toInt(input);
    });
    addParseToken('YY', function (input, array) {
        array[YEAR] = hooks.parseTwoDigitYear(input);
    });
    addParseToken('Y', function (input, array) {
        array[YEAR] = parseInt(input, 10);
    });

    // HELPERS

    function daysInYear(year) {
        return isLeapYear(year) ? 366 : 365;
    }

    function isLeapYear(year) {
        return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    }

    // HOOKS

    hooks.parseTwoDigitYear = function (input) {
        return toInt(input) + (toInt(input) > 68 ? 1900 : 2000);
    };

    // MOMENTS

    var getSetYear = makeGetSet('FullYear', true);

    function getIsLeapYear () {
        return isLeapYear(this.year());
    }

    function makeGetSet (unit, keepTime) {
        return function (value) {
            if (value != null) {
                set$1(this, unit, value);
                hooks.updateOffset(this, keepTime);
                return this;
            } else {
                return get(this, unit);
            }
        };
    }

    function get (mom, unit) {
        return mom.isValid() ?
            mom._d['get' + (mom._isUTC ? 'UTC' : '') + unit]() : NaN;
    }

    function set$1 (mom, unit, value) {
        if (mom.isValid() && !isNaN(value)) {
            if (unit === 'FullYear' && isLeapYear(mom.year()) && mom.month() === 1 && mom.date() === 29) {
                mom._d['set' + (mom._isUTC ? 'UTC' : '') + unit](value, mom.month(), daysInMonth(value, mom.month()));
            }
            else {
                mom._d['set' + (mom._isUTC ? 'UTC' : '') + unit](value);
            }
        }
    }

    // MOMENTS

    function stringGet (units) {
        units = normalizeUnits(units);
        if (isFunction(this[units])) {
            return this[units]();
        }
        return this;
    }


    function stringSet (units, value) {
        if (typeof units === 'object') {
            units = normalizeObjectUnits(units);
            var prioritized = getPrioritizedUnits(units);
            for (var i = 0; i < prioritized.length; i++) {
                this[prioritized[i].unit](units[prioritized[i].unit]);
            }
        } else {
            units = normalizeUnits(units);
            if (isFunction(this[units])) {
                return this[units](value);
            }
        }
        return this;
    }

    function mod(n, x) {
        return ((n % x) + x) % x;
    }

    var indexOf;

    if (Array.prototype.indexOf) {
        indexOf = Array.prototype.indexOf;
    } else {
        indexOf = function (o) {
            // I know
            var i;
            for (i = 0; i < this.length; ++i) {
                if (this[i] === o) {
                    return i;
                }
            }
            return -1;
        };
    }

    function daysInMonth(year, month) {
        if (isNaN(year) || isNaN(month)) {
            return NaN;
        }
        var modMonth = mod(month, 12);
        year += (month - modMonth) / 12;
        return modMonth === 1 ? (isLeapYear(year) ? 29 : 28) : (31 - modMonth % 7 % 2);
    }

    // FORMATTING

    addFormatToken('M', ['MM', 2], 'Mo', function () {
        return this.month() + 1;
    });

    addFormatToken('MMM', 0, 0, function (format) {
        return this.localeData().monthsShort(this, format);
    });

    addFormatToken('MMMM', 0, 0, function (format) {
        return this.localeData().months(this, format);
    });

    // ALIASES

    addUnitAlias('month', 'M');

    // PRIORITY

    addUnitPriority('month', 8);

    // PARSING

    addRegexToken('M',    match1to2);
    addRegexToken('MM',   match1to2, match2);
    addRegexToken('MMM',  function (isStrict, locale) {
        return locale.monthsShortRegex(isStrict);
    });
    addRegexToken('MMMM', function (isStrict, locale) {
        return locale.monthsRegex(isStrict);
    });

    addParseToken(['M', 'MM'], function (input, array) {
        array[MONTH] = toInt(input) - 1;
    });

    addParseToken(['MMM', 'MMMM'], function (input, array, config, token) {
        var month = config._locale.monthsParse(input, token, config._strict);
        // if we didn't find a month name, mark the date as invalid.
        if (month != null) {
            array[MONTH] = month;
        } else {
            getParsingFlags(config).invalidMonth = input;
        }
    });

    // LOCALES

    var MONTHS_IN_FORMAT = /D[oD]?(\[[^\[\]]*\]|\s)+MMMM?/;
    var defaultLocaleMonths = 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_');
    function localeMonths (m, format) {
        if (!m) {
            return isArray(this._months) ? this._months :
                this._months['standalone'];
        }
        return isArray(this._months) ? this._months[m.month()] :
            this._months[(this._months.isFormat || MONTHS_IN_FORMAT).test(format) ? 'format' : 'standalone'][m.month()];
    }

    var defaultLocaleMonthsShort = 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_');
    function localeMonthsShort (m, format) {
        if (!m) {
            return isArray(this._monthsShort) ? this._monthsShort :
                this._monthsShort['standalone'];
        }
        return isArray(this._monthsShort) ? this._monthsShort[m.month()] :
            this._monthsShort[MONTHS_IN_FORMAT.test(format) ? 'format' : 'standalone'][m.month()];
    }

    function handleStrictParse(monthName, format, strict) {
        var i, ii, mom, llc = monthName.toLocaleLowerCase();
        if (!this._monthsParse) {
            // this is not used
            this._monthsParse = [];
            this._longMonthsParse = [];
            this._shortMonthsParse = [];
            for (i = 0; i < 12; ++i) {
                mom = createUTC([2000, i]);
                this._shortMonthsParse[i] = this.monthsShort(mom, '').toLocaleLowerCase();
                this._longMonthsParse[i] = this.months(mom, '').toLocaleLowerCase();
            }
        }

        if (strict) {
            if (format === 'MMM') {
                ii = indexOf.call(this._shortMonthsParse, llc);
                return ii !== -1 ? ii : null;
            } else {
                ii = indexOf.call(this._longMonthsParse, llc);
                return ii !== -1 ? ii : null;
            }
        } else {
            if (format === 'MMM') {
                ii = indexOf.call(this._shortMonthsParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._longMonthsParse, llc);
                return ii !== -1 ? ii : null;
            } else {
                ii = indexOf.call(this._longMonthsParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._shortMonthsParse, llc);
                return ii !== -1 ? ii : null;
            }
        }
    }

    function localeMonthsParse (monthName, format, strict) {
        var i, mom, regex;

        if (this._monthsParseExact) {
            return handleStrictParse.call(this, monthName, format, strict);
        }

        if (!this._monthsParse) {
            this._monthsParse = [];
            this._longMonthsParse = [];
            this._shortMonthsParse = [];
        }

        // TODO: add sorting
        // Sorting makes sure if one month (or abbr) is a prefix of another
        // see sorting in computeMonthsParse
        for (i = 0; i < 12; i++) {
            // make the regex if we don't have it already
            mom = createUTC([2000, i]);
            if (strict && !this._longMonthsParse[i]) {
                this._longMonthsParse[i] = new RegExp('^' + this.months(mom, '').replace('.', '') + '$', 'i');
                this._shortMonthsParse[i] = new RegExp('^' + this.monthsShort(mom, '').replace('.', '') + '$', 'i');
            }
            if (!strict && !this._monthsParse[i]) {
                regex = '^' + this.months(mom, '') + '|^' + this.monthsShort(mom, '');
                this._monthsParse[i] = new RegExp(regex.replace('.', ''), 'i');
            }
            // test the regex
            if (strict && format === 'MMMM' && this._longMonthsParse[i].test(monthName)) {
                return i;
            } else if (strict && format === 'MMM' && this._shortMonthsParse[i].test(monthName)) {
                return i;
            } else if (!strict && this._monthsParse[i].test(monthName)) {
                return i;
            }
        }
    }

    // MOMENTS

    function setMonth (mom, value) {
        var dayOfMonth;

        if (!mom.isValid()) {
            // No op
            return mom;
        }

        if (typeof value === 'string') {
            if (/^\d+$/.test(value)) {
                value = toInt(value);
            } else {
                value = mom.localeData().monthsParse(value);
                // TODO: Another silent failure?
                if (!isNumber(value)) {
                    return mom;
                }
            }
        }

        dayOfMonth = Math.min(mom.date(), daysInMonth(mom.year(), value));
        mom._d['set' + (mom._isUTC ? 'UTC' : '') + 'Month'](value, dayOfMonth);
        return mom;
    }

    function getSetMonth (value) {
        if (value != null) {
            setMonth(this, value);
            hooks.updateOffset(this, true);
            return this;
        } else {
            return get(this, 'Month');
        }
    }

    function getDaysInMonth () {
        return daysInMonth(this.year(), this.month());
    }

    var defaultMonthsShortRegex = matchWord;
    function monthsShortRegex (isStrict) {
        if (this._monthsParseExact) {
            if (!hasOwnProp(this, '_monthsRegex')) {
                computeMonthsParse.call(this);
            }
            if (isStrict) {
                return this._monthsShortStrictRegex;
            } else {
                return this._monthsShortRegex;
            }
        } else {
            if (!hasOwnProp(this, '_monthsShortRegex')) {
                this._monthsShortRegex = defaultMonthsShortRegex;
            }
            return this._monthsShortStrictRegex && isStrict ?
                this._monthsShortStrictRegex : this._monthsShortRegex;
        }
    }

    var defaultMonthsRegex = matchWord;
    function monthsRegex (isStrict) {
        if (this._monthsParseExact) {
            if (!hasOwnProp(this, '_monthsRegex')) {
                computeMonthsParse.call(this);
            }
            if (isStrict) {
                return this._monthsStrictRegex;
            } else {
                return this._monthsRegex;
            }
        } else {
            if (!hasOwnProp(this, '_monthsRegex')) {
                this._monthsRegex = defaultMonthsRegex;
            }
            return this._monthsStrictRegex && isStrict ?
                this._monthsStrictRegex : this._monthsRegex;
        }
    }

    function computeMonthsParse () {
        function cmpLenRev(a, b) {
            return b.length - a.length;
        }

        var shortPieces = [], longPieces = [], mixedPieces = [],
            i, mom;
        for (i = 0; i < 12; i++) {
            // make the regex if we don't have it already
            mom = createUTC([2000, i]);
            shortPieces.push(this.monthsShort(mom, ''));
            longPieces.push(this.months(mom, ''));
            mixedPieces.push(this.months(mom, ''));
            mixedPieces.push(this.monthsShort(mom, ''));
        }
        // Sorting makes sure if one month (or abbr) is a prefix of another it
        // will match the longer piece.
        shortPieces.sort(cmpLenRev);
        longPieces.sort(cmpLenRev);
        mixedPieces.sort(cmpLenRev);
        for (i = 0; i < 12; i++) {
            shortPieces[i] = regexEscape(shortPieces[i]);
            longPieces[i] = regexEscape(longPieces[i]);
        }
        for (i = 0; i < 24; i++) {
            mixedPieces[i] = regexEscape(mixedPieces[i]);
        }

        this._monthsRegex = new RegExp('^(' + mixedPieces.join('|') + ')', 'i');
        this._monthsShortRegex = this._monthsRegex;
        this._monthsStrictRegex = new RegExp('^(' + longPieces.join('|') + ')', 'i');
        this._monthsShortStrictRegex = new RegExp('^(' + shortPieces.join('|') + ')', 'i');
    }

    function createDate (y, m, d, h, M, s, ms) {
        // can't just apply() to create a date:
        // https://stackoverflow.com/q/181348
        var date = new Date(y, m, d, h, M, s, ms);

        // the date constructor remaps years 0-99 to 1900-1999
        if (y < 100 && y >= 0 && isFinite(date.getFullYear())) {
            date.setFullYear(y);
        }
        return date;
    }

    function createUTCDate (y) {
        var date = new Date(Date.UTC.apply(null, arguments));

        // the Date.UTC function remaps years 0-99 to 1900-1999
        if (y < 100 && y >= 0 && isFinite(date.getUTCFullYear())) {
            date.setUTCFullYear(y);
        }
        return date;
    }

    // start-of-first-week - start-of-year
    function firstWeekOffset(year, dow, doy) {
        var // first-week day -- which january is always in the first week (4 for iso, 1 for other)
            fwd = 7 + dow - doy,
            // first-week day local weekday -- which local weekday is fwd
            fwdlw = (7 + createUTCDate(year, 0, fwd).getUTCDay() - dow) % 7;

        return -fwdlw + fwd - 1;
    }

    // https://en.wikipedia.org/wiki/ISO_week_date#Calculating_a_date_given_the_year.2C_week_number_and_weekday
    function dayOfYearFromWeeks(year, week, weekday, dow, doy) {
        var localWeekday = (7 + weekday - dow) % 7,
            weekOffset = firstWeekOffset(year, dow, doy),
            dayOfYear = 1 + 7 * (week - 1) + localWeekday + weekOffset,
            resYear, resDayOfYear;

        if (dayOfYear <= 0) {
            resYear = year - 1;
            resDayOfYear = daysInYear(resYear) + dayOfYear;
        } else if (dayOfYear > daysInYear(year)) {
            resYear = year + 1;
            resDayOfYear = dayOfYear - daysInYear(year);
        } else {
            resYear = year;
            resDayOfYear = dayOfYear;
        }

        return {
            year: resYear,
            dayOfYear: resDayOfYear
        };
    }

    function weekOfYear(mom, dow, doy) {
        var weekOffset = firstWeekOffset(mom.year(), dow, doy),
            week = Math.floor((mom.dayOfYear() - weekOffset - 1) / 7) + 1,
            resWeek, resYear;

        if (week < 1) {
            resYear = mom.year() - 1;
            resWeek = week + weeksInYear(resYear, dow, doy);
        } else if (week > weeksInYear(mom.year(), dow, doy)) {
            resWeek = week - weeksInYear(mom.year(), dow, doy);
            resYear = mom.year() + 1;
        } else {
            resYear = mom.year();
            resWeek = week;
        }

        return {
            week: resWeek,
            year: resYear
        };
    }

    function weeksInYear(year, dow, doy) {
        var weekOffset = firstWeekOffset(year, dow, doy),
            weekOffsetNext = firstWeekOffset(year + 1, dow, doy);
        return (daysInYear(year) - weekOffset + weekOffsetNext) / 7;
    }

    // FORMATTING

    addFormatToken('w', ['ww', 2], 'wo', 'week');
    addFormatToken('W', ['WW', 2], 'Wo', 'isoWeek');

    // ALIASES

    addUnitAlias('week', 'w');
    addUnitAlias('isoWeek', 'W');

    // PRIORITIES

    addUnitPriority('week', 5);
    addUnitPriority('isoWeek', 5);

    // PARSING

    addRegexToken('w',  match1to2);
    addRegexToken('ww', match1to2, match2);
    addRegexToken('W',  match1to2);
    addRegexToken('WW', match1to2, match2);

    addWeekParseToken(['w', 'ww', 'W', 'WW'], function (input, week, config, token) {
        week[token.substr(0, 1)] = toInt(input);
    });

    // HELPERS

    // LOCALES

    function localeWeek (mom) {
        return weekOfYear(mom, this._week.dow, this._week.doy).week;
    }

    var defaultLocaleWeek = {
        dow : 0, // Sunday is the first day of the week.
        doy : 6  // The week that contains Jan 1st is the first week of the year.
    };

    function localeFirstDayOfWeek () {
        return this._week.dow;
    }

    function localeFirstDayOfYear () {
        return this._week.doy;
    }

    // MOMENTS

    function getSetWeek (input) {
        var week = this.localeData().week(this);
        return input == null ? week : this.add((input - week) * 7, 'd');
    }

    function getSetISOWeek (input) {
        var week = weekOfYear(this, 1, 4).week;
        return input == null ? week : this.add((input - week) * 7, 'd');
    }

    // FORMATTING

    addFormatToken('d', 0, 'do', 'day');

    addFormatToken('dd', 0, 0, function (format) {
        return this.localeData().weekdaysMin(this, format);
    });

    addFormatToken('ddd', 0, 0, function (format) {
        return this.localeData().weekdaysShort(this, format);
    });

    addFormatToken('dddd', 0, 0, function (format) {
        return this.localeData().weekdays(this, format);
    });

    addFormatToken('e', 0, 0, 'weekday');
    addFormatToken('E', 0, 0, 'isoWeekday');

    // ALIASES

    addUnitAlias('day', 'd');
    addUnitAlias('weekday', 'e');
    addUnitAlias('isoWeekday', 'E');

    // PRIORITY
    addUnitPriority('day', 11);
    addUnitPriority('weekday', 11);
    addUnitPriority('isoWeekday', 11);

    // PARSING

    addRegexToken('d',    match1to2);
    addRegexToken('e',    match1to2);
    addRegexToken('E',    match1to2);
    addRegexToken('dd',   function (isStrict, locale) {
        return locale.weekdaysMinRegex(isStrict);
    });
    addRegexToken('ddd',   function (isStrict, locale) {
        return locale.weekdaysShortRegex(isStrict);
    });
    addRegexToken('dddd',   function (isStrict, locale) {
        return locale.weekdaysRegex(isStrict);
    });

    addWeekParseToken(['dd', 'ddd', 'dddd'], function (input, week, config, token) {
        var weekday = config._locale.weekdaysParse(input, token, config._strict);
        // if we didn't get a weekday name, mark the date as invalid
        if (weekday != null) {
            week.d = weekday;
        } else {
            getParsingFlags(config).invalidWeekday = input;
        }
    });

    addWeekParseToken(['d', 'e', 'E'], function (input, week, config, token) {
        week[token] = toInt(input);
    });

    // HELPERS

    function parseWeekday(input, locale) {
        if (typeof input !== 'string') {
            return input;
        }

        if (!isNaN(input)) {
            return parseInt(input, 10);
        }

        input = locale.weekdaysParse(input);
        if (typeof input === 'number') {
            return input;
        }

        return null;
    }

    function parseIsoWeekday(input, locale) {
        if (typeof input === 'string') {
            return locale.weekdaysParse(input) % 7 || 7;
        }
        return isNaN(input) ? null : input;
    }

    // LOCALES

    var defaultLocaleWeekdays = 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_');
    function localeWeekdays (m, format) {
        if (!m) {
            return isArray(this._weekdays) ? this._weekdays :
                this._weekdays['standalone'];
        }
        return isArray(this._weekdays) ? this._weekdays[m.day()] :
            this._weekdays[this._weekdays.isFormat.test(format) ? 'format' : 'standalone'][m.day()];
    }

    var defaultLocaleWeekdaysShort = 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_');
    function localeWeekdaysShort (m) {
        return (m) ? this._weekdaysShort[m.day()] : this._weekdaysShort;
    }

    var defaultLocaleWeekdaysMin = 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_');
    function localeWeekdaysMin (m) {
        return (m) ? this._weekdaysMin[m.day()] : this._weekdaysMin;
    }

    function handleStrictParse$1(weekdayName, format, strict) {
        var i, ii, mom, llc = weekdayName.toLocaleLowerCase();
        if (!this._weekdaysParse) {
            this._weekdaysParse = [];
            this._shortWeekdaysParse = [];
            this._minWeekdaysParse = [];

            for (i = 0; i < 7; ++i) {
                mom = createUTC([2000, 1]).day(i);
                this._minWeekdaysParse[i] = this.weekdaysMin(mom, '').toLocaleLowerCase();
                this._shortWeekdaysParse[i] = this.weekdaysShort(mom, '').toLocaleLowerCase();
                this._weekdaysParse[i] = this.weekdays(mom, '').toLocaleLowerCase();
            }
        }

        if (strict) {
            if (format === 'dddd') {
                ii = indexOf.call(this._weekdaysParse, llc);
                return ii !== -1 ? ii : null;
            } else if (format === 'ddd') {
                ii = indexOf.call(this._shortWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            } else {
                ii = indexOf.call(this._minWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            }
        } else {
            if (format === 'dddd') {
                ii = indexOf.call(this._weekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._shortWeekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._minWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            } else if (format === 'ddd') {
                ii = indexOf.call(this._shortWeekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._weekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._minWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            } else {
                ii = indexOf.call(this._minWeekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._weekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._shortWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            }
        }
    }

    function localeWeekdaysParse (weekdayName, format, strict) {
        var i, mom, regex;

        if (this._weekdaysParseExact) {
            return handleStrictParse$1.call(this, weekdayName, format, strict);
        }

        if (!this._weekdaysParse) {
            this._weekdaysParse = [];
            this._minWeekdaysParse = [];
            this._shortWeekdaysParse = [];
            this._fullWeekdaysParse = [];
        }

        for (i = 0; i < 7; i++) {
            // make the regex if we don't have it already

            mom = createUTC([2000, 1]).day(i);
            if (strict && !this._fullWeekdaysParse[i]) {
                this._fullWeekdaysParse[i] = new RegExp('^' + this.weekdays(mom, '').replace('.', '\\.?') + '$', 'i');
                this._shortWeekdaysParse[i] = new RegExp('^' + this.weekdaysShort(mom, '').replace('.', '\\.?') + '$', 'i');
                this._minWeekdaysParse[i] = new RegExp('^' + this.weekdaysMin(mom, '').replace('.', '\\.?') + '$', 'i');
            }
            if (!this._weekdaysParse[i]) {
                regex = '^' + this.weekdays(mom, '') + '|^' + this.weekdaysShort(mom, '') + '|^' + this.weekdaysMin(mom, '');
                this._weekdaysParse[i] = new RegExp(regex.replace('.', ''), 'i');
            }
            // test the regex
            if (strict && format === 'dddd' && this._fullWeekdaysParse[i].test(weekdayName)) {
                return i;
            } else if (strict && format === 'ddd' && this._shortWeekdaysParse[i].test(weekdayName)) {
                return i;
            } else if (strict && format === 'dd' && this._minWeekdaysParse[i].test(weekdayName)) {
                return i;
            } else if (!strict && this._weekdaysParse[i].test(weekdayName)) {
                return i;
            }
        }
    }

    // MOMENTS

    function getSetDayOfWeek (input) {
        if (!this.isValid()) {
            return input != null ? this : NaN;
        }
        var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
        if (input != null) {
            input = parseWeekday(input, this.localeData());
            return this.add(input - day, 'd');
        } else {
            return day;
        }
    }

    function getSetLocaleDayOfWeek (input) {
        if (!this.isValid()) {
            return input != null ? this : NaN;
        }
        var weekday = (this.day() + 7 - this.localeData()._week.dow) % 7;
        return input == null ? weekday : this.add(input - weekday, 'd');
    }

    function getSetISODayOfWeek (input) {
        if (!this.isValid()) {
            return input != null ? this : NaN;
        }

        // behaves the same as moment#day except
        // as a getter, returns 7 instead of 0 (1-7 range instead of 0-6)
        // as a setter, sunday should belong to the previous week.

        if (input != null) {
            var weekday = parseIsoWeekday(input, this.localeData());
            return this.day(this.day() % 7 ? weekday : weekday - 7);
        } else {
            return this.day() || 7;
        }
    }

    var defaultWeekdaysRegex = matchWord;
    function weekdaysRegex (isStrict) {
        if (this._weekdaysParseExact) {
            if (!hasOwnProp(this, '_weekdaysRegex')) {
                computeWeekdaysParse.call(this);
            }
            if (isStrict) {
                return this._weekdaysStrictRegex;
            } else {
                return this._weekdaysRegex;
            }
        } else {
            if (!hasOwnProp(this, '_weekdaysRegex')) {
                this._weekdaysRegex = defaultWeekdaysRegex;
            }
            return this._weekdaysStrictRegex && isStrict ?
                this._weekdaysStrictRegex : this._weekdaysRegex;
        }
    }

    var defaultWeekdaysShortRegex = matchWord;
    function weekdaysShortRegex (isStrict) {
        if (this._weekdaysParseExact) {
            if (!hasOwnProp(this, '_weekdaysRegex')) {
                computeWeekdaysParse.call(this);
            }
            if (isStrict) {
                return this._weekdaysShortStrictRegex;
            } else {
                return this._weekdaysShortRegex;
            }
        } else {
            if (!hasOwnProp(this, '_weekdaysShortRegex')) {
                this._weekdaysShortRegex = defaultWeekdaysShortRegex;
            }
            return this._weekdaysShortStrictRegex && isStrict ?
                this._weekdaysShortStrictRegex : this._weekdaysShortRegex;
        }
    }

    var defaultWeekdaysMinRegex = matchWord;
    function weekdaysMinRegex (isStrict) {
        if (this._weekdaysParseExact) {
            if (!hasOwnProp(this, '_weekdaysRegex')) {
                computeWeekdaysParse.call(this);
            }
            if (isStrict) {
                return this._weekdaysMinStrictRegex;
            } else {
                return this._weekdaysMinRegex;
            }
        } else {
            if (!hasOwnProp(this, '_weekdaysMinRegex')) {
                this._weekdaysMinRegex = defaultWeekdaysMinRegex;
            }
            return this._weekdaysMinStrictRegex && isStrict ?
                this._weekdaysMinStrictRegex : this._weekdaysMinRegex;
        }
    }


    function computeWeekdaysParse () {
        function cmpLenRev(a, b) {
            return b.length - a.length;
        }

        var minPieces = [], shortPieces = [], longPieces = [], mixedPieces = [],
            i, mom, minp, shortp, longp;
        for (i = 0; i < 7; i++) {
            // make the regex if we don't have it already
            mom = createUTC([2000, 1]).day(i);
            minp = this.weekdaysMin(mom, '');
            shortp = this.weekdaysShort(mom, '');
            longp = this.weekdays(mom, '');
            minPieces.push(minp);
            shortPieces.push(shortp);
            longPieces.push(longp);
            mixedPieces.push(minp);
            mixedPieces.push(shortp);
            mixedPieces.push(longp);
        }
        // Sorting makes sure if one weekday (or abbr) is a prefix of another it
        // will match the longer piece.
        minPieces.sort(cmpLenRev);
        shortPieces.sort(cmpLenRev);
        longPieces.sort(cmpLenRev);
        mixedPieces.sort(cmpLenRev);
        for (i = 0; i < 7; i++) {
            shortPieces[i] = regexEscape(shortPieces[i]);
            longPieces[i] = regexEscape(longPieces[i]);
            mixedPieces[i] = regexEscape(mixedPieces[i]);
        }

        this._weekdaysRegex = new RegExp('^(' + mixedPieces.join('|') + ')', 'i');
        this._weekdaysShortRegex = this._weekdaysRegex;
        this._weekdaysMinRegex = this._weekdaysRegex;

        this._weekdaysStrictRegex = new RegExp('^(' + longPieces.join('|') + ')', 'i');
        this._weekdaysShortStrictRegex = new RegExp('^(' + shortPieces.join('|') + ')', 'i');
        this._weekdaysMinStrictRegex = new RegExp('^(' + minPieces.join('|') + ')', 'i');
    }

    // FORMATTING

    function hFormat() {
        return this.hours() % 12 || 12;
    }

    function kFormat() {
        return this.hours() || 24;
    }

    addFormatToken('H', ['HH', 2], 0, 'hour');
    addFormatToken('h', ['hh', 2], 0, hFormat);
    addFormatToken('k', ['kk', 2], 0, kFormat);

    addFormatToken('hmm', 0, 0, function () {
        return '' + hFormat.apply(this) + zeroFill(this.minutes(), 2);
    });

    addFormatToken('hmmss', 0, 0, function () {
        return '' + hFormat.apply(this) + zeroFill(this.minutes(), 2) +
            zeroFill(this.seconds(), 2);
    });

    addFormatToken('Hmm', 0, 0, function () {
        return '' + this.hours() + zeroFill(this.minutes(), 2);
    });

    addFormatToken('Hmmss', 0, 0, function () {
        return '' + this.hours() + zeroFill(this.minutes(), 2) +
            zeroFill(this.seconds(), 2);
    });

    function meridiem (token, lowercase) {
        addFormatToken(token, 0, 0, function () {
            return this.localeData().meridiem(this.hours(), this.minutes(), lowercase);
        });
    }

    meridiem('a', true);
    meridiem('A', false);

    // ALIASES

    addUnitAlias('hour', 'h');

    // PRIORITY
    addUnitPriority('hour', 13);

    // PARSING

    function matchMeridiem (isStrict, locale) {
        return locale._meridiemParse;
    }

    addRegexToken('a',  matchMeridiem);
    addRegexToken('A',  matchMeridiem);
    addRegexToken('H',  match1to2);
    addRegexToken('h',  match1to2);
    addRegexToken('k',  match1to2);
    addRegexToken('HH', match1to2, match2);
    addRegexToken('hh', match1to2, match2);
    addRegexToken('kk', match1to2, match2);

    addRegexToken('hmm', match3to4);
    addRegexToken('hmmss', match5to6);
    addRegexToken('Hmm', match3to4);
    addRegexToken('Hmmss', match5to6);

    addParseToken(['H', 'HH'], HOUR);
    addParseToken(['k', 'kk'], function (input, array, config) {
        var kInput = toInt(input);
        array[HOUR] = kInput === 24 ? 0 : kInput;
    });
    addParseToken(['a', 'A'], function (input, array, config) {
        config._isPm = config._locale.isPM(input);
        config._meridiem = input;
    });
    addParseToken(['h', 'hh'], function (input, array, config) {
        array[HOUR] = toInt(input);
        getParsingFlags(config).bigHour = true;
    });
    addParseToken('hmm', function (input, array, config) {
        var pos = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos));
        array[MINUTE] = toInt(input.substr(pos));
        getParsingFlags(config).bigHour = true;
    });
    addParseToken('hmmss', function (input, array, config) {
        var pos1 = input.length - 4;
        var pos2 = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos1));
        array[MINUTE] = toInt(input.substr(pos1, 2));
        array[SECOND] = toInt(input.substr(pos2));
        getParsingFlags(config).bigHour = true;
    });
    addParseToken('Hmm', function (input, array, config) {
        var pos = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos));
        array[MINUTE] = toInt(input.substr(pos));
    });
    addParseToken('Hmmss', function (input, array, config) {
        var pos1 = input.length - 4;
        var pos2 = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos1));
        array[MINUTE] = toInt(input.substr(pos1, 2));
        array[SECOND] = toInt(input.substr(pos2));
    });

    // LOCALES

    function localeIsPM (input) {
        // IE8 Quirks Mode & IE7 Standards Mode do not allow accessing strings like arrays
        // Using charAt should be more compatible.
        return ((input + '').toLowerCase().charAt(0) === 'p');
    }

    var defaultLocaleMeridiemParse = /[ap]\.?m?\.?/i;
    function localeMeridiem (hours, minutes, isLower) {
        if (hours > 11) {
            return isLower ? 'pm' : 'PM';
        } else {
            return isLower ? 'am' : 'AM';
        }
    }


    // MOMENTS

    // Setting the hour should keep the time, because the user explicitly
    // specified which hour they want. So trying to maintain the same hour (in
    // a new timezone) makes sense. Adding/subtracting hours does not follow
    // this rule.
    var getSetHour = makeGetSet('Hours', true);

    var baseConfig = {
        calendar: defaultCalendar,
        longDateFormat: defaultLongDateFormat,
        invalidDate: defaultInvalidDate,
        ordinal: defaultOrdinal,
        dayOfMonthOrdinalParse: defaultDayOfMonthOrdinalParse,
        relativeTime: defaultRelativeTime,

        months: defaultLocaleMonths,
        monthsShort: defaultLocaleMonthsShort,

        week: defaultLocaleWeek,

        weekdays: defaultLocaleWeekdays,
        weekdaysMin: defaultLocaleWeekdaysMin,
        weekdaysShort: defaultLocaleWeekdaysShort,

        meridiemParse: defaultLocaleMeridiemParse
    };

    // internal storage for locale config files
    var locales = {};
    var localeFamilies = {};
    var globalLocale;

    function normalizeLocale(key) {
        return key ? key.toLowerCase().replace('_', '-') : key;
    }

    // pick the locale from the array
    // try ['en-au', 'en-gb'] as 'en-au', 'en-gb', 'en', as in move through the list trying each
    // substring from most specific to least, but move to the next array item if it's a more specific variant than the current root
    function chooseLocale(names) {
        var i = 0, j, next, locale, split;

        while (i < names.length) {
            split = normalizeLocale(names[i]).split('-');
            j = split.length;
            next = normalizeLocale(names[i + 1]);
            next = next ? next.split('-') : null;
            while (j > 0) {
                locale = loadLocale(split.slice(0, j).join('-'));
                if (locale) {
                    return locale;
                }
                if (next && next.length >= j && compareArrays(split, next, true) >= j - 1) {
                    //the next array item is better than a shallower substring of this one
                    break;
                }
                j--;
            }
            i++;
        }
        return globalLocale;
    }

    function loadLocale(name) {
        var oldLocale = null;
        // TODO: Find a better way to register and load all the locales in Node
        if (!locales[name] && (typeof module !== 'undefined') &&
                module && module.exports) {
            try {
                oldLocale = globalLocale._abbr;
                var aliasedRequire = require;
                aliasedRequire('./locale/' + name);
                getSetGlobalLocale(oldLocale);
            } catch (e) {}
        }
        return locales[name];
    }

    // This function will load locale and then set the global locale.  If
    // no arguments are passed in, it will simply return the current global
    // locale key.
    function getSetGlobalLocale (key, values) {
        var data;
        if (key) {
            if (isUndefined(values)) {
                data = getLocale(key);
            }
            else {
                data = defineLocale(key, values);
            }

            if (data) {
                // moment.duration._locale = moment._locale = data;
                globalLocale = data;
            }
            else {
                if ((typeof console !==  'undefined') && console.warn) {
                    //warn user if arguments are passed but the locale could not be set
                    console.warn('Locale ' + key +  ' not found. Did you forget to load it?');
                }
            }
        }

        return globalLocale._abbr;
    }

    function defineLocale (name, config) {
        if (config !== null) {
            var locale, parentConfig = baseConfig;
            config.abbr = name;
            if (locales[name] != null) {
                deprecateSimple('defineLocaleOverride',
                        'use moment.updateLocale(localeName, config) to change ' +
                        'an existing locale. moment.defineLocale(localeName, ' +
                        'config) should only be used for creating a new locale ' +
                        'See http://momentjs.com/guides/#/warnings/define-locale/ for more info.');
                parentConfig = locales[name]._config;
            } else if (config.parentLocale != null) {
                if (locales[config.parentLocale] != null) {
                    parentConfig = locales[config.parentLocale]._config;
                } else {
                    locale = loadLocale(config.parentLocale);
                    if (locale != null) {
                        parentConfig = locale._config;
                    } else {
                        if (!localeFamilies[config.parentLocale]) {
                            localeFamilies[config.parentLocale] = [];
                        }
                        localeFamilies[config.parentLocale].push({
                            name: name,
                            config: config
                        });
                        return null;
                    }
                }
            }
            locales[name] = new Locale(mergeConfigs(parentConfig, config));

            if (localeFamilies[name]) {
                localeFamilies[name].forEach(function (x) {
                    defineLocale(x.name, x.config);
                });
            }

            // backwards compat for now: also set the locale
            // make sure we set the locale AFTER all child locales have been
            // created, so we won't end up with the child locale set.
            getSetGlobalLocale(name);


            return locales[name];
        } else {
            // useful for testing
            delete locales[name];
            return null;
        }
    }

    function updateLocale(name, config) {
        if (config != null) {
            var locale, tmpLocale, parentConfig = baseConfig;
            // MERGE
            tmpLocale = loadLocale(name);
            if (tmpLocale != null) {
                parentConfig = tmpLocale._config;
            }
            config = mergeConfigs(parentConfig, config);
            locale = new Locale(config);
            locale.parentLocale = locales[name];
            locales[name] = locale;

            // backwards compat for now: also set the locale
            getSetGlobalLocale(name);
        } else {
            // pass null for config to unupdate, useful for tests
            if (locales[name] != null) {
                if (locales[name].parentLocale != null) {
                    locales[name] = locales[name].parentLocale;
                } else if (locales[name] != null) {
                    delete locales[name];
                }
            }
        }
        return locales[name];
    }

    // returns locale data
    function getLocale (key) {
        var locale;

        if (key && key._locale && key._locale._abbr) {
            key = key._locale._abbr;
        }

        if (!key) {
            return globalLocale;
        }

        if (!isArray(key)) {
            //short-circuit everything else
            locale = loadLocale(key);
            if (locale) {
                return locale;
            }
            key = [key];
        }

        return chooseLocale(key);
    }

    function listLocales() {
        return keys(locales);
    }

    function checkOverflow (m) {
        var overflow;
        var a = m._a;

        if (a && getParsingFlags(m).overflow === -2) {
            overflow =
                a[MONTH]       < 0 || a[MONTH]       > 11  ? MONTH :
                a[DATE]        < 1 || a[DATE]        > daysInMonth(a[YEAR], a[MONTH]) ? DATE :
                a[HOUR]        < 0 || a[HOUR]        > 24 || (a[HOUR] === 24 && (a[MINUTE] !== 0 || a[SECOND] !== 0 || a[MILLISECOND] !== 0)) ? HOUR :
                a[MINUTE]      < 0 || a[MINUTE]      > 59  ? MINUTE :
                a[SECOND]      < 0 || a[SECOND]      > 59  ? SECOND :
                a[MILLISECOND] < 0 || a[MILLISECOND] > 999 ? MILLISECOND :
                -1;

            if (getParsingFlags(m)._overflowDayOfYear && (overflow < YEAR || overflow > DATE)) {
                overflow = DATE;
            }
            if (getParsingFlags(m)._overflowWeeks && overflow === -1) {
                overflow = WEEK;
            }
            if (getParsingFlags(m)._overflowWeekday && overflow === -1) {
                overflow = WEEKDAY;
            }

            getParsingFlags(m).overflow = overflow;
        }

        return m;
    }

    // Pick the first defined of two or three arguments.
    function defaults(a, b, c) {
        if (a != null) {
            return a;
        }
        if (b != null) {
            return b;
        }
        return c;
    }

    function currentDateArray(config) {
        // hooks is actually the exported moment object
        var nowValue = new Date(hooks.now());
        if (config._useUTC) {
            return [nowValue.getUTCFullYear(), nowValue.getUTCMonth(), nowValue.getUTCDate()];
        }
        return [nowValue.getFullYear(), nowValue.getMonth(), nowValue.getDate()];
    }

    // convert an array to a date.
    // the array should mirror the parameters below
    // note: all values past the year are optional and will default to the lowest possible value.
    // [year, month, day , hour, minute, second, millisecond]
    function configFromArray (config) {
        var i, date, input = [], currentDate, expectedWeekday, yearToUse;

        if (config._d) {
            return;
        }

        currentDate = currentDateArray(config);

        //compute day of the year from weeks and weekdays
        if (config._w && config._a[DATE] == null && config._a[MONTH] == null) {
            dayOfYearFromWeekInfo(config);
        }

        //if the day of the year is set, figure out what it is
        if (config._dayOfYear != null) {
            yearToUse = defaults(config._a[YEAR], currentDate[YEAR]);

            if (config._dayOfYear > daysInYear(yearToUse) || config._dayOfYear === 0) {
                getParsingFlags(config)._overflowDayOfYear = true;
            }

            date = createUTCDate(yearToUse, 0, config._dayOfYear);
            config._a[MONTH] = date.getUTCMonth();
            config._a[DATE] = date.getUTCDate();
        }

        // Default to current date.
        // * if no year, month, day of month are given, default to today
        // * if day of month is given, default month and year
        // * if month is given, default only year
        // * if year is given, don't default anything
        for (i = 0; i < 3 && config._a[i] == null; ++i) {
            config._a[i] = input[i] = currentDate[i];
        }

        // Zero out whatever was not defaulted, including time
        for (; i < 7; i++) {
            config._a[i] = input[i] = (config._a[i] == null) ? (i === 2 ? 1 : 0) : config._a[i];
        }

        // Check for 24:00:00.000
        if (config._a[HOUR] === 24 &&
                config._a[MINUTE] === 0 &&
                config._a[SECOND] === 0 &&
                config._a[MILLISECOND] === 0) {
            config._nextDay = true;
            config._a[HOUR] = 0;
        }

        config._d = (config._useUTC ? createUTCDate : createDate).apply(null, input);
        expectedWeekday = config._useUTC ? config._d.getUTCDay() : config._d.getDay();

        // Apply timezone offset from input. The actual utcOffset can be changed
        // with parseZone.
        if (config._tzm != null) {
            config._d.setUTCMinutes(config._d.getUTCMinutes() - config._tzm);
        }

        if (config._nextDay) {
            config._a[HOUR] = 24;
        }

        // check for mismatching day of week
        if (config._w && typeof config._w.d !== 'undefined' && config._w.d !== expectedWeekday) {
            getParsingFlags(config).weekdayMismatch = true;
        }
    }

    function dayOfYearFromWeekInfo(config) {
        var w, weekYear, week, weekday, dow, doy, temp, weekdayOverflow;

        w = config._w;
        if (w.GG != null || w.W != null || w.E != null) {
            dow = 1;
            doy = 4;

            // TODO: We need to take the current isoWeekYear, but that depends on
            // how we interpret now (local, utc, fixed offset). So create
            // a now version of current config (take local/utc/offset flags, and
            // create now).
            weekYear = defaults(w.GG, config._a[YEAR], weekOfYear(createLocal(), 1, 4).year);
            week = defaults(w.W, 1);
            weekday = defaults(w.E, 1);
            if (weekday < 1 || weekday > 7) {
                weekdayOverflow = true;
            }
        } else {
            dow = config._locale._week.dow;
            doy = config._locale._week.doy;

            var curWeek = weekOfYear(createLocal(), dow, doy);

            weekYear = defaults(w.gg, config._a[YEAR], curWeek.year);

            // Default to current week.
            week = defaults(w.w, curWeek.week);

            if (w.d != null) {
                // weekday -- low day numbers are considered next week
                weekday = w.d;
                if (weekday < 0 || weekday > 6) {
                    weekdayOverflow = true;
                }
            } else if (w.e != null) {
                // local weekday -- counting starts from begining of week
                weekday = w.e + dow;
                if (w.e < 0 || w.e > 6) {
                    weekdayOverflow = true;
                }
            } else {
                // default to begining of week
                weekday = dow;
            }
        }
        if (week < 1 || week > weeksInYear(weekYear, dow, doy)) {
            getParsingFlags(config)._overflowWeeks = true;
        } else if (weekdayOverflow != null) {
            getParsingFlags(config)._overflowWeekday = true;
        } else {
            temp = dayOfYearFromWeeks(weekYear, week, weekday, dow, doy);
            config._a[YEAR] = temp.year;
            config._dayOfYear = temp.dayOfYear;
        }
    }

    // iso 8601 regex
    // 0000-00-00 0000-W00 or 0000-W00-0 + T + 00 or 00:00 or 00:00:00 or 00:00:00.000 + +00:00 or +0000 or +00)
    var extendedIsoRegex = /^\s*((?:[+-]\d{6}|\d{4})-(?:\d\d-\d\d|W\d\d-\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?::\d\d(?::\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/;
    var basicIsoRegex = /^\s*((?:[+-]\d{6}|\d{4})(?:\d\d\d\d|W\d\d\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?:\d\d(?:\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/;

    var tzRegex = /Z|[+-]\d\d(?::?\d\d)?/;

    var isoDates = [
        ['YYYYYY-MM-DD', /[+-]\d{6}-\d\d-\d\d/],
        ['YYYY-MM-DD', /\d{4}-\d\d-\d\d/],
        ['GGGG-[W]WW-E', /\d{4}-W\d\d-\d/],
        ['GGGG-[W]WW', /\d{4}-W\d\d/, false],
        ['YYYY-DDD', /\d{4}-\d{3}/],
        ['YYYY-MM', /\d{4}-\d\d/, false],
        ['YYYYYYMMDD', /[+-]\d{10}/],
        ['YYYYMMDD', /\d{8}/],
        // YYYYMM is NOT allowed by the standard
        ['GGGG[W]WWE', /\d{4}W\d{3}/],
        ['GGGG[W]WW', /\d{4}W\d{2}/, false],
        ['YYYYDDD', /\d{7}/]
    ];

    // iso time formats and regexes
    var isoTimes = [
        ['HH:mm:ss.SSSS', /\d\d:\d\d:\d\d\.\d+/],
        ['HH:mm:ss,SSSS', /\d\d:\d\d:\d\d,\d+/],
        ['HH:mm:ss', /\d\d:\d\d:\d\d/],
        ['HH:mm', /\d\d:\d\d/],
        ['HHmmss.SSSS', /\d\d\d\d\d\d\.\d+/],
        ['HHmmss,SSSS', /\d\d\d\d\d\d,\d+/],
        ['HHmmss', /\d\d\d\d\d\d/],
        ['HHmm', /\d\d\d\d/],
        ['HH', /\d\d/]
    ];

    var aspNetJsonRegex = /^\/?Date\((\-?\d+)/i;

    // date from iso format
    function configFromISO(config) {
        var i, l,
            string = config._i,
            match = extendedIsoRegex.exec(string) || basicIsoRegex.exec(string),
            allowTime, dateFormat, timeFormat, tzFormat;

        if (match) {
            getParsingFlags(config).iso = true;

            for (i = 0, l = isoDates.length; i < l; i++) {
                if (isoDates[i][1].exec(match[1])) {
                    dateFormat = isoDates[i][0];
                    allowTime = isoDates[i][2] !== false;
                    break;
                }
            }
            if (dateFormat == null) {
                config._isValid = false;
                return;
            }
            if (match[3]) {
                for (i = 0, l = isoTimes.length; i < l; i++) {
                    if (isoTimes[i][1].exec(match[3])) {
                        // match[2] should be 'T' or space
                        timeFormat = (match[2] || ' ') + isoTimes[i][0];
                        break;
                    }
                }
                if (timeFormat == null) {
                    config._isValid = false;
                    return;
                }
            }
            if (!allowTime && timeFormat != null) {
                config._isValid = false;
                return;
            }
            if (match[4]) {
                if (tzRegex.exec(match[4])) {
                    tzFormat = 'Z';
                } else {
                    config._isValid = false;
                    return;
                }
            }
            config._f = dateFormat + (timeFormat || '') + (tzFormat || '');
            configFromStringAndFormat(config);
        } else {
            config._isValid = false;
        }
    }

    // RFC 2822 regex: For details see https://tools.ietf.org/html/rfc2822#section-3.3
    var rfc2822 = /^(?:(Mon|Tue|Wed|Thu|Fri|Sat|Sun),?\s)?(\d{1,2})\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s(\d{2,4})\s(\d\d):(\d\d)(?::(\d\d))?\s(?:(UT|GMT|[ECMP][SD]T)|([Zz])|([+-]\d{4}))$/;

    function extractFromRFC2822Strings(yearStr, monthStr, dayStr, hourStr, minuteStr, secondStr) {
        var result = [
            untruncateYear(yearStr),
            defaultLocaleMonthsShort.indexOf(monthStr),
            parseInt(dayStr, 10),
            parseInt(hourStr, 10),
            parseInt(minuteStr, 10)
        ];

        if (secondStr) {
            result.push(parseInt(secondStr, 10));
        }

        return result;
    }

    function untruncateYear(yearStr) {
        var year = parseInt(yearStr, 10);
        if (year <= 49) {
            return 2000 + year;
        } else if (year <= 999) {
            return 1900 + year;
        }
        return year;
    }

    function preprocessRFC2822(s) {
        // Remove comments and folding whitespace and replace multiple-spaces with a single space
        return s.replace(/\([^)]*\)|[\n\t]/g, ' ').replace(/(\s\s+)/g, ' ').replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    }

    function checkWeekday(weekdayStr, parsedInput, config) {
        if (weekdayStr) {
            // TODO: Replace the vanilla JS Date object with an indepentent day-of-week check.
            var weekdayProvided = defaultLocaleWeekdaysShort.indexOf(weekdayStr),
                weekdayActual = new Date(parsedInput[0], parsedInput[1], parsedInput[2]).getDay();
            if (weekdayProvided !== weekdayActual) {
                getParsingFlags(config).weekdayMismatch = true;
                config._isValid = false;
                return false;
            }
        }
        return true;
    }

    var obsOffsets = {
        UT: 0,
        GMT: 0,
        EDT: -4 * 60,
        EST: -5 * 60,
        CDT: -5 * 60,
        CST: -6 * 60,
        MDT: -6 * 60,
        MST: -7 * 60,
        PDT: -7 * 60,
        PST: -8 * 60
    };

    function calculateOffset(obsOffset, militaryOffset, numOffset) {
        if (obsOffset) {
            return obsOffsets[obsOffset];
        } else if (militaryOffset) {
            // the only allowed military tz is Z
            return 0;
        } else {
            var hm = parseInt(numOffset, 10);
            var m = hm % 100, h = (hm - m) / 100;
            return h * 60 + m;
        }
    }

    // date and time from ref 2822 format
    function configFromRFC2822(config) {
        var match = rfc2822.exec(preprocessRFC2822(config._i));
        if (match) {
            var parsedArray = extractFromRFC2822Strings(match[4], match[3], match[2], match[5], match[6], match[7]);
            if (!checkWeekday(match[1], parsedArray, config)) {
                return;
            }

            config._a = parsedArray;
            config._tzm = calculateOffset(match[8], match[9], match[10]);

            config._d = createUTCDate.apply(null, config._a);
            config._d.setUTCMinutes(config._d.getUTCMinutes() - config._tzm);

            getParsingFlags(config).rfc2822 = true;
        } else {
            config._isValid = false;
        }
    }

    // date from iso format or fallback
    function configFromString(config) {
        var matched = aspNetJsonRegex.exec(config._i);

        if (matched !== null) {
            config._d = new Date(+matched[1]);
            return;
        }

        configFromISO(config);
        if (config._isValid === false) {
            delete config._isValid;
        } else {
            return;
        }

        configFromRFC2822(config);
        if (config._isValid === false) {
            delete config._isValid;
        } else {
            return;
        }

        // Final attempt, use Input Fallback
        hooks.createFromInputFallback(config);
    }

    hooks.createFromInputFallback = deprecate(
        'value provided is not in a recognized RFC2822 or ISO format. moment construction falls back to js Date(), ' +
        'which is not reliable across all browsers and versions. Non RFC2822/ISO date formats are ' +
        'discouraged and will be removed in an upcoming major release. Please refer to ' +
        'http://momentjs.com/guides/#/warnings/js-date/ for more info.',
        function (config) {
            config._d = new Date(config._i + (config._useUTC ? ' UTC' : ''));
        }
    );

    // constant that refers to the ISO standard
    hooks.ISO_8601 = function () {};

    // constant that refers to the RFC 2822 form
    hooks.RFC_2822 = function () {};

    // date from string and format string
    function configFromStringAndFormat(config) {
        // TODO: Move this to another part of the creation flow to prevent circular deps
        if (config._f === hooks.ISO_8601) {
            configFromISO(config);
            return;
        }
        if (config._f === hooks.RFC_2822) {
            configFromRFC2822(config);
            return;
        }
        config._a = [];
        getParsingFlags(config).empty = true;

        // This array is used to make a Date, either with `new Date` or `Date.UTC`
        var string = '' + config._i,
            i, parsedInput, tokens, token, skipped,
            stringLength = string.length,
            totalParsedInputLength = 0;

        tokens = expandFormat(config._f, config._locale).match(formattingTokens) || [];

        for (i = 0; i < tokens.length; i++) {
            token = tokens[i];
            parsedInput = (string.match(getParseRegexForToken(token, config)) || [])[0];
            // console.log('token', token, 'parsedInput', parsedInput,
            //         'regex', getParseRegexForToken(token, config));
            if (parsedInput) {
                skipped = string.substr(0, string.indexOf(parsedInput));
                if (skipped.length > 0) {
                    getParsingFlags(config).unusedInput.push(skipped);
                }
                string = string.slice(string.indexOf(parsedInput) + parsedInput.length);
                totalParsedInputLength += parsedInput.length;
            }
            // don't parse if it's not a known token
            if (formatTokenFunctions[token]) {
                if (parsedInput) {
                    getParsingFlags(config).empty = false;
                }
                else {
                    getParsingFlags(config).unusedTokens.push(token);
                }
                addTimeToArrayFromToken(token, parsedInput, config);
            }
            else if (config._strict && !parsedInput) {
                getParsingFlags(config).unusedTokens.push(token);
            }
        }

        // add remaining unparsed input length to the string
        getParsingFlags(config).charsLeftOver = stringLength - totalParsedInputLength;
        if (string.length > 0) {
            getParsingFlags(config).unusedInput.push(string);
        }

        // clear _12h flag if hour is <= 12
        if (config._a[HOUR] <= 12 &&
            getParsingFlags(config).bigHour === true &&
            config._a[HOUR] > 0) {
            getParsingFlags(config).bigHour = undefined;
        }

        getParsingFlags(config).parsedDateParts = config._a.slice(0);
        getParsingFlags(config).meridiem = config._meridiem;
        // handle meridiem
        config._a[HOUR] = meridiemFixWrap(config._locale, config._a[HOUR], config._meridiem);

        configFromArray(config);
        checkOverflow(config);
    }


    function meridiemFixWrap (locale, hour, meridiem) {
        var isPm;

        if (meridiem == null) {
            // nothing to do
            return hour;
        }
        if (locale.meridiemHour != null) {
            return locale.meridiemHour(hour, meridiem);
        } else if (locale.isPM != null) {
            // Fallback
            isPm = locale.isPM(meridiem);
            if (isPm && hour < 12) {
                hour += 12;
            }
            if (!isPm && hour === 12) {
                hour = 0;
            }
            return hour;
        } else {
            // this is not supposed to happen
            return hour;
        }
    }

    // date from string and array of format strings
    function configFromStringAndArray(config) {
        var tempConfig,
            bestMoment,

            scoreToBeat,
            i,
            currentScore;

        if (config._f.length === 0) {
            getParsingFlags(config).invalidFormat = true;
            config._d = new Date(NaN);
            return;
        }

        for (i = 0; i < config._f.length; i++) {
            currentScore = 0;
            tempConfig = copyConfig({}, config);
            if (config._useUTC != null) {
                tempConfig._useUTC = config._useUTC;
            }
            tempConfig._f = config._f[i];
            configFromStringAndFormat(tempConfig);

            if (!isValid(tempConfig)) {
                continue;
            }

            // if there is any input that was not parsed add a penalty for that format
            currentScore += getParsingFlags(tempConfig).charsLeftOver;

            //or tokens
            currentScore += getParsingFlags(tempConfig).unusedTokens.length * 10;

            getParsingFlags(tempConfig).score = currentScore;

            if (scoreToBeat == null || currentScore < scoreToBeat) {
                scoreToBeat = currentScore;
                bestMoment = tempConfig;
            }
        }

        extend(config, bestMoment || tempConfig);
    }

    function configFromObject(config) {
        if (config._d) {
            return;
        }

        var i = normalizeObjectUnits(config._i);
        config._a = map([i.year, i.month, i.day || i.date, i.hour, i.minute, i.second, i.millisecond], function (obj) {
            return obj && parseInt(obj, 10);
        });

        configFromArray(config);
    }

    function createFromConfig (config) {
        var res = new Moment(checkOverflow(prepareConfig(config)));
        if (res._nextDay) {
            // Adding is smart enough around DST
            res.add(1, 'd');
            res._nextDay = undefined;
        }

        return res;
    }

    function prepareConfig (config) {
        var input = config._i,
            format = config._f;

        config._locale = config._locale || getLocale(config._l);

        if (input === null || (format === undefined && input === '')) {
            return createInvalid({nullInput: true});
        }

        if (typeof input === 'string') {
            config._i = input = config._locale.preparse(input);
        }

        if (isMoment(input)) {
            return new Moment(checkOverflow(input));
        } else if (isDate(input)) {
            config._d = input;
        } else if (isArray(format)) {
            configFromStringAndArray(config);
        } else if (format) {
            configFromStringAndFormat(config);
        }  else {
            configFromInput(config);
        }

        if (!isValid(config)) {
            config._d = null;
        }

        return config;
    }

    function configFromInput(config) {
        var input = config._i;
        if (isUndefined(input)) {
            config._d = new Date(hooks.now());
        } else if (isDate(input)) {
            config._d = new Date(input.valueOf());
        } else if (typeof input === 'string') {
            configFromString(config);
        } else if (isArray(input)) {
            config._a = map(input.slice(0), function (obj) {
                return parseInt(obj, 10);
            });
            configFromArray(config);
        } else if (isObject(input)) {
            configFromObject(config);
        } else if (isNumber(input)) {
            // from milliseconds
            config._d = new Date(input);
        } else {
            hooks.createFromInputFallback(config);
        }
    }

    function createLocalOrUTC (input, format, locale, strict, isUTC) {
        var c = {};

        if (locale === true || locale === false) {
            strict = locale;
            locale = undefined;
        }

        if ((isObject(input) && isObjectEmpty(input)) ||
                (isArray(input) && input.length === 0)) {
            input = undefined;
        }
        // object construction must be done this way.
        // https://github.com/moment/moment/issues/1423
        c._isAMomentObject = true;
        c._useUTC = c._isUTC = isUTC;
        c._l = locale;
        c._i = input;
        c._f = format;
        c._strict = strict;

        return createFromConfig(c);
    }

    function createLocal (input, format, locale, strict) {
        return createLocalOrUTC(input, format, locale, strict, false);
    }

    var prototypeMin = deprecate(
        'moment().min is deprecated, use moment.max instead. http://momentjs.com/guides/#/warnings/min-max/',
        function () {
            var other = createLocal.apply(null, arguments);
            if (this.isValid() && other.isValid()) {
                return other < this ? this : other;
            } else {
                return createInvalid();
            }
        }
    );

    var prototypeMax = deprecate(
        'moment().max is deprecated, use moment.min instead. http://momentjs.com/guides/#/warnings/min-max/',
        function () {
            var other = createLocal.apply(null, arguments);
            if (this.isValid() && other.isValid()) {
                return other > this ? this : other;
            } else {
                return createInvalid();
            }
        }
    );

    // Pick a moment m from moments so that m[fn](other) is true for all
    // other. This relies on the function fn to be transitive.
    //
    // moments should either be an array of moment objects or an array, whose
    // first element is an array of moment objects.
    function pickBy(fn, moments) {
        var res, i;
        if (moments.length === 1 && isArray(moments[0])) {
            moments = moments[0];
        }
        if (!moments.length) {
            return createLocal();
        }
        res = moments[0];
        for (i = 1; i < moments.length; ++i) {
            if (!moments[i].isValid() || moments[i][fn](res)) {
                res = moments[i];
            }
        }
        return res;
    }

    // TODO: Use [].sort instead?
    function min () {
        var args = [].slice.call(arguments, 0);

        return pickBy('isBefore', args);
    }

    function max () {
        var args = [].slice.call(arguments, 0);

        return pickBy('isAfter', args);
    }

    var now = function () {
        return Date.now ? Date.now() : +(new Date());
    };

    var ordering = ['year', 'quarter', 'month', 'week', 'day', 'hour', 'minute', 'second', 'millisecond'];

    function isDurationValid(m) {
        for (var key in m) {
            if (!(indexOf.call(ordering, key) !== -1 && (m[key] == null || !isNaN(m[key])))) {
                return false;
            }
        }

        var unitHasDecimal = false;
        for (var i = 0; i < ordering.length; ++i) {
            if (m[ordering[i]]) {
                if (unitHasDecimal) {
                    return false; // only allow non-integers for smallest unit
                }
                if (parseFloat(m[ordering[i]]) !== toInt(m[ordering[i]])) {
                    unitHasDecimal = true;
                }
            }
        }

        return true;
    }

    function isValid$1() {
        return this._isValid;
    }

    function createInvalid$1() {
        return createDuration(NaN);
    }

    function Duration (duration) {
        var normalizedInput = normalizeObjectUnits(duration),
            years = normalizedInput.year || 0,
            quarters = normalizedInput.quarter || 0,
            months = normalizedInput.month || 0,
            weeks = normalizedInput.week || 0,
            days = normalizedInput.day || 0,
            hours = normalizedInput.hour || 0,
            minutes = normalizedInput.minute || 0,
            seconds = normalizedInput.second || 0,
            milliseconds = normalizedInput.millisecond || 0;

        this._isValid = isDurationValid(normalizedInput);

        // representation for dateAddRemove
        this._milliseconds = +milliseconds +
            seconds * 1e3 + // 1000
            minutes * 6e4 + // 1000 * 60
            hours * 1000 * 60 * 60; //using 1000 * 60 * 60 instead of 36e5 to avoid floating point rounding errors https://github.com/moment/moment/issues/2978
        // Because of dateAddRemove treats 24 hours as different from a
        // day when working around DST, we need to store them separately
        this._days = +days +
            weeks * 7;
        // It is impossible to translate months into days without knowing
        // which months you are are talking about, so we have to store
        // it separately.
        this._months = +months +
            quarters * 3 +
            years * 12;

        this._data = {};

        this._locale = getLocale();

        this._bubble();
    }

    function isDuration (obj) {
        return obj instanceof Duration;
    }

    function absRound (number) {
        if (number < 0) {
            return Math.round(-1 * number) * -1;
        } else {
            return Math.round(number);
        }
    }

    // FORMATTING

    function offset (token, separator) {
        addFormatToken(token, 0, 0, function () {
            var offset = this.utcOffset();
            var sign = '+';
            if (offset < 0) {
                offset = -offset;
                sign = '-';
            }
            return sign + zeroFill(~~(offset / 60), 2) + separator + zeroFill(~~(offset) % 60, 2);
        });
    }

    offset('Z', ':');
    offset('ZZ', '');

    // PARSING

    addRegexToken('Z',  matchShortOffset);
    addRegexToken('ZZ', matchShortOffset);
    addParseToken(['Z', 'ZZ'], function (input, array, config) {
        config._useUTC = true;
        config._tzm = offsetFromString(matchShortOffset, input);
    });

    // HELPERS

    // timezone chunker
    // '+10:00' > ['10',  '00']
    // '-1530'  > ['-15', '30']
    var chunkOffset = /([\+\-]|\d\d)/gi;

    function offsetFromString(matcher, string) {
        var matches = (string || '').match(matcher);

        if (matches === null) {
            return null;
        }

        var chunk   = matches[matches.length - 1] || [];
        var parts   = (chunk + '').match(chunkOffset) || ['-', 0, 0];
        var minutes = +(parts[1] * 60) + toInt(parts[2]);

        return minutes === 0 ?
          0 :
          parts[0] === '+' ? minutes : -minutes;
    }

    // Return a moment from input, that is local/utc/zone equivalent to model.
    function cloneWithOffset(input, model) {
        var res, diff;
        if (model._isUTC) {
            res = model.clone();
            diff = (isMoment(input) || isDate(input) ? input.valueOf() : createLocal(input).valueOf()) - res.valueOf();
            // Use low-level api, because this fn is low-level api.
            res._d.setTime(res._d.valueOf() + diff);
            hooks.updateOffset(res, false);
            return res;
        } else {
            return createLocal(input).local();
        }
    }

    function getDateOffset (m) {
        // On Firefox.24 Date#getTimezoneOffset returns a floating point.
        // https://github.com/moment/moment/pull/1871
        return -Math.round(m._d.getTimezoneOffset() / 15) * 15;
    }

    // HOOKS

    // This function will be called whenever a moment is mutated.
    // It is intended to keep the offset in sync with the timezone.
    hooks.updateOffset = function () {};

    // MOMENTS

    // keepLocalTime = true means only change the timezone, without
    // affecting the local hour. So 5:31:26 +0300 --[utcOffset(2, true)]-->
    // 5:31:26 +0200 It is possible that 5:31:26 doesn't exist with offset
    // +0200, so we adjust the time as needed, to be valid.
    //
    // Keeping the time actually adds/subtracts (one hour)
    // from the actual represented time. That is why we call updateOffset
    // a second time. In case it wants us to change the offset again
    // _changeInProgress == true case, then we have to adjust, because
    // there is no such time in the given timezone.
    function getSetOffset (input, keepLocalTime, keepMinutes) {
        var offset = this._offset || 0,
            localAdjust;
        if (!this.isValid()) {
            return input != null ? this : NaN;
        }
        if (input != null) {
            if (typeof input === 'string') {
                input = offsetFromString(matchShortOffset, input);
                if (input === null) {
                    return this;
                }
            } else if (Math.abs(input) < 16 && !keepMinutes) {
                input = input * 60;
            }
            if (!this._isUTC && keepLocalTime) {
                localAdjust = getDateOffset(this);
            }
            this._offset = input;
            this._isUTC = true;
            if (localAdjust != null) {
                this.add(localAdjust, 'm');
            }
            if (offset !== input) {
                if (!keepLocalTime || this._changeInProgress) {
                    addSubtract(this, createDuration(input - offset, 'm'), 1, false);
                } else if (!this._changeInProgress) {
                    this._changeInProgress = true;
                    hooks.updateOffset(this, true);
                    this._changeInProgress = null;
                }
            }
            return this;
        } else {
            return this._isUTC ? offset : getDateOffset(this);
        }
    }

    function getSetZone (input, keepLocalTime) {
        if (input != null) {
            if (typeof input !== 'string') {
                input = -input;
            }

            this.utcOffset(input, keepLocalTime);

            return this;
        } else {
            return -this.utcOffset();
        }
    }

    function setOffsetToUTC (keepLocalTime) {
        return this.utcOffset(0, keepLocalTime);
    }

    function setOffsetToLocal (keepLocalTime) {
        if (this._isUTC) {
            this.utcOffset(0, keepLocalTime);
            this._isUTC = false;

            if (keepLocalTime) {
                this.subtract(getDateOffset(this), 'm');
            }
        }
        return this;
    }

    function setOffsetToParsedOffset () {
        if (this._tzm != null) {
            this.utcOffset(this._tzm, false, true);
        } else if (typeof this._i === 'string') {
            var tZone = offsetFromString(matchOffset, this._i);
            if (tZone != null) {
                this.utcOffset(tZone);
            }
            else {
                this.utcOffset(0, true);
            }
        }
        return this;
    }

    function hasAlignedHourOffset (input) {
        if (!this.isValid()) {
            return false;
        }
        input = input ? createLocal(input).utcOffset() : 0;

        return (this.utcOffset() - input) % 60 === 0;
    }

    function isDaylightSavingTime () {
        return (
            this.utcOffset() > this.clone().month(0).utcOffset() ||
            this.utcOffset() > this.clone().month(5).utcOffset()
        );
    }

    function isDaylightSavingTimeShifted () {
        if (!isUndefined(this._isDSTShifted)) {
            return this._isDSTShifted;
        }

        var c = {};

        copyConfig(c, this);
        c = prepareConfig(c);

        if (c._a) {
            var other = c._isUTC ? createUTC(c._a) : createLocal(c._a);
            this._isDSTShifted = this.isValid() &&
                compareArrays(c._a, other.toArray()) > 0;
        } else {
            this._isDSTShifted = false;
        }

        return this._isDSTShifted;
    }

    function isLocal () {
        return this.isValid() ? !this._isUTC : false;
    }

    function isUtcOffset () {
        return this.isValid() ? this._isUTC : false;
    }

    function isUtc () {
        return this.isValid() ? this._isUTC && this._offset === 0 : false;
    }

    // ASP.NET json date format regex
    var aspNetRegex = /^(\-|\+)?(?:(\d*)[. ])?(\d+)\:(\d+)(?:\:(\d+)(\.\d*)?)?$/;

    // from http://docs.closure-library.googlecode.com/git/closure_goog_date_date.js.source.html
    // somewhat more in line with 4.4.3.2 2004 spec, but allows decimal anywhere
    // and further modified to allow for strings containing both week and day
    var isoRegex = /^(-|\+)?P(?:([-+]?[0-9,.]*)Y)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)W)?(?:([-+]?[0-9,.]*)D)?(?:T(?:([-+]?[0-9,.]*)H)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)S)?)?$/;

    function createDuration (input, key) {
        var duration = input,
            // matching against regexp is expensive, do it on demand
            match = null,
            sign,
            ret,
            diffRes;

        if (isDuration(input)) {
            duration = {
                ms : input._milliseconds,
                d  : input._days,
                M  : input._months
            };
        } else if (isNumber(input)) {
            duration = {};
            if (key) {
                duration[key] = input;
            } else {
                duration.milliseconds = input;
            }
        } else if (!!(match = aspNetRegex.exec(input))) {
            sign = (match[1] === '-') ? -1 : 1;
            duration = {
                y  : 0,
                d  : toInt(match[DATE])                         * sign,
                h  : toInt(match[HOUR])                         * sign,
                m  : toInt(match[MINUTE])                       * sign,
                s  : toInt(match[SECOND])                       * sign,
                ms : toInt(absRound(match[MILLISECOND] * 1000)) * sign // the millisecond decimal point is included in the match
            };
        } else if (!!(match = isoRegex.exec(input))) {
            sign = (match[1] === '-') ? -1 : (match[1] === '+') ? 1 : 1;
            duration = {
                y : parseIso(match[2], sign),
                M : parseIso(match[3], sign),
                w : parseIso(match[4], sign),
                d : parseIso(match[5], sign),
                h : parseIso(match[6], sign),
                m : parseIso(match[7], sign),
                s : parseIso(match[8], sign)
            };
        } else if (duration == null) {// checks for null or undefined
            duration = {};
        } else if (typeof duration === 'object' && ('from' in duration || 'to' in duration)) {
            diffRes = momentsDifference(createLocal(duration.from), createLocal(duration.to));

            duration = {};
            duration.ms = diffRes.milliseconds;
            duration.M = diffRes.months;
        }

        ret = new Duration(duration);

        if (isDuration(input) && hasOwnProp(input, '_locale')) {
            ret._locale = input._locale;
        }

        return ret;
    }

    createDuration.fn = Duration.prototype;
    createDuration.invalid = createInvalid$1;

    function parseIso (inp, sign) {
        // We'd normally use ~~inp for this, but unfortunately it also
        // converts floats to ints.
        // inp may be undefined, so careful calling replace on it.
        var res = inp && parseFloat(inp.replace(',', '.'));
        // apply sign while we're at it
        return (isNaN(res) ? 0 : res) * sign;
    }

    function positiveMomentsDifference(base, other) {
        var res = {milliseconds: 0, months: 0};

        res.months = other.month() - base.month() +
            (other.year() - base.year()) * 12;
        if (base.clone().add(res.months, 'M').isAfter(other)) {
            --res.months;
        }

        res.milliseconds = +other - +(base.clone().add(res.months, 'M'));

        return res;
    }

    function momentsDifference(base, other) {
        var res;
        if (!(base.isValid() && other.isValid())) {
            return {milliseconds: 0, months: 0};
        }

        other = cloneWithOffset(other, base);
        if (base.isBefore(other)) {
            res = positiveMomentsDifference(base, other);
        } else {
            res = positiveMomentsDifference(other, base);
            res.milliseconds = -res.milliseconds;
            res.months = -res.months;
        }

        return res;
    }

    // TODO: remove 'name' arg after deprecation is removed
    function createAdder(direction, name) {
        return function (val, period) {
            var dur, tmp;
            //invert the arguments, but complain about it
            if (period !== null && !isNaN(+period)) {
                deprecateSimple(name, 'moment().' + name  + '(period, number) is deprecated. Please use moment().' + name + '(number, period). ' +
                'See http://momentjs.com/guides/#/warnings/add-inverted-param/ for more info.');
                tmp = val; val = period; period = tmp;
            }

            val = typeof val === 'string' ? +val : val;
            dur = createDuration(val, period);
            addSubtract(this, dur, direction);
            return this;
        };
    }

    function addSubtract (mom, duration, isAdding, updateOffset) {
        var milliseconds = duration._milliseconds,
            days = absRound(duration._days),
            months = absRound(duration._months);

        if (!mom.isValid()) {
            // No op
            return;
        }

        updateOffset = updateOffset == null ? true : updateOffset;

        if (months) {
            setMonth(mom, get(mom, 'Month') + months * isAdding);
        }
        if (days) {
            set$1(mom, 'Date', get(mom, 'Date') + days * isAdding);
        }
        if (milliseconds) {
            mom._d.setTime(mom._d.valueOf() + milliseconds * isAdding);
        }
        if (updateOffset) {
            hooks.updateOffset(mom, days || months);
        }
    }

    var add      = createAdder(1, 'add');
    var subtract = createAdder(-1, 'subtract');

    function getCalendarFormat(myMoment, now) {
        var diff = myMoment.diff(now, 'days', true);
        return diff < -6 ? 'sameElse' :
                diff < -1 ? 'lastWeek' :
                diff < 0 ? 'lastDay' :
                diff < 1 ? 'sameDay' :
                diff < 2 ? 'nextDay' :
                diff < 7 ? 'nextWeek' : 'sameElse';
    }

    function calendar$1 (time, formats) {
        // We want to compare the start of today, vs this.
        // Getting start-of-today depends on whether we're local/utc/offset or not.
        var now = time || createLocal(),
            sod = cloneWithOffset(now, this).startOf('day'),
            format = hooks.calendarFormat(this, sod) || 'sameElse';

        var output = formats && (isFunction(formats[format]) ? formats[format].call(this, now) : formats[format]);

        return this.format(output || this.localeData().calendar(format, this, createLocal(now)));
    }

    function clone () {
        return new Moment(this);
    }

    function isAfter (input, units) {
        var localInput = isMoment(input) ? input : createLocal(input);
        if (!(this.isValid() && localInput.isValid())) {
            return false;
        }
        units = normalizeUnits(!isUndefined(units) ? units : 'millisecond');
        if (units === 'millisecond') {
            return this.valueOf() > localInput.valueOf();
        } else {
            return localInput.valueOf() < this.clone().startOf(units).valueOf();
        }
    }

    function isBefore (input, units) {
        var localInput = isMoment(input) ? input : createLocal(input);
        if (!(this.isValid() && localInput.isValid())) {
            return false;
        }
        units = normalizeUnits(!isUndefined(units) ? units : 'millisecond');
        if (units === 'millisecond') {
            return this.valueOf() < localInput.valueOf();
        } else {
            return this.clone().endOf(units).valueOf() < localInput.valueOf();
        }
    }

    function isBetween (from, to, units, inclusivity) {
        inclusivity = inclusivity || '()';
        return (inclusivity[0] === '(' ? this.isAfter(from, units) : !this.isBefore(from, units)) &&
            (inclusivity[1] === ')' ? this.isBefore(to, units) : !this.isAfter(to, units));
    }

    function isSame (input, units) {
        var localInput = isMoment(input) ? input : createLocal(input),
            inputMs;
        if (!(this.isValid() && localInput.isValid())) {
            return false;
        }
        units = normalizeUnits(units || 'millisecond');
        if (units === 'millisecond') {
            return this.valueOf() === localInput.valueOf();
        } else {
            inputMs = localInput.valueOf();
            return this.clone().startOf(units).valueOf() <= inputMs && inputMs <= this.clone().endOf(units).valueOf();
        }
    }

    function isSameOrAfter (input, units) {
        return this.isSame(input, units) || this.isAfter(input,units);
    }

    function isSameOrBefore (input, units) {
        return this.isSame(input, units) || this.isBefore(input,units);
    }

    function diff (input, units, asFloat) {
        var that,
            zoneDelta,
            output;

        if (!this.isValid()) {
            return NaN;
        }

        that = cloneWithOffset(input, this);

        if (!that.isValid()) {
            return NaN;
        }

        zoneDelta = (that.utcOffset() - this.utcOffset()) * 6e4;

        units = normalizeUnits(units);

        switch (units) {
            case 'year': output = monthDiff(this, that) / 12; break;
            case 'month': output = monthDiff(this, that); break;
            case 'quarter': output = monthDiff(this, that) / 3; break;
            case 'second': output = (this - that) / 1e3; break; // 1000
            case 'minute': output = (this - that) / 6e4; break; // 1000 * 60
            case 'hour': output = (this - that) / 36e5; break; // 1000 * 60 * 60
            case 'day': output = (this - that - zoneDelta) / 864e5; break; // 1000 * 60 * 60 * 24, negate dst
            case 'week': output = (this - that - zoneDelta) / 6048e5; break; // 1000 * 60 * 60 * 24 * 7, negate dst
            default: output = this - that;
        }

        return asFloat ? output : absFloor(output);
    }

    function monthDiff (a, b) {
        // difference in months
        var wholeMonthDiff = ((b.year() - a.year()) * 12) + (b.month() - a.month()),
            // b is in (anchor - 1 month, anchor + 1 month)
            anchor = a.clone().add(wholeMonthDiff, 'months'),
            anchor2, adjust;

        if (b - anchor < 0) {
            anchor2 = a.clone().add(wholeMonthDiff - 1, 'months');
            // linear across the month
            adjust = (b - anchor) / (anchor - anchor2);
        } else {
            anchor2 = a.clone().add(wholeMonthDiff + 1, 'months');
            // linear across the month
            adjust = (b - anchor) / (anchor2 - anchor);
        }

        //check for negative zero, return zero if negative zero
        return -(wholeMonthDiff + adjust) || 0;
    }

    hooks.defaultFormat = 'YYYY-MM-DDTHH:mm:ssZ';
    hooks.defaultFormatUtc = 'YYYY-MM-DDTHH:mm:ss[Z]';

    function toString () {
        return this.clone().locale('en').format('ddd MMM DD YYYY HH:mm:ss [GMT]ZZ');
    }

    function toISOString(keepOffset) {
        if (!this.isValid()) {
            return null;
        }
        var utc = keepOffset !== true;
        var m = utc ? this.clone().utc() : this;
        if (m.year() < 0 || m.year() > 9999) {
            return formatMoment(m, utc ? 'YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]' : 'YYYYYY-MM-DD[T]HH:mm:ss.SSSZ');
        }
        if (isFunction(Date.prototype.toISOString)) {
            // native implementation is ~50x faster, use it when we can
            if (utc) {
                return this.toDate().toISOString();
            } else {
                return new Date(this.valueOf() + this.utcOffset() * 60 * 1000).toISOString().replace('Z', formatMoment(m, 'Z'));
            }
        }
        return formatMoment(m, utc ? 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]' : 'YYYY-MM-DD[T]HH:mm:ss.SSSZ');
    }

    /**
     * Return a human readable representation of a moment that can
     * also be evaluated to get a new moment which is the same
     *
     * @link https://nodejs.org/dist/latest/docs/api/util.html#util_custom_inspect_function_on_objects
     */
    function inspect () {
        if (!this.isValid()) {
            return 'moment.invalid(/* ' + this._i + ' */)';
        }
        var func = 'moment';
        var zone = '';
        if (!this.isLocal()) {
            func = this.utcOffset() === 0 ? 'moment.utc' : 'moment.parseZone';
            zone = 'Z';
        }
        var prefix = '[' + func + '("]';
        var year = (0 <= this.year() && this.year() <= 9999) ? 'YYYY' : 'YYYYYY';
        var datetime = '-MM-DD[T]HH:mm:ss.SSS';
        var suffix = zone + '[")]';

        return this.format(prefix + year + datetime + suffix);
    }

    function format (inputString) {
        if (!inputString) {
            inputString = this.isUtc() ? hooks.defaultFormatUtc : hooks.defaultFormat;
        }
        var output = formatMoment(this, inputString);
        return this.localeData().postformat(output);
    }

    function from (time, withoutSuffix) {
        if (this.isValid() &&
                ((isMoment(time) && time.isValid()) ||
                 createLocal(time).isValid())) {
            return createDuration({to: this, from: time}).locale(this.locale()).humanize(!withoutSuffix);
        } else {
            return this.localeData().invalidDate();
        }
    }

    function fromNow (withoutSuffix) {
        return this.from(createLocal(), withoutSuffix);
    }

    function to (time, withoutSuffix) {
        if (this.isValid() &&
                ((isMoment(time) && time.isValid()) ||
                 createLocal(time).isValid())) {
            return createDuration({from: this, to: time}).locale(this.locale()).humanize(!withoutSuffix);
        } else {
            return this.localeData().invalidDate();
        }
    }

    function toNow (withoutSuffix) {
        return this.to(createLocal(), withoutSuffix);
    }

    // If passed a locale key, it will set the locale for this
    // instance.  Otherwise, it will return the locale configuration
    // variables for this instance.
    function locale (key) {
        var newLocaleData;

        if (key === undefined) {
            return this._locale._abbr;
        } else {
            newLocaleData = getLocale(key);
            if (newLocaleData != null) {
                this._locale = newLocaleData;
            }
            return this;
        }
    }

    var lang = deprecate(
        'moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.',
        function (key) {
            if (key === undefined) {
                return this.localeData();
            } else {
                return this.locale(key);
            }
        }
    );

    function localeData () {
        return this._locale;
    }

    function startOf (units) {
        units = normalizeUnits(units);
        // the following switch intentionally omits break keywords
        // to utilize falling through the cases.
        switch (units) {
            case 'year':
                this.month(0);
                /* falls through */
            case 'quarter':
            case 'month':
                this.date(1);
                /* falls through */
            case 'week':
            case 'isoWeek':
            case 'day':
            case 'date':
                this.hours(0);
                /* falls through */
            case 'hour':
                this.minutes(0);
                /* falls through */
            case 'minute':
                this.seconds(0);
                /* falls through */
            case 'second':
                this.milliseconds(0);
        }

        // weeks are a special case
        if (units === 'week') {
            this.weekday(0);
        }
        if (units === 'isoWeek') {
            this.isoWeekday(1);
        }

        // quarters are also special
        if (units === 'quarter') {
            this.month(Math.floor(this.month() / 3) * 3);
        }

        return this;
    }

    function endOf (units) {
        units = normalizeUnits(units);
        if (units === undefined || units === 'millisecond') {
            return this;
        }

        // 'date' is an alias for 'day', so it should be considered as such.
        if (units === 'date') {
            units = 'day';
        }

        return this.startOf(units).add(1, (units === 'isoWeek' ? 'week' : units)).subtract(1, 'ms');
    }

    function valueOf () {
        return this._d.valueOf() - ((this._offset || 0) * 60000);
    }

    function unix () {
        return Math.floor(this.valueOf() / 1000);
    }

    function toDate () {
        return new Date(this.valueOf());
    }

    function toArray () {
        var m = this;
        return [m.year(), m.month(), m.date(), m.hour(), m.minute(), m.second(), m.millisecond()];
    }

    function toObject () {
        var m = this;
        return {
            years: m.year(),
            months: m.month(),
            date: m.date(),
            hours: m.hours(),
            minutes: m.minutes(),
            seconds: m.seconds(),
            milliseconds: m.milliseconds()
        };
    }

    function toJSON () {
        // new Date(NaN).toJSON() === null
        return this.isValid() ? this.toISOString() : null;
    }

    function isValid$2 () {
        return isValid(this);
    }

    function parsingFlags () {
        return extend({}, getParsingFlags(this));
    }

    function invalidAt () {
        return getParsingFlags(this).overflow;
    }

    function creationData() {
        return {
            input: this._i,
            format: this._f,
            locale: this._locale,
            isUTC: this._isUTC,
            strict: this._strict
        };
    }

    // FORMATTING

    addFormatToken(0, ['gg', 2], 0, function () {
        return this.weekYear() % 100;
    });

    addFormatToken(0, ['GG', 2], 0, function () {
        return this.isoWeekYear() % 100;
    });

    function addWeekYearFormatToken (token, getter) {
        addFormatToken(0, [token, token.length], 0, getter);
    }

    addWeekYearFormatToken('gggg',     'weekYear');
    addWeekYearFormatToken('ggggg',    'weekYear');
    addWeekYearFormatToken('GGGG',  'isoWeekYear');
    addWeekYearFormatToken('GGGGG', 'isoWeekYear');

    // ALIASES

    addUnitAlias('weekYear', 'gg');
    addUnitAlias('isoWeekYear', 'GG');

    // PRIORITY

    addUnitPriority('weekYear', 1);
    addUnitPriority('isoWeekYear', 1);


    // PARSING

    addRegexToken('G',      matchSigned);
    addRegexToken('g',      matchSigned);
    addRegexToken('GG',     match1to2, match2);
    addRegexToken('gg',     match1to2, match2);
    addRegexToken('GGGG',   match1to4, match4);
    addRegexToken('gggg',   match1to4, match4);
    addRegexToken('GGGGG',  match1to6, match6);
    addRegexToken('ggggg',  match1to6, match6);

    addWeekParseToken(['gggg', 'ggggg', 'GGGG', 'GGGGG'], function (input, week, config, token) {
        week[token.substr(0, 2)] = toInt(input);
    });

    addWeekParseToken(['gg', 'GG'], function (input, week, config, token) {
        week[token] = hooks.parseTwoDigitYear(input);
    });

    // MOMENTS

    function getSetWeekYear (input) {
        return getSetWeekYearHelper.call(this,
                input,
                this.week(),
                this.weekday(),
                this.localeData()._week.dow,
                this.localeData()._week.doy);
    }

    function getSetISOWeekYear (input) {
        return getSetWeekYearHelper.call(this,
                input, this.isoWeek(), this.isoWeekday(), 1, 4);
    }

    function getISOWeeksInYear () {
        return weeksInYear(this.year(), 1, 4);
    }

    function getWeeksInYear () {
        var weekInfo = this.localeData()._week;
        return weeksInYear(this.year(), weekInfo.dow, weekInfo.doy);
    }

    function getSetWeekYearHelper(input, week, weekday, dow, doy) {
        var weeksTarget;
        if (input == null) {
            return weekOfYear(this, dow, doy).year;
        } else {
            weeksTarget = weeksInYear(input, dow, doy);
            if (week > weeksTarget) {
                week = weeksTarget;
            }
            return setWeekAll.call(this, input, week, weekday, dow, doy);
        }
    }

    function setWeekAll(weekYear, week, weekday, dow, doy) {
        var dayOfYearData = dayOfYearFromWeeks(weekYear, week, weekday, dow, doy),
            date = createUTCDate(dayOfYearData.year, 0, dayOfYearData.dayOfYear);

        this.year(date.getUTCFullYear());
        this.month(date.getUTCMonth());
        this.date(date.getUTCDate());
        return this;
    }

    // FORMATTING

    addFormatToken('Q', 0, 'Qo', 'quarter');

    // ALIASES

    addUnitAlias('quarter', 'Q');

    // PRIORITY

    addUnitPriority('quarter', 7);

    // PARSING

    addRegexToken('Q', match1);
    addParseToken('Q', function (input, array) {
        array[MONTH] = (toInt(input) - 1) * 3;
    });

    // MOMENTS

    function getSetQuarter (input) {
        return input == null ? Math.ceil((this.month() + 1) / 3) : this.month((input - 1) * 3 + this.month() % 3);
    }

    // FORMATTING

    addFormatToken('D', ['DD', 2], 'Do', 'date');

    // ALIASES

    addUnitAlias('date', 'D');

    // PRIORITY
    addUnitPriority('date', 9);

    // PARSING

    addRegexToken('D',  match1to2);
    addRegexToken('DD', match1to2, match2);
    addRegexToken('Do', function (isStrict, locale) {
        // TODO: Remove "ordinalParse" fallback in next major release.
        return isStrict ?
          (locale._dayOfMonthOrdinalParse || locale._ordinalParse) :
          locale._dayOfMonthOrdinalParseLenient;
    });

    addParseToken(['D', 'DD'], DATE);
    addParseToken('Do', function (input, array) {
        array[DATE] = toInt(input.match(match1to2)[0]);
    });

    // MOMENTS

    var getSetDayOfMonth = makeGetSet('Date', true);

    // FORMATTING

    addFormatToken('DDD', ['DDDD', 3], 'DDDo', 'dayOfYear');

    // ALIASES

    addUnitAlias('dayOfYear', 'DDD');

    // PRIORITY
    addUnitPriority('dayOfYear', 4);

    // PARSING

    addRegexToken('DDD',  match1to3);
    addRegexToken('DDDD', match3);
    addParseToken(['DDD', 'DDDD'], function (input, array, config) {
        config._dayOfYear = toInt(input);
    });

    // HELPERS

    // MOMENTS

    function getSetDayOfYear (input) {
        var dayOfYear = Math.round((this.clone().startOf('day') - this.clone().startOf('year')) / 864e5) + 1;
        return input == null ? dayOfYear : this.add((input - dayOfYear), 'd');
    }

    // FORMATTING

    addFormatToken('m', ['mm', 2], 0, 'minute');

    // ALIASES

    addUnitAlias('minute', 'm');

    // PRIORITY

    addUnitPriority('minute', 14);

    // PARSING

    addRegexToken('m',  match1to2);
    addRegexToken('mm', match1to2, match2);
    addParseToken(['m', 'mm'], MINUTE);

    // MOMENTS

    var getSetMinute = makeGetSet('Minutes', false);

    // FORMATTING

    addFormatToken('s', ['ss', 2], 0, 'second');

    // ALIASES

    addUnitAlias('second', 's');

    // PRIORITY

    addUnitPriority('second', 15);

    // PARSING

    addRegexToken('s',  match1to2);
    addRegexToken('ss', match1to2, match2);
    addParseToken(['s', 'ss'], SECOND);

    // MOMENTS

    var getSetSecond = makeGetSet('Seconds', false);

    // FORMATTING

    addFormatToken('S', 0, 0, function () {
        return ~~(this.millisecond() / 100);
    });

    addFormatToken(0, ['SS', 2], 0, function () {
        return ~~(this.millisecond() / 10);
    });

    addFormatToken(0, ['SSS', 3], 0, 'millisecond');
    addFormatToken(0, ['SSSS', 4], 0, function () {
        return this.millisecond() * 10;
    });
    addFormatToken(0, ['SSSSS', 5], 0, function () {
        return this.millisecond() * 100;
    });
    addFormatToken(0, ['SSSSSS', 6], 0, function () {
        return this.millisecond() * 1000;
    });
    addFormatToken(0, ['SSSSSSS', 7], 0, function () {
        return this.millisecond() * 10000;
    });
    addFormatToken(0, ['SSSSSSSS', 8], 0, function () {
        return this.millisecond() * 100000;
    });
    addFormatToken(0, ['SSSSSSSSS', 9], 0, function () {
        return this.millisecond() * 1000000;
    });


    // ALIASES

    addUnitAlias('millisecond', 'ms');

    // PRIORITY

    addUnitPriority('millisecond', 16);

    // PARSING

    addRegexToken('S',    match1to3, match1);
    addRegexToken('SS',   match1to3, match2);
    addRegexToken('SSS',  match1to3, match3);

    var token;
    for (token = 'SSSS'; token.length <= 9; token += 'S') {
        addRegexToken(token, matchUnsigned);
    }

    function parseMs(input, array) {
        array[MILLISECOND] = toInt(('0.' + input) * 1000);
    }

    for (token = 'S'; token.length <= 9; token += 'S') {
        addParseToken(token, parseMs);
    }
    // MOMENTS

    var getSetMillisecond = makeGetSet('Milliseconds', false);

    // FORMATTING

    addFormatToken('z',  0, 0, 'zoneAbbr');
    addFormatToken('zz', 0, 0, 'zoneName');

    // MOMENTS

    function getZoneAbbr () {
        return this._isUTC ? 'UTC' : '';
    }

    function getZoneName () {
        return this._isUTC ? 'Coordinated Universal Time' : '';
    }

    var proto = Moment.prototype;

    proto.add               = add;
    proto.calendar          = calendar$1;
    proto.clone             = clone;
    proto.diff              = diff;
    proto.endOf             = endOf;
    proto.format            = format;
    proto.from              = from;
    proto.fromNow           = fromNow;
    proto.to                = to;
    proto.toNow             = toNow;
    proto.get               = stringGet;
    proto.invalidAt         = invalidAt;
    proto.isAfter           = isAfter;
    proto.isBefore          = isBefore;
    proto.isBetween         = isBetween;
    proto.isSame            = isSame;
    proto.isSameOrAfter     = isSameOrAfter;
    proto.isSameOrBefore    = isSameOrBefore;
    proto.isValid           = isValid$2;
    proto.lang              = lang;
    proto.locale            = locale;
    proto.localeData        = localeData;
    proto.max               = prototypeMax;
    proto.min               = prototypeMin;
    proto.parsingFlags      = parsingFlags;
    proto.set               = stringSet;
    proto.startOf           = startOf;
    proto.subtract          = subtract;
    proto.toArray           = toArray;
    proto.toObject          = toObject;
    proto.toDate            = toDate;
    proto.toISOString       = toISOString;
    proto.inspect           = inspect;
    proto.toJSON            = toJSON;
    proto.toString          = toString;
    proto.unix              = unix;
    proto.valueOf           = valueOf;
    proto.creationData      = creationData;
    proto.year       = getSetYear;
    proto.isLeapYear = getIsLeapYear;
    proto.weekYear    = getSetWeekYear;
    proto.isoWeekYear = getSetISOWeekYear;
    proto.quarter = proto.quarters = getSetQuarter;
    proto.month       = getSetMonth;
    proto.daysInMonth = getDaysInMonth;
    proto.week           = proto.weeks        = getSetWeek;
    proto.isoWeek        = proto.isoWeeks     = getSetISOWeek;
    proto.weeksInYear    = getWeeksInYear;
    proto.isoWeeksInYear = getISOWeeksInYear;
    proto.date       = getSetDayOfMonth;
    proto.day        = proto.days             = getSetDayOfWeek;
    proto.weekday    = getSetLocaleDayOfWeek;
    proto.isoWeekday = getSetISODayOfWeek;
    proto.dayOfYear  = getSetDayOfYear;
    proto.hour = proto.hours = getSetHour;
    proto.minute = proto.minutes = getSetMinute;
    proto.second = proto.seconds = getSetSecond;
    proto.millisecond = proto.milliseconds = getSetMillisecond;
    proto.utcOffset            = getSetOffset;
    proto.utc                  = setOffsetToUTC;
    proto.local                = setOffsetToLocal;
    proto.parseZone            = setOffsetToParsedOffset;
    proto.hasAlignedHourOffset = hasAlignedHourOffset;
    proto.isDST                = isDaylightSavingTime;
    proto.isLocal              = isLocal;
    proto.isUtcOffset          = isUtcOffset;
    proto.isUtc                = isUtc;
    proto.isUTC                = isUtc;
    proto.zoneAbbr = getZoneAbbr;
    proto.zoneName = getZoneName;
    proto.dates  = deprecate('dates accessor is deprecated. Use date instead.', getSetDayOfMonth);
    proto.months = deprecate('months accessor is deprecated. Use month instead', getSetMonth);
    proto.years  = deprecate('years accessor is deprecated. Use year instead', getSetYear);
    proto.zone   = deprecate('moment().zone is deprecated, use moment().utcOffset instead. http://momentjs.com/guides/#/warnings/zone/', getSetZone);
    proto.isDSTShifted = deprecate('isDSTShifted is deprecated. See http://momentjs.com/guides/#/warnings/dst-shifted/ for more information', isDaylightSavingTimeShifted);

    function createUnix (input) {
        return createLocal(input * 1000);
    }

    function createInZone () {
        return createLocal.apply(null, arguments).parseZone();
    }

    function preParsePostFormat (string) {
        return string;
    }

    var proto$1 = Locale.prototype;

    proto$1.calendar        = calendar;
    proto$1.longDateFormat  = longDateFormat;
    proto$1.invalidDate     = invalidDate;
    proto$1.ordinal         = ordinal;
    proto$1.preparse        = preParsePostFormat;
    proto$1.postformat      = preParsePostFormat;
    proto$1.relativeTime    = relativeTime;
    proto$1.pastFuture      = pastFuture;
    proto$1.set             = set;

    proto$1.months            =        localeMonths;
    proto$1.monthsShort       =        localeMonthsShort;
    proto$1.monthsParse       =        localeMonthsParse;
    proto$1.monthsRegex       = monthsRegex;
    proto$1.monthsShortRegex  = monthsShortRegex;
    proto$1.week = localeWeek;
    proto$1.firstDayOfYear = localeFirstDayOfYear;
    proto$1.firstDayOfWeek = localeFirstDayOfWeek;

    proto$1.weekdays       =        localeWeekdays;
    proto$1.weekdaysMin    =        localeWeekdaysMin;
    proto$1.weekdaysShort  =        localeWeekdaysShort;
    proto$1.weekdaysParse  =        localeWeekdaysParse;

    proto$1.weekdaysRegex       =        weekdaysRegex;
    proto$1.weekdaysShortRegex  =        weekdaysShortRegex;
    proto$1.weekdaysMinRegex    =        weekdaysMinRegex;

    proto$1.isPM = localeIsPM;
    proto$1.meridiem = localeMeridiem;

    function get$1 (format, index, field, setter) {
        var locale = getLocale();
        var utc = createUTC().set(setter, index);
        return locale[field](utc, format);
    }

    function listMonthsImpl (format, index, field) {
        if (isNumber(format)) {
            index = format;
            format = undefined;
        }

        format = format || '';

        if (index != null) {
            return get$1(format, index, field, 'month');
        }

        var i;
        var out = [];
        for (i = 0; i < 12; i++) {
            out[i] = get$1(format, i, field, 'month');
        }
        return out;
    }

    // ()
    // (5)
    // (fmt, 5)
    // (fmt)
    // (true)
    // (true, 5)
    // (true, fmt, 5)
    // (true, fmt)
    function listWeekdaysImpl (localeSorted, format, index, field) {
        if (typeof localeSorted === 'boolean') {
            if (isNumber(format)) {
                index = format;
                format = undefined;
            }

            format = format || '';
        } else {
            format = localeSorted;
            index = format;
            localeSorted = false;

            if (isNumber(format)) {
                index = format;
                format = undefined;
            }

            format = format || '';
        }

        var locale = getLocale(),
            shift = localeSorted ? locale._week.dow : 0;

        if (index != null) {
            return get$1(format, (index + shift) % 7, field, 'day');
        }

        var i;
        var out = [];
        for (i = 0; i < 7; i++) {
            out[i] = get$1(format, (i + shift) % 7, field, 'day');
        }
        return out;
    }

    function listMonths (format, index) {
        return listMonthsImpl(format, index, 'months');
    }

    function listMonthsShort (format, index) {
        return listMonthsImpl(format, index, 'monthsShort');
    }

    function listWeekdays (localeSorted, format, index) {
        return listWeekdaysImpl(localeSorted, format, index, 'weekdays');
    }

    function listWeekdaysShort (localeSorted, format, index) {
        return listWeekdaysImpl(localeSorted, format, index, 'weekdaysShort');
    }

    function listWeekdaysMin (localeSorted, format, index) {
        return listWeekdaysImpl(localeSorted, format, index, 'weekdaysMin');
    }

    getSetGlobalLocale('en', {
        dayOfMonthOrdinalParse: /\d{1,2}(th|st|nd|rd)/,
        ordinal : function (number) {
            var b = number % 10,
                output = (toInt(number % 100 / 10) === 1) ? 'th' :
                (b === 1) ? 'st' :
                (b === 2) ? 'nd' :
                (b === 3) ? 'rd' : 'th';
            return number + output;
        }
    });

    // Side effect imports

    hooks.lang = deprecate('moment.lang is deprecated. Use moment.locale instead.', getSetGlobalLocale);
    hooks.langData = deprecate('moment.langData is deprecated. Use moment.localeData instead.', getLocale);

    var mathAbs = Math.abs;

    function abs () {
        var data           = this._data;

        this._milliseconds = mathAbs(this._milliseconds);
        this._days         = mathAbs(this._days);
        this._months       = mathAbs(this._months);

        data.milliseconds  = mathAbs(data.milliseconds);
        data.seconds       = mathAbs(data.seconds);
        data.minutes       = mathAbs(data.minutes);
        data.hours         = mathAbs(data.hours);
        data.months        = mathAbs(data.months);
        data.years         = mathAbs(data.years);

        return this;
    }

    function addSubtract$1 (duration, input, value, direction) {
        var other = createDuration(input, value);

        duration._milliseconds += direction * other._milliseconds;
        duration._days         += direction * other._days;
        duration._months       += direction * other._months;

        return duration._bubble();
    }

    // supports only 2.0-style add(1, 's') or add(duration)
    function add$1 (input, value) {
        return addSubtract$1(this, input, value, 1);
    }

    // supports only 2.0-style subtract(1, 's') or subtract(duration)
    function subtract$1 (input, value) {
        return addSubtract$1(this, input, value, -1);
    }

    function absCeil (number) {
        if (number < 0) {
            return Math.floor(number);
        } else {
            return Math.ceil(number);
        }
    }

    function bubble () {
        var milliseconds = this._milliseconds;
        var days         = this._days;
        var months       = this._months;
        var data         = this._data;
        var seconds, minutes, hours, years, monthsFromDays;

        // if we have a mix of positive and negative values, bubble down first
        // check: https://github.com/moment/moment/issues/2166
        if (!((milliseconds >= 0 && days >= 0 && months >= 0) ||
                (milliseconds <= 0 && days <= 0 && months <= 0))) {
            milliseconds += absCeil(monthsToDays(months) + days) * 864e5;
            days = 0;
            months = 0;
        }

        // The following code bubbles up values, see the tests for
        // examples of what that means.
        data.milliseconds = milliseconds % 1000;

        seconds           = absFloor(milliseconds / 1000);
        data.seconds      = seconds % 60;

        minutes           = absFloor(seconds / 60);
        data.minutes      = minutes % 60;

        hours             = absFloor(minutes / 60);
        data.hours        = hours % 24;

        days += absFloor(hours / 24);

        // convert days to months
        monthsFromDays = absFloor(daysToMonths(days));
        months += monthsFromDays;
        days -= absCeil(monthsToDays(monthsFromDays));

        // 12 months -> 1 year
        years = absFloor(months / 12);
        months %= 12;

        data.days   = days;
        data.months = months;
        data.years  = years;

        return this;
    }

    function daysToMonths (days) {
        // 400 years have 146097 days (taking into account leap year rules)
        // 400 years have 12 months === 4800
        return days * 4800 / 146097;
    }

    function monthsToDays (months) {
        // the reverse of daysToMonths
        return months * 146097 / 4800;
    }

    function as (units) {
        if (!this.isValid()) {
            return NaN;
        }
        var days;
        var months;
        var milliseconds = this._milliseconds;

        units = normalizeUnits(units);

        if (units === 'month' || units === 'year') {
            days   = this._days   + milliseconds / 864e5;
            months = this._months + daysToMonths(days);
            return units === 'month' ? months : months / 12;
        } else {
            // handle milliseconds separately because of floating point math errors (issue #1867)
            days = this._days + Math.round(monthsToDays(this._months));
            switch (units) {
                case 'week'   : return days / 7     + milliseconds / 6048e5;
                case 'day'    : return days         + milliseconds / 864e5;
                case 'hour'   : return days * 24    + milliseconds / 36e5;
                case 'minute' : return days * 1440  + milliseconds / 6e4;
                case 'second' : return days * 86400 + milliseconds / 1000;
                // Math.floor prevents floating point math errors here
                case 'millisecond': return Math.floor(days * 864e5) + milliseconds;
                default: throw new Error('Unknown unit ' + units);
            }
        }
    }

    // TODO: Use this.as('ms')?
    function valueOf$1 () {
        if (!this.isValid()) {
            return NaN;
        }
        return (
            this._milliseconds +
            this._days * 864e5 +
            (this._months % 12) * 2592e6 +
            toInt(this._months / 12) * 31536e6
        );
    }

    function makeAs (alias) {
        return function () {
            return this.as(alias);
        };
    }

    var asMilliseconds = makeAs('ms');
    var asSeconds      = makeAs('s');
    var asMinutes      = makeAs('m');
    var asHours        = makeAs('h');
    var asDays         = makeAs('d');
    var asWeeks        = makeAs('w');
    var asMonths       = makeAs('M');
    var asYears        = makeAs('y');

    function clone$1 () {
        return createDuration(this);
    }

    function get$2 (units) {
        units = normalizeUnits(units);
        return this.isValid() ? this[units + 's']() : NaN;
    }

    function makeGetter(name) {
        return function () {
            return this.isValid() ? this._data[name] : NaN;
        };
    }

    var milliseconds = makeGetter('milliseconds');
    var seconds      = makeGetter('seconds');
    var minutes      = makeGetter('minutes');
    var hours        = makeGetter('hours');
    var days         = makeGetter('days');
    var months       = makeGetter('months');
    var years        = makeGetter('years');

    function weeks () {
        return absFloor(this.days() / 7);
    }

    var round = Math.round;
    var thresholds = {
        ss: 44,         // a few seconds to seconds
        s : 45,         // seconds to minute
        m : 45,         // minutes to hour
        h : 22,         // hours to day
        d : 26,         // days to month
        M : 11          // months to year
    };

    // helper function for moment.fn.from, moment.fn.fromNow, and moment.duration.fn.humanize
    function substituteTimeAgo(string, number, withoutSuffix, isFuture, locale) {
        return locale.relativeTime(number || 1, !!withoutSuffix, string, isFuture);
    }

    function relativeTime$1 (posNegDuration, withoutSuffix, locale) {
        var duration = createDuration(posNegDuration).abs();
        var seconds  = round(duration.as('s'));
        var minutes  = round(duration.as('m'));
        var hours    = round(duration.as('h'));
        var days     = round(duration.as('d'));
        var months   = round(duration.as('M'));
        var years    = round(duration.as('y'));

        var a = seconds <= thresholds.ss && ['s', seconds]  ||
                seconds < thresholds.s   && ['ss', seconds] ||
                minutes <= 1             && ['m']           ||
                minutes < thresholds.m   && ['mm', minutes] ||
                hours   <= 1             && ['h']           ||
                hours   < thresholds.h   && ['hh', hours]   ||
                days    <= 1             && ['d']           ||
                days    < thresholds.d   && ['dd', days]    ||
                months  <= 1             && ['M']           ||
                months  < thresholds.M   && ['MM', months]  ||
                years   <= 1             && ['y']           || ['yy', years];

        a[2] = withoutSuffix;
        a[3] = +posNegDuration > 0;
        a[4] = locale;
        return substituteTimeAgo.apply(null, a);
    }

    // This function allows you to set the rounding function for relative time strings
    function getSetRelativeTimeRounding (roundingFunction) {
        if (roundingFunction === undefined) {
            return round;
        }
        if (typeof(roundingFunction) === 'function') {
            round = roundingFunction;
            return true;
        }
        return false;
    }

    // This function allows you to set a threshold for relative time strings
    function getSetRelativeTimeThreshold (threshold, limit) {
        if (thresholds[threshold] === undefined) {
            return false;
        }
        if (limit === undefined) {
            return thresholds[threshold];
        }
        thresholds[threshold] = limit;
        if (threshold === 's') {
            thresholds.ss = limit - 1;
        }
        return true;
    }

    function humanize (withSuffix) {
        if (!this.isValid()) {
            return this.localeData().invalidDate();
        }

        var locale = this.localeData();
        var output = relativeTime$1(this, !withSuffix, locale);

        if (withSuffix) {
            output = locale.pastFuture(+this, output);
        }

        return locale.postformat(output);
    }

    var abs$1 = Math.abs;

    function sign(x) {
        return ((x > 0) - (x < 0)) || +x;
    }

    function toISOString$1() {
        // for ISO strings we do not use the normal bubbling rules:
        //  * milliseconds bubble up until they become hours
        //  * days do not bubble at all
        //  * months bubble up until they become years
        // This is because there is no context-free conversion between hours and days
        // (think of clock changes)
        // and also not between days and months (28-31 days per month)
        if (!this.isValid()) {
            return this.localeData().invalidDate();
        }

        var seconds = abs$1(this._milliseconds) / 1000;
        var days         = abs$1(this._days);
        var months       = abs$1(this._months);
        var minutes, hours, years;

        // 3600 seconds -> 60 minutes -> 1 hour
        minutes           = absFloor(seconds / 60);
        hours             = absFloor(minutes / 60);
        seconds %= 60;
        minutes %= 60;

        // 12 months -> 1 year
        years  = absFloor(months / 12);
        months %= 12;


        // inspired by https://github.com/dordille/moment-isoduration/blob/master/moment.isoduration.js
        var Y = years;
        var M = months;
        var D = days;
        var h = hours;
        var m = minutes;
        var s = seconds ? seconds.toFixed(3).replace(/\.?0+$/, '') : '';
        var total = this.asSeconds();

        if (!total) {
            // this is the same as C#'s (Noda) and python (isodate)...
            // but not other JS (goog.date)
            return 'P0D';
        }

        var totalSign = total < 0 ? '-' : '';
        var ymSign = sign(this._months) !== sign(total) ? '-' : '';
        var daysSign = sign(this._days) !== sign(total) ? '-' : '';
        var hmsSign = sign(this._milliseconds) !== sign(total) ? '-' : '';

        return totalSign + 'P' +
            (Y ? ymSign + Y + 'Y' : '') +
            (M ? ymSign + M + 'M' : '') +
            (D ? daysSign + D + 'D' : '') +
            ((h || m || s) ? 'T' : '') +
            (h ? hmsSign + h + 'H' : '') +
            (m ? hmsSign + m + 'M' : '') +
            (s ? hmsSign + s + 'S' : '');
    }

    var proto$2 = Duration.prototype;

    proto$2.isValid        = isValid$1;
    proto$2.abs            = abs;
    proto$2.add            = add$1;
    proto$2.subtract       = subtract$1;
    proto$2.as             = as;
    proto$2.asMilliseconds = asMilliseconds;
    proto$2.asSeconds      = asSeconds;
    proto$2.asMinutes      = asMinutes;
    proto$2.asHours        = asHours;
    proto$2.asDays         = asDays;
    proto$2.asWeeks        = asWeeks;
    proto$2.asMonths       = asMonths;
    proto$2.asYears        = asYears;
    proto$2.valueOf        = valueOf$1;
    proto$2._bubble        = bubble;
    proto$2.clone          = clone$1;
    proto$2.get            = get$2;
    proto$2.milliseconds   = milliseconds;
    proto$2.seconds        = seconds;
    proto$2.minutes        = minutes;
    proto$2.hours          = hours;
    proto$2.days           = days;
    proto$2.weeks          = weeks;
    proto$2.months         = months;
    proto$2.years          = years;
    proto$2.humanize       = humanize;
    proto$2.toISOString    = toISOString$1;
    proto$2.toString       = toISOString$1;
    proto$2.toJSON         = toISOString$1;
    proto$2.locale         = locale;
    proto$2.localeData     = localeData;

    proto$2.toIsoString = deprecate('toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)', toISOString$1);
    proto$2.lang = lang;

    // Side effect imports

    // FORMATTING

    addFormatToken('X', 0, 0, 'unix');
    addFormatToken('x', 0, 0, 'valueOf');

    // PARSING

    addRegexToken('x', matchSigned);
    addRegexToken('X', matchTimestamp);
    addParseToken('X', function (input, array, config) {
        config._d = new Date(parseFloat(input, 10) * 1000);
    });
    addParseToken('x', function (input, array, config) {
        config._d = new Date(toInt(input));
    });

    // Side effect imports


    hooks.version = '2.22.2';

    setHookCallback(createLocal);

    hooks.fn                    = proto;
    hooks.min                   = min;
    hooks.max                   = max;
    hooks.now                   = now;
    hooks.utc                   = createUTC;
    hooks.unix                  = createUnix;
    hooks.months                = listMonths;
    hooks.isDate                = isDate;
    hooks.locale                = getSetGlobalLocale;
    hooks.invalid               = createInvalid;
    hooks.duration              = createDuration;
    hooks.isMoment              = isMoment;
    hooks.weekdays              = listWeekdays;
    hooks.parseZone             = createInZone;
    hooks.localeData            = getLocale;
    hooks.isDuration            = isDuration;
    hooks.monthsShort           = listMonthsShort;
    hooks.weekdaysMin           = listWeekdaysMin;
    hooks.defineLocale          = defineLocale;
    hooks.updateLocale          = updateLocale;
    hooks.locales               = listLocales;
    hooks.weekdaysShort         = listWeekdaysShort;
    hooks.normalizeUnits        = normalizeUnits;
    hooks.relativeTimeRounding  = getSetRelativeTimeRounding;
    hooks.relativeTimeThreshold = getSetRelativeTimeThreshold;
    hooks.calendarFormat        = getCalendarFormat;
    hooks.prototype             = proto;

    // currently HTML5 input type only supports 24-hour formats
    hooks.HTML5_FMT = {
        DATETIME_LOCAL: 'YYYY-MM-DDTHH:mm',             // <input type="datetime-local" />
        DATETIME_LOCAL_SECONDS: 'YYYY-MM-DDTHH:mm:ss',  // <input type="datetime-local" step="1" />
        DATETIME_LOCAL_MS: 'YYYY-MM-DDTHH:mm:ss.SSS',   // <input type="datetime-local" step="0.001" />
        DATE: 'YYYY-MM-DD',                             // <input type="date" />
        TIME: 'HH:mm',                                  // <input type="time" />
        TIME_SECONDS: 'HH:mm:ss',                       // <input type="time" step="1" />
        TIME_MS: 'HH:mm:ss.SSS',                        // <input type="time" step="0.001" />
        WEEK: 'YYYY-[W]WW',                             // <input type="week" />
        MONTH: 'YYYY-MM'                                // <input type="month" />
    };

    return hooks;

})));

},{}],2:[function(require,module,exports){
/* smoothscroll v0.4.0 - 2018 - Dustan Kasten, Jeremias Menichelli - MIT License */
(function () {
  'use strict';

  // polyfill
  function polyfill() {
    // aliases
    var w = window;
    var d = document;

    // return if scroll behavior is supported and polyfill is not forced
    if (
      'scrollBehavior' in d.documentElement.style &&
      w.__forceSmoothScrollPolyfill__ !== true
    ) {
      return;
    }

    // globals
    var Element = w.HTMLElement || w.Element;
    var SCROLL_TIME = 468;

    // object gathering original scroll methods
    var original = {
      scroll: w.scroll || w.scrollTo,
      scrollBy: w.scrollBy,
      elementScroll: Element.prototype.scroll || scrollElement,
      scrollIntoView: Element.prototype.scrollIntoView
    };

    // define timing method
    var now =
      w.performance && w.performance.now
        ? w.performance.now.bind(w.performance)
        : Date.now;

    /**
     * indicates if a the current browser is made by Microsoft
     * @method isMicrosoftBrowser
     * @param {String} userAgent
     * @returns {Boolean}
     */
    function isMicrosoftBrowser(userAgent) {
      var userAgentPatterns = ['MSIE ', 'Trident/', 'Edge/'];

      return new RegExp(userAgentPatterns.join('|')).test(userAgent);
    }

    /*
     * IE has rounding bug rounding down clientHeight and clientWidth and
     * rounding up scrollHeight and scrollWidth causing false positives
     * on hasScrollableSpace
     */
    var ROUNDING_TOLERANCE = isMicrosoftBrowser(w.navigator.userAgent) ? 1 : 0;

    /**
     * changes scroll position inside an element
     * @method scrollElement
     * @param {Number} x
     * @param {Number} y
     * @returns {undefined}
     */
    function scrollElement(x, y) {
      this.scrollLeft = x;
      this.scrollTop = y;
    }

    /**
     * returns result of applying ease math function to a number
     * @method ease
     * @param {Number} k
     * @returns {Number}
     */
    function ease(k) {
      return 0.5 * (1 - Math.cos(Math.PI * k));
    }

    /**
     * indicates if a smooth behavior should be applied
     * @method shouldBailOut
     * @param {Number|Object} firstArg
     * @returns {Boolean}
     */
    function shouldBailOut(firstArg) {
      if (
        firstArg === null ||
        typeof firstArg !== 'object' ||
        firstArg.behavior === undefined ||
        firstArg.behavior === 'auto' ||
        firstArg.behavior === 'instant'
      ) {
        // first argument is not an object/null
        // or behavior is auto, instant or undefined
        return true;
      }

      if (typeof firstArg === 'object' && firstArg.behavior === 'smooth') {
        // first argument is an object and behavior is smooth
        return false;
      }

      // throw error when behavior is not supported
      throw new TypeError(
        'behavior member of ScrollOptions ' +
          firstArg.behavior +
          ' is not a valid value for enumeration ScrollBehavior.'
      );
    }

    /**
     * indicates if an element has scrollable space in the provided axis
     * @method hasScrollableSpace
     * @param {Node} el
     * @param {String} axis
     * @returns {Boolean}
     */
    function hasScrollableSpace(el, axis) {
      if (axis === 'Y') {
        return el.clientHeight + ROUNDING_TOLERANCE < el.scrollHeight;
      }

      if (axis === 'X') {
        return el.clientWidth + ROUNDING_TOLERANCE < el.scrollWidth;
      }
    }

    /**
     * indicates if an element has a scrollable overflow property in the axis
     * @method canOverflow
     * @param {Node} el
     * @param {String} axis
     * @returns {Boolean}
     */
    function canOverflow(el, axis) {
      var overflowValue = w.getComputedStyle(el, null)['overflow' + axis];

      return overflowValue === 'auto' || overflowValue === 'scroll';
    }

    /**
     * indicates if an element can be scrolled in either axis
     * @method isScrollable
     * @param {Node} el
     * @param {String} axis
     * @returns {Boolean}
     */
    function isScrollable(el) {
      var isScrollableY = hasScrollableSpace(el, 'Y') && canOverflow(el, 'Y');
      var isScrollableX = hasScrollableSpace(el, 'X') && canOverflow(el, 'X');

      return isScrollableY || isScrollableX;
    }

    /**
     * finds scrollable parent of an element
     * @method findScrollableParent
     * @param {Node} el
     * @returns {Node} el
     */
    function findScrollableParent(el) {
      var isBody;

      do {
        el = el.parentNode;

        isBody = el === d.body;
      } while (isBody === false && isScrollable(el) === false);

      isBody = null;

      return el;
    }

    /**
     * self invoked function that, given a context, steps through scrolling
     * @method step
     * @param {Object} context
     * @returns {undefined}
     */
    function step(context) {
      var time = now();
      var value;
      var currentX;
      var currentY;
      var elapsed = (time - context.startTime) / SCROLL_TIME;

      // avoid elapsed times higher than one
      elapsed = elapsed > 1 ? 1 : elapsed;

      // apply easing to elapsed time
      value = ease(elapsed);

      currentX = context.startX + (context.x - context.startX) * value;
      currentY = context.startY + (context.y - context.startY) * value;

      context.method.call(context.scrollable, currentX, currentY);

      // scroll more if we have not reached our destination
      if (currentX !== context.x || currentY !== context.y) {
        w.requestAnimationFrame(step.bind(w, context));
      }
    }

    /**
     * scrolls window or element with a smooth behavior
     * @method smoothScroll
     * @param {Object|Node} el
     * @param {Number} x
     * @param {Number} y
     * @returns {undefined}
     */
    function smoothScroll(el, x, y) {
      var scrollable;
      var startX;
      var startY;
      var method;
      var startTime = now();

      // define scroll context
      if (el === d.body) {
        scrollable = w;
        startX = w.scrollX || w.pageXOffset;
        startY = w.scrollY || w.pageYOffset;
        method = original.scroll;
      } else {
        scrollable = el;
        startX = el.scrollLeft;
        startY = el.scrollTop;
        method = scrollElement;
      }

      // scroll looping over a frame
      step({
        scrollable: scrollable,
        method: method,
        startTime: startTime,
        startX: startX,
        startY: startY,
        x: x,
        y: y
      });
    }

    // ORIGINAL METHODS OVERRIDES
    // w.scroll and w.scrollTo
    w.scroll = w.scrollTo = function() {
      // avoid action when no arguments are passed
      if (arguments[0] === undefined) {
        return;
      }

      // avoid smooth behavior if not required
      if (shouldBailOut(arguments[0]) === true) {
        original.scroll.call(
          w,
          arguments[0].left !== undefined
            ? arguments[0].left
            : typeof arguments[0] !== 'object'
              ? arguments[0]
              : w.scrollX || w.pageXOffset,
          // use top prop, second argument if present or fallback to scrollY
          arguments[0].top !== undefined
            ? arguments[0].top
            : arguments[1] !== undefined
              ? arguments[1]
              : w.scrollY || w.pageYOffset
        );

        return;
      }

      // LET THE SMOOTHNESS BEGIN!
      smoothScroll.call(
        w,
        d.body,
        arguments[0].left !== undefined
          ? ~~arguments[0].left
          : w.scrollX || w.pageXOffset,
        arguments[0].top !== undefined
          ? ~~arguments[0].top
          : w.scrollY || w.pageYOffset
      );
    };

    // w.scrollBy
    w.scrollBy = function() {
      // avoid action when no arguments are passed
      if (arguments[0] === undefined) {
        return;
      }

      // avoid smooth behavior if not required
      if (shouldBailOut(arguments[0])) {
        original.scrollBy.call(
          w,
          arguments[0].left !== undefined
            ? arguments[0].left
            : typeof arguments[0] !== 'object' ? arguments[0] : 0,
          arguments[0].top !== undefined
            ? arguments[0].top
            : arguments[1] !== undefined ? arguments[1] : 0
        );

        return;
      }

      // LET THE SMOOTHNESS BEGIN!
      smoothScroll.call(
        w,
        d.body,
        ~~arguments[0].left + (w.scrollX || w.pageXOffset),
        ~~arguments[0].top + (w.scrollY || w.pageYOffset)
      );
    };

    // Element.prototype.scroll and Element.prototype.scrollTo
    Element.prototype.scroll = Element.prototype.scrollTo = function() {
      // avoid action when no arguments are passed
      if (arguments[0] === undefined) {
        return;
      }

      // avoid smooth behavior if not required
      if (shouldBailOut(arguments[0]) === true) {
        // if one number is passed, throw error to match Firefox implementation
        if (typeof arguments[0] === 'number' && arguments[1] === undefined) {
          throw new SyntaxError('Value could not be converted');
        }

        original.elementScroll.call(
          this,
          // use left prop, first number argument or fallback to scrollLeft
          arguments[0].left !== undefined
            ? ~~arguments[0].left
            : typeof arguments[0] !== 'object' ? ~~arguments[0] : this.scrollLeft,
          // use top prop, second argument or fallback to scrollTop
          arguments[0].top !== undefined
            ? ~~arguments[0].top
            : arguments[1] !== undefined ? ~~arguments[1] : this.scrollTop
        );

        return;
      }

      var left = arguments[0].left;
      var top = arguments[0].top;

      // LET THE SMOOTHNESS BEGIN!
      smoothScroll.call(
        this,
        this,
        typeof left === 'undefined' ? this.scrollLeft : ~~left,
        typeof top === 'undefined' ? this.scrollTop : ~~top
      );
    };

    // Element.prototype.scrollBy
    Element.prototype.scrollBy = function() {
      // avoid action when no arguments are passed
      if (arguments[0] === undefined) {
        return;
      }

      // avoid smooth behavior if not required
      if (shouldBailOut(arguments[0]) === true) {
        original.elementScroll.call(
          this,
          arguments[0].left !== undefined
            ? ~~arguments[0].left + this.scrollLeft
            : ~~arguments[0] + this.scrollLeft,
          arguments[0].top !== undefined
            ? ~~arguments[0].top + this.scrollTop
            : ~~arguments[1] + this.scrollTop
        );

        return;
      }

      this.scroll({
        left: ~~arguments[0].left + this.scrollLeft,
        top: ~~arguments[0].top + this.scrollTop,
        behavior: arguments[0].behavior
      });
    };

    // Element.prototype.scrollIntoView
    Element.prototype.scrollIntoView = function() {
      // avoid smooth behavior if not required
      if (shouldBailOut(arguments[0]) === true) {
        original.scrollIntoView.call(
          this,
          arguments[0] === undefined ? true : arguments[0]
        );

        return;
      }

      // LET THE SMOOTHNESS BEGIN!
      var scrollableParent = findScrollableParent(this);
      var parentRects = scrollableParent.getBoundingClientRect();
      var clientRects = this.getBoundingClientRect();

      if (scrollableParent !== d.body) {
        // reveal element inside parent
        smoothScroll.call(
          this,
          scrollableParent,
          scrollableParent.scrollLeft + clientRects.left - parentRects.left,
          scrollableParent.scrollTop + clientRects.top - parentRects.top
        );

        // reveal parent in viewport unless is fixed
        if (w.getComputedStyle(scrollableParent).position !== 'fixed') {
          w.scrollBy({
            left: parentRects.left,
            top: parentRects.top,
            behavior: 'smooth'
          });
        }
      } else {
        // reveal element in viewport
        w.scrollBy({
          left: clientRects.left,
          top: clientRects.top,
          behavior: 'smooth'
        });
      }
    };
  }

  if (typeof exports === 'object' && typeof module !== 'undefined') {
    // commonjs
    module.exports = { polyfill: polyfill };
  } else {
    // global
    polyfill();
  }

}());

},{}],3:[function(require,module,exports){
module.exports=[
  {
    "name": "Agence FAR",
    "address": "48 AV des forces armee royales",
    "city": "casablanca",
    "type": "agence",
    "coords": {
      "email": "jhondoe@gmail.com",
      "phone": "0618661866",
      "fax": "0618661866",
      "gps": {
        "lang": 33.5519556,
        "lat": -7.6913644
      }
    },
    "extension": {
      "name": "Al-bouchra Casanearshore",
      "address": "48 AV des forces armee royales"
    },
    "timetable": {
      "monday": "08:05-12:05 | 14:00-17:15",
      "tuesday": "08:05-12:05 | 14:00-17:15",
      "wednesday": "08:05-12:05 | 14:00-17:15",
      "thursday": "08:05-12:05 | 14:00-17:15",
      "friday": "08:05-12:05 | 14:00-17:15",
      "saturday": "08:05-12:05 | 14:00-17:15",
      "sunday": "08:05-12:05 | 14:00-17:15"
    }
  },
  {
    "name": "Agence SEIZE (16) NOVEMBRE",
    "address": "3 Place du 16 novembre",
    "city": "casablanca",
    "type": "agence",
    "coords": {
      "email": "jhondoe@gmail.com",
      "phone": "0618661866",
      "fax": "0618661866",
      "gps": {
        "lang": 33.561111,
        "lat": -7.6487924
      }
    },
    "extension": {
      "name": "Al-bouchra Casanearshore",
      "address": "48 AV des forces armee royales"
    },
    "timetable": {
      "monday": "08:05-12:05 | 14:00-17:15",
      "tuesday": "08:05-12:05 | 14:00-17:15",
      "wednesday": "08:05-12:05 | 14:00-17:15",
      "thursday": "08:05-12:05 | 14:00-17:15",
      "friday": "08:05-12:05 | 14:00-17:15",
      "saturday": "08:05-12:05 | 14:00-17:15",
      "sunday": "08:05-12:05 | 14:00-17:15"
    }
  },
  {
    "name": "Agence FAR",
    "address": "Agence ZERKTOUNI",
    "city": "casablanca",
    "type": "centres-affaires",
    "coords": {
      "email": "jhondoe@gmail.com",
      "phone": "0618661866",
      "fax": "0618661866",
      "gps": {
        "lang": 33.5845672,
        "lat": -7.6299096
      }
    },
    "extension": {
      "name": "Al-bouchra Casanearshore",
      "address": "48 AV des forces armee royales"
    },
    "timetable": {
      "monday": "08:05-12:05 | 14:00-17:15",
      "tuesday": "08:05-12:05 | 14:00-17:15",
      "wednesday": "08:05-12:05 | 14:00-17:15",
      "thursday": "08:05-12:05 | 14:00-17:15",
      "friday": "08:05-12:05 | 14:00-17:15",
      "saturday": "08:05-12:05 | 14:00-17:15",
      "sunday": "08:05-12:05 | 14:00-17:15"
    }
  },
  {
    "name": "Agence ROMANDIE",
    "address": "3 et 4,Imm Romandie II boulvard Bir anzarane",
    "city": "casablanca",
    "type": "agence",
    "coords": {
      "email": "jhondoe@gmail.com",
      "phone": "0618661866",
      "fax": "0618661866",
      "gps": {
        "lang": 33.5722678,
        "lat": -7.629223
      }
    },
    "extension": {
      "name": "Al-bouchra Casanearshore",
      "address": "48 AV des forces armee royales"
    },
    "timetable": {
      "monday": "08:05-12:05 | 14:00-17:15",
      "tuesday": "08:05-12:05 | 14:00-17:15",
      "wednesday": "08:05-12:05 | 14:00-17:15",
      "thursday": "08:05-12:05 | 14:00-17:15",
      "friday": "08:05-12:05 | 14:00-17:15",
      "saturday": "08:05-12:05 | 14:00-17:15",
      "sunday": "08:05-12:05 | 14:00-17:15"
    }
  },
  {
    "name": "Agence HAJ OMAR ABDELJALIL",
    "address": "KM 7, 3 Route de Rabat Ain sbaa",
    "city": "casablanca",
    "type": "reseau-etranger",
    "coords": {
      "email": "jhondoe@gmail.com",
      "phone": "0618661866",
      "fax": "0618661866",
      "gps": {
        "lang": 33.5810336,
        "lat": -7.5814015
      }
    },
    "extension": {
      "name": "Al-bouchra Casanearshore",
      "address": "48 AV des forces armee royales"
    },
    "timetable": {
      "monday": "08:05-12:05 | 14:00-17:15",
      "tuesday": "08:05-12:05 | 14:00-17:15",
      "wednesday": "08:05-12:05 | 14:00-17:15",
      "thursday": "08:05-12:05 | 14:00-17:15",
      "friday": "08:05-12:05 | 14:00-17:15",
      "saturday": "08:05-12:05 | 14:00-17:15",
      "sunday": "08:05-12:05 | 14:00-17:15"
    }
  },
  {
    "name": "Agence PORTE D’ANFA",
    "address": "N° 4 ANG BD D’anfa et rue moulay rachid BP 245",
    "city": "casablanca",
    "type": "agence",
    "coords": {
      "email": "jhondoe@gmail.com",
      "phone": "0618661866",
      "fax": "0618661866",
      "gps": {
        "lang": 33.57309,
        "lat": -7.6286979
      }
    },
    "extension": {
      "name": "Al-bouchra Casanearshore",
      "address": "48 AV des forces armee royales"
    },
    "timetable": {
      "monday": "08:05-12:05 | 14:00-17:15",
      "tuesday": "08:05-12:05 | 14:00-17:15",
      "wednesday": "08:05-12:05 | 14:00-17:15",
      "thursday": "08:05-12:05 | 14:00-17:15",
      "friday": "08:05-12:05 | 14:00-17:15",
      "saturday": "08:05-12:05 | 14:00-17:15",
      "sunday": "08:05-12:05 | 14:00-17:15"
    }
  },
  {
    "name": "Agence Omar",
    "address": "3 et 4,Imm Romandie II boulvard Bir anzarane",
    "city": "casablanca",
    "type": "gab",
    "coords": {
      "email": "jhondoe@gmail.com",
      "phone": "0618661866",
      "fax": "0618661866",
      "gps": {
        "lang": 33.5617623,
        "lat": -7.6248136
      }
    },
    "extension": {
      "name": "Al-bouchra Casanearshore",
      "address": "48 AV des forces armee royales"
    },
    "timetable": {
      "monday": "08:05-12:05 | 14:00-17:15",
      "tuesday": "08:05-12:05 | 14:00-17:15",
      "wednesday": "08:05-12:05 | 14:00-17:15",
      "thursday": "08:05-12:05 | 14:00-17:15",
      "friday": "08:05-12:05 | 14:00-17:15",
      "saturday": "08:05-12:05 | 14:00-17:15",
      "sunday": "08:05-12:05 | 14:00-17:15"
    }
  },
  {
    "name": "Agence HAJ OMAR ",
    "address": "KM 7, 3 Route de Rabat Ain sbaa",
    "city": "rabat",
    "type": "gab",
    "coords": {
      "email": "jhondoe@gmail.com",
      "phone": "0618661866",
      "fax": "0618661866",
      "gps": {
        "lang": 33.5856297,
        "lat": -7.6216577
      }
    },
    "extension": {
      "name": "Al-bouchra Casanearshore",
      "address": "48 AV des forces armee royales"
    },
    "timetable": {
      "monday": "08:05-12:05 | 14:00-17:15",
      "tuesday": "08:05-12:05 | 14:00-17:15",
      "wednesday": "08:05-12:05 | 14:00-17:15",
      "thursday": "08:05-12:05 | 14:00-17:15",
      "friday": "08:05-12:05 | 14:00-17:15",
      "saturday": "08:05-12:05 | 14:00-17:15",
      "sunday": "08:05-12:05 | 14:00-17:15"
    }
  },
  {
    "name": "Agence PORTE Rabat",
    "address": "N° 4 ANG BD D’anfa et rue moulay rachid BP 245",
    "city": "tanger",
    "type": "centres-affaires",
    "coords": {
      "email": "jhondoe@gmail.com",
      "phone": "0618661866",
      "fax": "0618661866",
      "gps": {
        "lang": 33.5955389,
        "lat": -7.6459343
      }
    },
    "timetable": {
      "monday": "08:05-12:05 | 14:00-17:15",
      "tuesday": "08:05-12:05 | 14:00-17:15",
      "wednesday": "08:05-12:05 | 14:00-17:15",
      "thursday": "08:05-12:05 | 14:00-17:15",
      "friday": "08:05-12:05 | 14:00-17:15",
      "saturday": "08:05-12:05 | 14:00-17:15",
      "sunday": "08:05-12:05 | 14:00-17:15"
    },
    "extension": {
      "name": "Al-bouchra Casanearshore",
      "address": "48 AV des forces armee royales"
    }
  },
  {
    "name": "Agence PORTE Rabat",
    "address": "N° 4 ANG BD D’anfa et rue moulay rachid BP 245",
    "city": "tanger",
    "type": "centres-affaires",
    "coords": {
      "email": "jhondoe@gmail.com",
      "phone": "0618661866",
      "fax": "0618661866",
      "gps": {
        "lang": 33.5955389,
        "lat": -7.6459343
      }
    },
    "timetable": {
      "monday": "08:05-12:05 | 14:00-17:15",
      "tuesday": "08:05-12:05 | 14:00-17:15",
      "wednesday": "08:05-12:05 | 14:00-17:15",
      "thursday": "08:05-12:05 | 14:00-17:15",
      "friday": "08:05-12:05 | 14:00-17:15",
      "saturday": "08:05-12:05 | 14:00-17:15",
      "sunday": "08:05-12:05 | 14:00-17:15"
    },
    "extension": {
      "name": "Al-bouchra Casanearshore",
      "address": "48 AV des forces armee royales"
    }
  },
  {
    "name": "Agence PORTE Rabat",
    "address": "N° 4 ANG BD D’anfa et rue moulay rachid BP 245",
    "city": "tanger",
    "type": "centres-affaires",
    "coords": {
      "email": "jhondoe@gmail.com",
      "phone": "0618661866",
      "fax": "0618661866",
      "gps": {
        "lang": 33.9682971,
        "lat": -6.8651172
      }
    },
    "timetable": {
      "monday": "08:05-12:05 | 14:00-17:15",
      "tuesday": "08:05-12:05 | 14:00-17:15",
      "wednesday": "08:05-12:05 | 14:00-17:15",
      "thursday": "08:05-12:05 | 14:00-17:15",
      "friday": "08:05-12:05 | 14:00-17:15",
      "saturday": "08:05-12:05 | 14:00-17:15",
      "sunday": "08:05-12:05 | 14:00-17:15"
    },
    "extension": {
      "name": "Al-bouchra Casanearshore",
      "address": "48 AV des forces armee royales"
    }
  },
  {
    "name": "Agence Riyad ",
    "address": "N° 4 ANG BD D’anfa et rue moulay rachid BP 245",
    "city": "tanger",
    "type": "centres-affaires",
    "coords": {
      "email": "jhondoe@gmail.com",
      "phone": "0618661866",
      "fax": "0618661866",
      "gps": {
        "lang": 33.9613158,
        "lat": -6.8763179
      }
    },
    "timetable": {
      "monday": "08:05-12:05 | 14:00-17:15",
      "tuesday": "08:05-12:05 | 14:00-17:15",
      "wednesday": "08:05-12:05 | 14:00-17:15",
      "thursday": "08:05-12:05 | 14:00-17:15",
      "friday": "08:05-12:05 | 14:00-17:15",
      "saturday": "08:05-12:05 | 14:00-17:15",
      "sunday": "08:05-12:05 | 14:00-17:15"
    },
    "extension": {
      "name": "Al-bouchra Casanearshore",
      "address": "48 AV des forces armee royales"
    }
  },
  {
    "name": "Agence Hay Rabat",
    "address": "N° 4 ANG BD D’anfa et rue moulay rachid BP 245",
    "city": "tanger",
    "type": "centres-affaires",
    "coords": {
      "email": "jhondoe@gmail.com",
      "phone": "0618661866",
      "fax": "0618661866",
      "gps": {
        "lang": 33.9599933,
        "lat": -6.8854988
      }
    },
    "timetable": {
      "monday": "08:05-12:05 | 14:00-17:15",
      "tuesday": "08:05-12:05 | 14:00-17:15",
      "wednesday": "08:05-12:05 | 14:00-17:15",
      "thursday": "08:05-12:05 | 14:00-17:15",
      "friday": "08:05-12:05 | 14:00-17:15",
      "saturday": "08:05-12:05 | 14:00-17:15",
      "sunday": "08:05-12:05 | 14:00-17:15"
    },
    "extension": {
      "name": "Al-bouchra Casanearshore",
      "address": "48 AV des forces armee royales"
    }
  }
]

},{}],4:[function(require,module,exports){
'use strict';

var _index = require('../../components/select-filter/index.js');

var _index2 = _interopRequireDefault(_index);

var _index3 = require('../../components/top-header/index.js');

var _index4 = _interopRequireDefault(_index3);

var _index5 = require('../../components/header/index.js');

var _index6 = _interopRequireDefault(_index5);

var _index7 = require('../../components/footer/index.js');

var _index8 = _interopRequireDefault(_index7);

var _cardSlider = require('../../components/card/card-slider.js');

var _cardSlider2 = _interopRequireDefault(_cardSlider);

var _dateSlider = require('../../components/date-slider/date-slider.js');

var _dateSlider2 = _interopRequireDefault(_dateSlider);

var _index9 = require('../../components/logo-slider/index.js');

var _index10 = _interopRequireDefault(_index9);

var _index11 = require('../../components/finance/index.js');

var _index12 = _interopRequireDefault(_index11);

var _filter = require('../../components/finance/filter.js');

var _filter2 = _interopRequireDefault(_filter);

var _index13 = require('../../components/nos-banques/index.js');

var _index14 = _interopRequireDefault(_index13);

var _index15 = require('../../components/home-slider/index.js');

var _index16 = _interopRequireDefault(_index15);

var _index17 = require('../../components/besoin-aide/index.js');

var _index18 = _interopRequireDefault(_index17);

var _index19 = require('../../components/swipebox/index.js');

var _index20 = _interopRequireDefault(_index19);

var _index21 = require('../../components/article-slider/index.js');

var _index22 = _interopRequireDefault(_index21);

var _cardRapport = require('../../components/card/card-rapport/card-rapport.js');

var _cardRapport2 = _interopRequireDefault(_cardRapport);

var _index23 = require('../../components/popup-search/index.js');

var _index24 = _interopRequireDefault(_index23);

var _filter3 = require('../../components/popup-search/filter.js');

var _filter4 = _interopRequireDefault(_filter3);

var _index25 = require('../../components/popup-video/index.js');

var _index26 = _interopRequireDefault(_index25);

var _index27 = require('../../components/actualite-slider/index.js');

var _index28 = _interopRequireDefault(_index27);

var _index29 = require('../../components/pub-slider/index.js');

var _index30 = _interopRequireDefault(_index29);

var _formValidation = require('../../components/form/form-validation.js');

var _formValidation2 = _interopRequireDefault(_formValidation);

var _formUpload = require('../../components/form/form-upload.js');

var _formUpload2 = _interopRequireDefault(_formUpload);

var _cardActualites = require('../../components/card/card-actualites.js');

var _cardActualites2 = _interopRequireDefault(_cardActualites);

var _cardHistoire = require('../../components/card/card-histoire.js');

var _cardHistoire2 = _interopRequireDefault(_cardHistoire);

var _index31 = require('../../components/appel-offres/index.js');

var _index32 = _interopRequireDefault(_index31);

var _index33 = require('../../components/map/index.js');

var _index34 = _interopRequireDefault(_index33);

var _index35 = require('../../components/timeline/index.js');

var _index36 = _interopRequireDefault(_index35);

var _index37 = require('../../components/map-control/index.js');

var _smoothscrollPolyfill = require('smoothscroll-polyfill');

var _smoothscrollPolyfill2 = _interopRequireDefault(_smoothscrollPolyfill);

var _index38 = require('../../components/actualites/index.js');

var _index39 = _interopRequireDefault(_index38);

var _index40 = require('../../components/mediacenter/index.js');

var _index41 = _interopRequireDefault(_index40);

var _index42 = require('../../components/communiques/index.js');

var _index43 = _interopRequireDefault(_index42);

var _index44 = require('../../components/result/index.js');

var _index45 = _interopRequireDefault(_index44);

var _index46 = require('../../components/media-gallery/index.js');

var _index47 = _interopRequireDefault(_index46);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

$(document).ready(function () {
  _smoothscrollPolyfill2.default.polyfill();

  if (typeof NodeList.prototype.forEach !== 'function') {
    NodeList.prototype.forEach = Array.prototype.forEach;
  }

  if (!String.prototype.includes) {
    Array.prototype.includes = function (search, start) {
      if (typeof start !== 'number') {
        start = 0;
      }
      if (start + search.length > this.length) {
        return false;
      } else {
        return this.indexOf(search, start) !== -1;
      }
    };
  }

  (0, _index2.default)();
  (0, _index4.default)();
  (0, _index6.default)();
  (0, _index8.default)();
  (0, _cardSlider2.default)();
  (0, _filter2.default)();
  (0, _dateSlider2.default)();
  (0, _index10.default)();
  (0, _index12.default)();
  (0, _index14.default)();
  (0, _index16.default)();
  (0, _index18.default)();
  (0, _index20.default)();
  (0, _index22.default)();
  (0, _cardRapport2.default)();
  (0, _index24.default)();
  (0, _index26.default)();
  (0, _index28.default)();
  (0, _index30.default)();
  (0, _formValidation2.default)();
  (0, _formUpload2.default)();
  (0, _cardActualites2.default)();
  (0, _cardHistoire2.default)();
  (0, _index34.default)();
  (0, _index37.mapControl)();
  (0, _index37.toggleControl)();
  (0, _index36.default)();
  (0, _index39.default)();
  (0, _index32.default)();
  (0, _index41.default)();
  (0, _index43.default)();
  (0, _filter4.default)();
  (0, _index45.default)();
  (0, _index47.default)();
});

},{"../../components/actualite-slider/index.js":5,"../../components/actualites/index.js":6,"../../components/appel-offres/index.js":7,"../../components/article-slider/index.js":8,"../../components/besoin-aide/index.js":9,"../../components/card/card-actualites.js":10,"../../components/card/card-histoire.js":11,"../../components/card/card-rapport/card-rapport.js":12,"../../components/card/card-slider.js":13,"../../components/communiques/index.js":14,"../../components/date-slider/date-slider.js":16,"../../components/finance/filter.js":17,"../../components/finance/index.js":18,"../../components/footer/index.js":19,"../../components/form/form-upload.js":20,"../../components/form/form-validation.js":21,"../../components/header/index.js":22,"../../components/home-slider/index.js":23,"../../components/logo-slider/index.js":24,"../../components/map-control/index.js":25,"../../components/map/index.js":26,"../../components/media-gallery/index.js":27,"../../components/mediacenter/index.js":28,"../../components/nos-banques/index.js":29,"../../components/popup-search/filter.js":30,"../../components/popup-search/index.js":31,"../../components/popup-video/index.js":32,"../../components/pub-slider/index.js":33,"../../components/result/index.js":34,"../../components/select-filter/index.js":35,"../../components/swipebox/index.js":36,"../../components/timeline/index.js":37,"../../components/top-header/index.js":38,"smoothscroll-polyfill":2}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function () {
  if ($('.actualite-slider').length) {

    var rtl = $('html').attr('dir') == 'rtl';

    if ($(window).width() > 991) {
      articleSlider(0, rtl);
    } else {
      articleSlider(0, rtl);
    }

    $(window).on('resize', function () {
      if ($(window).width() > 991) {
        articleSlider(0, rtl);
      } else {
        articleSlider(0, rtl);
      }
    });
  }

  function articleSlider(stagePadding, rtl) {
    $('.actualite-slider.owl-carousel').owlCarousel({
      stagePadding: stagePadding,
      margin: 18,
      dots: true,
      nav: true,
      merge: true,
      loop: true,
      rtl: rtl,
      responsive: {
        0: {
          items: 1
        },
        992: {
          items: 3
        }
      }
    });
  }
};

},{}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.default = function () {
  var tagFilters = document.querySelectorAll('#actualite-filters a');
  var actualiteHolder = document.querySelector('#actualite-holder');
  var startDate = document.querySelector('.start');
  var endDate = document.querySelector('.end');
  var allFilterBtn = document.querySelector('#actualite-filter-all');

  if (tagFilters.length <= 0 || !actualiteHolder) return;

  var state = {
    filters: [],
    dateFilter: {
      from: '',
      to: ''
    },
    order: 'desc',
    max: 3,
    data: [{
      type: 'article-img',
      tags: ['RSE', 'FINANCE', 'ENTREPRENARIAT'],
      date: '21/07/2017',
      title: 'une ambiance festive et familiale que s’est déroulé',
      content: 'Le Groupe BCP, acteur panafricain de référence, et la Société FinaTncière Internationale (IFC)...',
      image: 'assets/img/actu-2.png'
    }, {
      type: 'annonce',
      tags: ['RSE'],
      date: '29/07/2017',
      content: 'A l\u2019occasion de la Journ\xE9e Internationale de la Femme, la <a href="https://twitter.com/hashtag/Banque_Populaire" target="_blank">#Banque_Populaire</a> pr\xE9sente \xE0 toutes les femmes ses v\u0153ux les plus sinc\xE8res de r\xE9ussite et de prosp\xE9rit\xE9. <a href="https://twitter.com/hashtag/8mars"  target="_blank">#8mars</a> <a href="https://twitter.com/hashtag/corpo"  target="_blank">#corpo</a>\n        '
    }, {
      type: 'article',
      tags: ['RSE', 'ENTREPRENARIAT'],
      date: '22/07/2017',
      title: 'une ambiance festive et familiale que s’est déroulé',
      content: 'Le Groupe BCP, acteur panafricain de référence, et la Société FinaTncière Internationale (IFC)...'
    }, {
      type: 'article',
      tags: ['RSE', 'DEVELOPPEMENT DURABLE'],
      date: '23/07/2017',
      title: 'une ambiance festive et familiale que s’est déroulé',
      content: 'Le Groupe BCP, acteur panafricain de référence, et la Société FinaTncière Internationale (IFC)...'
    }, {
      type: 'article',
      tags: ['RSE'],
      date: '21/07/2017',
      title: 'une ambiance festive et familiale que s’est déroulé',
      content: 'Le Groupe BCP, acteur panafricain de référence, et la Société FinaTncière Internationale (IFC)...'
    }, {
      type: 'article',
      tags: ['RSE', 'FINANCE'],
      date: '24/07/2017',
      title: 'une ambiance festive et familiale que s’est déroulé',
      content: 'Le Groupe BCP, acteur panafricain de référence, et la Société FinaTncière Internationale (IFC)...'
    }, {
      type: 'article-img',
      tags: ['RSE', 'FINANCE'],
      date: '25/07/2017',
      title: 'une ambiance festive et familiale que s’est déroulé',
      content: 'Le Groupe BCP, acteur panafricain de référence, et la Société FinaTncière Internationale (IFC)...',
      image: 'assets/img/actu-1.png'
    }, {
      type: 'article',
      tags: ['RSE'],
      date: '26/07/2017',
      title: 'une ambiance festive et familiale que s’est déroulé',
      content: 'Le Groupe BCP, acteur panafricain de référence, et la Société FinaTncière Internationale (IFC)...'
    }, {
      type: 'article',
      tags: ['RSE', 'FINANCE'],
      date: '21/07/2017',
      title: 'une ambiance festive et familiale que s’est déroulé',
      content: 'Le Groupe BCP, acteur panafricain de référence, et la Société FinaTncière Internationale (IFC)...'
    }, {
      type: 'article-img',
      tags: ['RSE', 'FINANCE'],
      date: '21/08/2017',
      title: 'une ambiance festive et familiale que s’est déroulé',
      content: 'Le Groupe BCP, acteur panafricain de référence, et la Société FinaTncière Internationale (IFC)...',
      image: 'assets/img/actu-1.png'
    }, {
      type: 'article',
      tags: ['RSE'],
      date: '22/08/2016',
      title: 'une ambiance festive et familiale que s’est déroulé',
      content: 'Le Groupe BCP, acteur panafricain de référence, et la Société FinaTncière Internationale (IFC)...'
    }, {
      type: 'article',
      tags: ['RSE', 'FINANCE'],
      date: '21/09/2017',
      title: 'une ambiance festive et familiale que s’est déroulé',
      content: 'Le Groupe BCP, acteur panafricain de référence, et la Société FinaTncière Internationale (IFC)...'
    }, {
      type: 'article-img',
      tags: ['RSE', 'FINANCE'],
      date: '21/10/2017',
      title: 'une ambiance festive et familiale que s’est déroulé',
      content: 'Le Groupe BCP, acteur panafricain de référence, et la Société FinaTncière Internationale (IFC)...',
      image: 'assets/img/actu-1.png'
    }, {
      type: 'article',
      tags: ['RSE', 'FINANCE'],
      date: '21/07/2018',
      title: 'une ambiance festive et familiale que s’est déroulé',
      content: 'Le Groupe BCP, acteur panafricain de référence, et la Société FinaTncière Internationale (IFC)...'
    }, {
      type: 'article-img',
      tags: ['RSE', 'FINANCE'],
      date: '21/07/2018',
      title: 'une ambiance festive et familiale que s’est déroulé',
      content: 'Le Groupe BCP, acteur panafricain de référence, et la Société FinaTncière Internationale (IFC)...',
      image: 'assets/img/actu-1.png'
    }, {
      type: 'article',
      tags: ['RSE', 'FINANCE'],
      date: '21/07/2019',
      title: 'une ambiance festive et familiale que s’est déroulé',
      content: 'Le Groupe BCP, acteur panafricain de référence, et la Société FinaTncière Internationale (IFC)...'
    }, {
      type: 'article-img',
      tags: ['RSE', 'FINANCE'],
      date: '21/07/2020',
      title: 'une ambiance festive et familiale que s’est déroulé',
      content: 'Le Groupe BCP, acteur panafricain de référence, et la Société FinaTncière Internationale (IFC)...',
      image: 'assets/img/actu-1.png'
    }]
  };

  function cleanTag(tagFilter) {
    tagFilter = tagFilter.trim().toLowerCase();
    if (tagFilter[0] == '#') {
      return tagFilter.slice(1);
    }

    return tagFilter;
  }

  function makeDateObject(dateString) {
    var _dateString$split = dateString.split('/'),
        _dateString$split2 = _slicedToArray(_dateString$split, 3),
        day = _dateString$split2[0],
        month = _dateString$split2[1],
        year = _dateString$split2[2];

    return new Date(year, month - 1, day);
  }

  function applyFilters() {
    var data = state.data;
    if (state.filters.length > 0) {
      data = data.filter(function (post) {
        for (var i = 0; i < state.filters.length; i++) {
          if (post.tags.includes(state.filters[i].toUpperCase())) {
            return true;
          }
        }
        return false;
      });
    }

    if (state.dateFilter.from && state.dateFilter.to) {
      data = data.filter(function (post) {
        if (makeDateObject(post.date) - makeDateObject(state.dateFilter.from) >= 0 && makeDateObject(post.date) - makeDateObject(state.dateFilter.to) <= 0) {
          return true;
        }

        return false;
      });
    }

    data = data.sort(function (a, b) {
      return state.order == 'desc' ? makeDateObject(b.date) - makeDateObject(a.date) : makeDateObject(a.date) - makeDateObject(b.date);
    });

    showSelected(data);
  }
  function changeFilters(e) {
    e.preventDefault();

    this.classList.toggle('active');

    state.filters = [];

    tagFilters.forEach(function (tag) {
      if ($(tag).hasClass('active')) {
        state.filters.push(cleanTag(tag.innerText));
      }
    });

    if (state.filters.length > 0) {
      allFilterBtn.classList.remove('active');
    } else {
      allFilterBtn.classList.add('active');
    }

    applyFilters();
  }

  function showSelected(data) {
    var selectedData = data.slice(0, state.max * 3);

    if (selectedData.length >= data.length) {
      $('#more-actualite').hide();
    } else {
      $('#more-actualite').show();
    }

    render(selectedData);
  }

  applyFilters();

  $('#more-actualite').on('click', function (e) {
    e.preventDefault();
    state.max++;
    applyFilters();

    this.scrollIntoView({
      behavior: 'smooth',
      inline: 'end'
    });
    if (state.max + 1 > state.data.length / 3) $(this).hide();
  });

  function render(data) {
    actualiteHolder.innerHTML = data.map(function (post) {
      if (post.type === 'article') {
        return '\n          <div class="col-12 col-lg-4 mb-2">\n          <div class="card card--actualites">\n          <div class="card_tags">\n            ' + post.tags.map(function (tag) {
          return '<a class="btn btn--tag btn--orange mr-1" href="/gbp-front/actualites.html">\n                    #' + tag + '\n                  </a>';
        }).join('') + '\n          </div>\n          <p class="card_date">\n              ' + post.date + '\n          </p>\n          <a class="card_title" href="/gbp-front/news-detail.html">\n          ' + post.title + '\n        </a>\n          <p class="card_desc">\n            ' + post.content + '\n          </p>\n          <div class="clearfix position-relative">\n              <a class="card_link" href="/gbp-front/news-detail.html">\n            en savoir plus\n          </a>\n              <a class="card_share" href="/dist/news-detail.html">\n                  <svg>\n                      <use xlink:href="#icon-share-symbol"></use>\n                  </svg>\n              </a>\n              <ul class="share">\n                      <li>\n                          <a href="https://www.facebook.com/share.php?u=" onclick="javascript:window.open(this.href,\'\', \'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=600,width=600\');return false;">\n                              <svg class="fb">\n                                  <use xlink:href="#icon-facebook"></use>\n                              </svg>\n                          </a>\n                      </li>\n                      <li>\n                          <a href="https://twitter.com/intent/tweet?text=text-partage&amp;url=" onclick="javascript:window.open(this.href,\'\', \'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=600,width=600\');return false;">\n                              <svg class="twitter">\n                                  <use xlink:href="#icon-twitter"></use>\n                              </svg>\n                          </a>\n                      </li>\n                      <li>\n                          <a href="https://plus.google.com/share?url=https://plus.google.com">\n                              <svg>\n                                  <use xlink:href="#icon-google-plus"></use>\n                              </svg>\n                          </a>\n                      </li>\n                      <li>\n                          <a href="https://api.whatsapp.com/send?text=text-whatsapp&amp;url=">\n                              <svg>\n                                  <use xlink:href="#icon-whatsapp"></use>\n                              </svg>\n                          </a>\n                      </li>\n                  </ul>\n          </div>\n      </div>\n          </div>\n          ';
      } else if (post.type === 'article-img') {
        return '\n          <div class="col-12 col-lg-8 mb-2"><div class="card card--actualites card--actualites-img clearfix">\n          <a class="img-wrapper" href="/gbp-front/news-detail.html">\n              <img src="' + post.image + '" alt="">\n          </a>\n          <div class="wrapper">\n              <div class="card_tags">\n              ' + post.tags.map(function (tag) {
          return '<a class="btn btn--tag btn--orange mr-1" href="/gbp-front/actualites.html">\n                        #' + tag + '\n                      </a>';
        }).join('') + '\n              </div>\n              <p class="card_date">\n                  ' + post.date + '\n              </p>\n              <a class="card_title" href="/gbp-front/news-detail.html">\n                ' + post.title + '\n          </a>\n              <p class="card_desc">\n              ' + post.content + '\n              </p>\n              <div class="clearfix position-relative">\n                  <a class="card_link" href="/gbp-front/news-detail.html">\n              en savoir plus\n            </a>\n                  <a class="card_share" href="#">\n                      <svg>\n                          <use xlink:href="#icon-share-symbol"></use>\n                      </svg>\n                  </a>\n                  <ul class="share">\n                      <li>\n                          <a href="https://www.facebook.com/share.php?u=" onclick="javascript:window.open(this.href,\'\', \'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=600,width=600\');return false;">\n                              <svg class="fb">\n                                  <use xlink:href="#icon-facebook"></use>\n                              </svg>\n                          </a>\n                      </li>\n                      <li>\n                          <a href="https://twitter.com/intent/tweet?text=text-partage&amp;url=" onclick="javascript:window.open(this.href,\'\', \'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=600,width=600\');return false;">\n                              <svg class="twitter">\n                                  <use xlink:href="#icon-twitter"></use>\n                              </svg>\n                          </a>\n                      </li>\n                      <li>\n                          <a href="https://plus.google.com/share?url=https://plus.google.com">\n                              <svg>\n                                  <use xlink:href="#icon-google-plus"></use>\n                              </svg>\n                          </a>\n                      </li>\n                      <li>\n                          <a href="https://api.whatsapp.com/send?text=text-whatsapp&amp;url=">\n                              <svg>\n                                  <use xlink:href="#icon-whatsapp"></use>\n                              </svg>\n                          </a>\n                      </li>\n                  </ul>\n              </div>\n          </div>\n      </div></div>\n          ';
      } else {
        return '\n          <div class="col-12 col-lg-4 mb-2">\n            <div class="card card--actualites card--actualites-annonce">\n              <img src="assets/img/twitter.png" alt="">\n              <p class="card_desc">\n                ' + post.content + '\n              </p>\n              <a class="card_link" href="http://www.twitter.com/BP_Maroc" target="_blank">\n                Twitter.com/BP_Maroc\n              </a>\n           </div>\n          </div>\n          ';
      }
    }).join('');
  }

  function dateFormat(date) {
    return '1/' + (date.month() + 1) + '/' + date.year();
  }

  var startFilter = new _index2.default(startDate, false, function (start) {
    state.dateFilter.from = dateFormat(start);
    applyFilters();
  });
  startFilter.init();

  var endFilter = new _index2.default(endDate, true, function (end) {
    state.dateFilter.to = dateFormat(end);
    applyFilters();
  });
  endFilter.init();

  $('#actualite-select-filter').on('change', function () {
    var selected = $('#actualite-select-filter').next().find('.current').text();
    selected = selected.toLowerCase();

    // console.log(selected)

    $('#date-filter').addClass('d-flex');
    $('#date-filter').show();

    if (selected !== 'période') {
      $('#date-filter').removeClass('d-flex');
      $('#date-filter').hide();
      state.order = 'desc';
      state.dateFilter.from = '';
      state.dateFilter.to = '';
      startFilter.clear();
      endFilter.clear();
    }

    if (selected === 'plus anciens') {
      state.order = 'asc';
      applyFilters();
    } else if (selected === 'plus récents') {
      applyFilters();
      state.order = 'desc';
    }
  });

  allFilterBtn.addEventListener('click', function (e) {
    e.preventDefault();
    state.filters = [];
    tagFilters.forEach(function (tag) {
      tag.classList.remove('active');
    });
    this.classList.add('active');
    applyFilters();
  });
  tagFilters.forEach(function (tag) {
    tag.addEventListener('click', changeFilters);
  });

  $(window).on('scroll', function () {
    var contentHolder = $('#actualite-holder');

    var contentEnd = contentHolder.offset().top + contentHolder.height();

    if ($(this).scrollTop() + $(window).height() - 250 >= contentEnd && state.max * 3 <= state.data.length) {
      state.max++;
      applyFilters();
    }
  });
};

var _index = require('../../components/date-filter/index.js');

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

},{"../../components/date-filter/index.js":15}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function () {
  var appelOffres = document.querySelector('#appel-offres');

  if (!appelOffres) return;

  var state = {
    organisme: '',
    nature: '',
    data: [{
      organisme: 'organisme1',
      nature: 'nature1',
      dates: {
        pub: '12/12/2020',
        depo: '12/12/2022'
      },
      title: 'La Banque Centrale Populaire lance un appel d’offres ouvert relatif au « MARCHE CADRE ACQUISITION DE STYLOS PROMOTIONNELS ».',
      numero: 'N° : AO 014-18 - Prorogation'
    }, {
      organisme: 'organisme1',
      nature: 'nature1',
      dates: {
        pub: '12/12/2020',
        depo: '12/12/2022'
      },
      title: 'La Banque Centrale Populaire lance un appel d’offres ouvert relatif au « MARCHE CADRE ACQUISITION DE STYLOS PROMOTIONNELS ».',
      numero: 'N° : AO 014-18 - Prorogation'
    }, {
      organisme: 'organisme2',
      nature: 'nature1',
      dates: {
        pub: '12/12/2020',
        depo: '12/12/2022'
      },
      title: 'La Banque Centrale Populaire lance un appel d’offres ouvert relatif au « MARCHE CADRE ACQUISITION DE STYLOS PROMOTIONNELS ».',
      numero: 'N° : AO 014-18 - Prorogation'
    }, {
      organisme: 'organisme1',
      nature: 'nature1',
      dates: {
        pub: '12/12/2020',
        depo: '12/12/2022'
      },
      title: 'La Banque Centrale Populaire lance un appel d’offres ouvert relatif au « MARCHE CADRE ACQUISITION DE STYLOS PROMOTIONNELS ».',
      numero: 'N° : AO 014-18 - Prorogation'
    }, {
      organisme: 'organisme1',
      nature: 'nature1',
      dates: {
        pub: '12/12/2020',
        depo: '12/12/2022'
      },
      title: 'La Banque Centrale Populaire lance un appel d’offres ouvert relatif au « MARCHE CADRE ACQUISITION DE STYLOS PROMOTIONNELS ».',
      numero: 'N° : AO 014-18 - Prorogation'
    }, {
      organisme: 'organisme2',
      nature: 'nature1',
      dates: {
        pub: '12/12/2020',
        depo: '12/12/2022'
      },
      title: 'La Banque Centrale Populaire lance un appel d’offres ouvert relatif au « MARCHE CADRE ACQUISITION DE STYLOS PROMOTIONNELS ».',
      numero: 'N° : AO 014-18 - Prorogation'
    }, {
      organisme: 'organisme2',
      nature: 'nature1',
      dates: {
        pub: '12/12/2020',
        depo: '12/12/2022'
      },
      title: 'La Banque Centrale Populaire lance un appel d’offres ouvert relatif au « MARCHE CADRE ACQUISITION DE STYLOS PROMOTIONNELS ».',
      numero: 'N° : AO 014-18 - Prorogation'
    }, {
      organisme: 'organisme3',
      nature: 'nature2',
      dates: {
        pub: '12/12/2020',
        depo: '12/12/2022'
      },
      title: 'La Banque Centrale Populaire lance un appel d’offres ouvert relatif au « MARCHE CADRE ACQUISITION DE STYLOS PROMOTIONNELS ».',
      numero: 'N° : AO 014-18 - Prorogation'
    }, {
      organisme: 'organisme4',
      nature: 'nature1',
      dates: {
        pub: '12/12/2020',
        depo: '12/12/2022'
      },
      title: 'La Banque Centrale Populaire lance un appel d’offres ouvert relatif au « MARCHE CADRE ACQUISITION DE STYLOS PROMOTIONNELS ».',
      numero: 'N° : AO 014-18 - Prorogation'
    }, {
      organisme: 'organisme4',
      nature: 'nature1',
      dates: {
        pub: '12/12/2020',
        depo: '12/12/2022'
      },
      title: 'La Banque Centrale Populaire lance un appel d’offres ouvert relatif au « MARCHE CADRE ACQUISITION DE STYLOS PROMOTIONNELS ».',
      numero: 'N° : AO 014-18 - Prorogation'
    }, {
      organisme: 'organisme5',
      nature: 'nature1',
      dates: {
        pub: '12/12/2020',
        depo: '12/12/2022'
      },
      title: 'La Banque Centrale Populaire lance un appel d’offres ouvert relatif au « MARCHE CADRE ACQUISITION DE STYLOS PROMOTIONNELS ».',
      numero: 'N° : AO 014-18 - Prorogation'
    }, {
      organisme: 'organisme3',
      nature: 'nature1',
      dates: {
        pub: '12/12/2020',
        depo: '12/12/2022'
      },
      title: 'La Banque Centrale Populaire lance un appel d’offres ouvert relatif au « MARCHE CADRE ACQUISITION DE STYLOS PROMOTIONNELS ».',
      numero: 'N° : AO 014-18 - Prorogation'
    }]
  };

  function applyFilter() {
    var data = state.data.filter(function (offer) {
      return state.organisme === offer.organisme && state.nature === offer.nature;
    });

    render(data);
  }

  function render(data) {
    appelOffres.innerHTML = data.map(function (offer) {
      return '<a class="news" href="/gbp-front/news-detail.html">\n                  <div class="news_border">\n                  </div>\n                  <div class="news_content">\n                    <div class="news_date clearfix">\n                      <p class="publication">\n                        Date de publication  : ' + offer.dates.pub + '\n                      </p>\n                      <p class="limite">\n                        Date limite de d\xE9pot de dossier : ' + offer.dates.depo + '\n                      </p>\n                    </div>\n                    <h2 class="news_title">\n                    ' + offer.title + '\n                    </h2>\n                    <p class="news_txt">\n                    ' + offer.numero + '\n                    </p>\n                  </div>\n                </a>';
    }).join('');
  }

  function init() {
    state.organisme = $('#appel-offres-select_organisme').next().find('.current').text().toLowerCase();
    state.nature = $('#appel-offres-select_nature').next().find('.current').text().toLowerCase();
    applyFilter();
  }
  init();

  $('#appel-offres-select_organisme').on('change', function () {
    state.organisme = $('#appel-offres-select_organisme').next().find('.current').text().toLowerCase();
    applyFilter();
  });
  $('#appel-offres-select_nature').on('change', function () {
    state.nature = $('#appel-offres-select_nature').next().find('.current').text().toLowerCase();
    applyFilter();
  });
};

},{}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function () {
  if ($('.article-slider').length) {

    var rtl = $('html').attr('dir') == 'rtl';

    if ($(window).width() > 991) {
      articleSlider(0, rtl);
    } else {
      articleSlider(32, rtl);
    }

    $(window).on('resize', function () {
      if ($(window).width() > 991) {
        articleSlider(0, rtl);
      } else {
        articleSlider(32, rtl);
      }
    });
  }

  function articleSlider(stagePadding, rtl) {
    $('.article-slider.owl-carousel').owlCarousel({
      stagePadding: stagePadding,
      margin: 10,
      dots: true,
      nav: true,
      loop: false,
      rtl: rtl,
      responsive: {
        0: {
          items: 1
        },
        992: {
          items: 3
        }
      }
    });
  }
};

},{}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function () {
	if ($('.besoin-aide').length) {

		$('.besoin-aide').on('click', function () {
			$('.questions').toggleClass('d-none');
		});
	}
};

},{}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function () {

    if ($('.card-actualites-slider').length) {

        var rtl = $('html').attr('dir') == 'rtl';

        if ($(window).width() <= 991) {

            cardActuSlider(48, rtl);
        } else {

            $('.card-actualites-slider').owlCarousel('destroy');
        }

        $(window).on('resize', function () {
            if ($(window).width() <= 991) {

                $('.card-actualites-slider').owlCarousel('destroy');
                cardActuSlider(48, rtl);
            } else {

                $('.card-actualites-slider').owlCarousel('destroy');
            }
        });
    }

    function cardActuSlider(stagePadding, rtl) {
        $('.card-actualites-slider.owl-carousel').owlCarousel({
            stagePadding: stagePadding,
            margin: 16,
            dots: true,
            nav: false,
            rtl: rtl,
            responsive: {
                0: {
                    items: 1
                }
            }
        });
    }
};

},{}],11:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function () {

	if ($('.card-histoire-slider').length) {

		var rtl = $('html').attr('dir') == 'rtl';

		if ($(window).width() <= 768) {

			cardHistoireSlider(48, rtl);
		} else {
			$('.card-histoire-slider').owlCarousel('destroy');
		}

		$(window).on('resize', function () {
			if ($(window).width() <= 768) {

				cardHistoireSlider(48, rtl);
			} else {
				$('.card-histoire-slider').owlCarousel('destroy');
			}
		});
	}

	function cardHistoireSlider(stagePadding, rtl) {
		$('.card-histoire-slider.owl-carousel').owlCarousel({
			stagePadding: stagePadding,
			margin: 5,
			dots: true,
			nav: false,
			rtl: rtl,
			responsive: {
				0: {
					items: 1
				}
			}
		});
	}
};

},{}],12:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function () {
	if ($('.card--rapport-right').length) {

		var rtl = $('html').attr('dir') == 'rtl';

		if ($(window).width() > 768) {
			rapportSlider(0, rtl);
		} else {
			rapportSlider(0, rtl);
		}

		$(window).on('resize', function () {
			if ($(window).width() > 768) {
				rapportSlider(0, rtl);
			} else {
				rapportSlider(0, rtl);
			}
		});
	}

	function rapportSlider(stagePadding, rtl) {
		var owl = $('.card--rapport-right.owl-carousel').owlCarousel({
			stagePadding: stagePadding,
			margin: 0,
			dots: false,
			nav: false,
			loop: false,
			rtl: rtl,
			responsive: {
				0: {
					items: 1
				}
			}
		});

		$('.card--rapport-right .wrapper_btn .next').on('click', function () {
			owl.trigger('next.owl.carousel');
		});

		// Go to the previous item
		$('.card--rapport-right .wrapper_btn .prev').on('click', function () {
			// With optional speed parameter
			// Parameters has to be in square bracket '[]'
			owl.trigger('prev.owl.carousel');
		});
	}
};

},{}],13:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function () {

  if ($('.card-slider-wrapper').length) {

    if ($(window).width() > 768) {
      cardSliderPage(16);
    } else {
      cardSliderPage(0);
    }

    $(window).on('resize', function () {
      if ($(window).width() > 768) {
        cardSliderPage(16);
      } else {
        cardSliderPage(0);
      }
    });
  }

  function cardSliderPage(stagePadding) {
    $('.card-slider-wrapper.owl-carousel').owlCarousel({
      stagePadding: stagePadding,
      margin: 16,
      dots: true,
      nav: true,
      responsive: {
        0: {
          items: 1
        },
        768: {
          items: 2
        },
        992: {
          items: 4
        }
      }
    });
  }
};

},{}],14:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.default = function () {
  var tagFilters = document.querySelectorAll('#communiques-filters a');
  var communiquesHolder = document.querySelector('#communiques-holder');
  var startDate = document.querySelector('.start');
  var endDate = document.querySelector('.end');
  var allFilterBtn = document.querySelector('#communiques-filter-all');

  if (tagFilters.length <= 0 || !communiquesHolder) return;

  var state = {
    filters: [],
    dateFilter: {
      from: '',
      to: ''
    },
    order: 'desc',
    max: 3,
    data: [{
      tags: ['RSE', 'FINANCE', 'ENTREPRENARIAT'],
      date: '21/07/2017',
      title: 'Le Groupe BCP lance la pr emière banque marocaine dédiée à l’activité “titres”',
      size: 450,
      type: 'pdf'
    }, {
      tags: ['RSE'],
      title: 'Le Groupe BCP lance la pr emière banque marocaine dédiée à l’activité “titres”',
      date: '29/07/2017',
      size: 450,
      type: 'pdf'
    }, {
      tags: ['RSE', 'ENTREPRENARIAT'],
      date: '22/07/2017',
      title: 'Le Groupe BCP lance la première banque marocaine dédiée à l’activité “titres”',
      size: 450,
      type: 'pdf'
    }, {
      tags: ['RSE', 'DEVELOPPEMENT DURABLE'],
      date: '23/07/2017',
      title: 'Le Groupe BCP lance la première banque marocaine dédiée à l’activité “titres”',
      size: 450,
      type: 'pdf'
    }, {
      tags: ['RSE'],
      date: '21/07/2017',
      title: 'Le Groupe BCP lance la première banque marocaine dédiée à l’activité “titres”',
      size: 450,
      type: 'pdf'
    }, {
      tags: ['RSE', 'FINANCE'],
      date: '24/07/2017',
      title: 'Le Groupe BCP lance la première banque marocaine dédiée à l’activité “titres”',
      size: 450,
      type: 'pdf'
    }, {
      tags: ['RSE', 'FINANCE'],
      date: '25/07/2017',
      title: 'Le Groupe BCP lance la première banque marocaine dédiée à l’activité “titres”',
      size: 450,
      type: 'pdf'
    }, {
      tags: ['RSE'],
      date: '26/07/2017',
      title: 'Le Groupe BCP lance la première banque marocaine dédiée à l’activité “titres”',
      size: 450,
      type: 'pdf'
    }, {
      tags: ['RSE', 'FINANCE'],
      date: '21/07/2017',
      title: 'Le Groupe BCP lance la première banque marocaine dédiée à l’activité “titres”',
      size: 450,
      type: 'pdf'
    }, {
      tags: ['RSE', 'FINANCE'],
      date: '21/08/2017',
      title: 'Le Groupe BCP lance la première banque marocaine dédiée à l’activité “titres”',
      size: 450,
      type: 'pdf'
    }, {
      tags: ['RSE'],
      date: '22/08/2016',
      title: 'Le Groupe BCP lance la première banque marocaine dédiée à l’activité “titres”',
      size: 450,
      type: 'pdf'
    }, {
      tags: ['RSE', 'FINANCE'],
      date: '21/09/2017',
      title: 'Le Groupe BCP lance la première banque marocaine dédiée à l’activité “titres”',
      size: 450,
      type: 'pdf'
    }, {
      tags: ['RSE', 'FINANCE'],
      date: '21/10/2017',
      title: 'Le Groupe BCP lance la première banque marocaine dédiée à l’activité “titres”',
      size: 450,
      type: 'pdf'
    }, {
      tags: ['RSE', 'FINANCE'],
      date: '21/07/2018',
      title: 'Le Groupe BCP lance la première banque marocaine dédiée à l’activité “titres”',
      size: 450,
      type: 'pdf'
    }, {
      tags: ['RSE', 'FINANCE'],
      date: '21/07/2018',
      title: 'Le Groupe BCP lance la première banque marocaine dédiée à l’activité “titres”',
      size: 450,
      type: 'pdf'
    }, {
      tags: ['RSE', 'FINANCE'],
      date: '21/07/2019',
      title: 'Le Groupe BCP lance la première banque marocaine dédiée à l’activité “titres”',
      size: 450,
      type: 'pdf'
    }, {
      tags: ['RSE', 'FINANCE'],
      date: '21/07/2020',
      title: 'Le Groupe BCP lance la première banque marocaine dédiée à l’activité “titres”',
      size: 450,
      type: 'pdf'
    }]
  };

  function cleanTag(tagFilter) {
    tagFilter = tagFilter.toLowerCase();
    if (tagFilter[0] == '#') {
      tagFilter = tagFilter.slice(1);
    }

    return tagFilter;
  }

  function makeDateObject(dateString) {
    var _dateString$split = dateString.split('/'),
        _dateString$split2 = _slicedToArray(_dateString$split, 3),
        day = _dateString$split2[0],
        month = _dateString$split2[1],
        year = _dateString$split2[2];

    return new Date(year, month - 1, day);
  }

  function applyFilters() {
    var data = state.data;
    if (state.filters.length > 0) {
      data = data.filter(function (post) {
        for (var i = 0; i < state.filters.length; i++) {
          if (post.tags.includes(state.filters[i].toUpperCase())) {
            return true;
          }
        }
        return false;
      });
    }

    if (state.dateFilter.from && state.dateFilter.to) {
      data = data.filter(function (post) {
        if (makeDateObject(post.date) - makeDateObject(state.dateFilter.from) >= 0 && makeDateObject(post.date) - makeDateObject(state.dateFilter.to) <= 0) {
          return true;
        }

        return false;
      });
    }

    data = data.sort(function (a, b) {
      return state.order == 'desc' ? makeDateObject(b.date) - makeDateObject(a.date) : makeDateObject(a.date) - makeDateObject(b.date);
    });

    showSelected(data);
  }
  function changeFilters(e) {
    e.preventDefault();

    this.classList.toggle('active');

    state.filters = [];

    tagFilters.forEach(function (tag) {
      if ($(tag).hasClass('active')) {
        state.filters.push(cleanTag(tag.innerText));
      }
    });

    if (state.filters.length > 0) {
      allFilterBtn.classList.remove('active');
    } else {
      allFilterBtn.classList.add('active');
    }

    applyFilters();
  }

  function showSelected(data) {
    var selectedData = data.slice(0, state.max * 3);

    console.log(data.length);
    console.log(selectedData.length);

    if (selectedData.length >= data.length) {
      $('#more-communiques').hide();
    } else {
      $('#more-communiques').show();
    }

    render(selectedData);
  }

  applyFilters();

  $('#more-communiques').on('click', function (e) {
    e.preventDefault();
    state.max++;
    applyFilters();

    this.scrollIntoView({
      behavior: 'smooth',
      inline: 'end'
    });
    if (state.max + 1 > state.data.length / 3) $(this).hide();
  });

  function render(data) {
    communiquesHolder.innerHTML = data.map(function (post) {
      return '<a class="news news--communiques" href="#">\n        <div class="news_border">\n          <svg class="icon-pdf">\n            <use xlink:href="#icon-pdf"></use>\n          </svg>\n          <p>\n            T\xE9l\xE9charger\n          </p>\n        </div>\n        <div class="news_content">\n          <div class="news_date clearfix">\n            <p class="publication">\n              ' + post.date + '\n            </p>\n          </div>\n          <h2 class="news_title">\n            ' + post.title + '\n          </h2>\n          <p class="news_txt">\n            .' + post.type + ' - ' + post.size + ' KB\n          </p>\n        </div>\n      </a>';
    }).join('');
  }

  function dateFormat(date) {
    return '1/' + (date.month() + 1) + '/' + date.year();
  }

  var startFilter = new _index2.default(startDate, false, function (start) {
    state.dateFilter.from = dateFormat(start);
    applyFilters();
  });
  startFilter.init();

  var endFilter = new _index2.default(endDate, true, function (end) {
    state.dateFilter.to = dateFormat(end);
    applyFilters();
  });
  endFilter.init();

  $('#communiques-select-filter').on('change', function () {
    var selected = $('#communiques-select-filter').next().find('.current').text();
    selected = selected.toLowerCase();

    // console.log(selected)

    $('#date-filter').addClass('d-flex');
    $('#date-filter').show();

    if (selected !== 'période') {
      $('#date-filter').removeClass('d-flex');
      $('#date-filter').hide();
      state.order = 'desc';
      state.dateFilter.from = '';
      state.dateFilter.to = '';
      startFilter.clear();
      endFilter.clear();
    }

    if (selected === 'plus anciens') {
      state.order = 'asc';
      applyFilters();
    } else if (selected === 'plus récents') {
      applyFilters();
      state.order = 'desc';
    }
  });

  allFilterBtn.addEventListener('click', function (e) {
    e.preventDefault();
    state.filters = [];
    tagFilters.forEach(function (tag) {
      tag.classList.remove('active');
    });
    this.classList.add('active');
    applyFilters();
  });
  tagFilters.forEach(function (tag) {
    tag.addEventListener('click', changeFilters);
  });
};

var _index = require('../../components/date-filter/index.js');

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

},{"../../components/date-filter/index.js":15}],15:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (parent, empty, callback) {
  var currentDate = (0, _moment2.default)();

  var incDate = parent.querySelector('.increment-date');
  var decDate = parent.querySelector('.decrement-date');
  var monthsInput = parent.querySelector('.date-filter_month input');
  var yearsInput = parent.querySelector('.date-filter_year input');

  function updateDate() {
    var currentMonth = currentDate.month() + 1;
    var currentYear = currentDate.year().toString();
    monthsInput.value = currentMonth;
    yearsInput.value = currentYear;
    callback(currentDate);
  }

  function bindEvents() {
    incDate.addEventListener('click', function (e) {
      e.preventDefault();
      currentDate = (0, _moment2.default)(currentDate).add(1, 'months');
      updateDate();
    });
    decDate.addEventListener('click', function (e) {
      e.preventDefault();
      currentDate = (0, _moment2.default)(currentDate).subtract(1, 'months');
      updateDate();
    });
    monthsInput.addEventListener('input', function () {
      if (parseInt(this.value) > 0 && parseInt(this.value) <= 31) {
        currentDate.month(this.value - 1);
        updateDate();
      }
    });
    yearsInput.addEventListener('input', function () {
      if (parseInt(this.value) > 0) {
        currentDate.year(this.value);
        updateDate();
      }
    });
  }

  this.clear = function () {
    monthsInput.value = yearsInput.value = '';
  };

  this.init = function () {
    bindEvents();
    if (!empty) updateDate();
  };

  this.selectedDate = function () {
    return currentDate;
  };
};

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

},{"moment":1}],16:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function () {
  if ($('.date-slider').length) {

    if ($(window).width() > 768) {
      dateSliderPage(0);
    } else {
      dateSliderPage(0);
    }

    $(window).on('resize', function () {
      if ($(window).width() > 768) {
        dateSliderPage(0);
      } else {
        dateSliderPage(0);
      }
    });
  }

  function dateSliderPage(stagePadding) {
    $('.date-slider.owl-carousel').owlCarousel({
      stagePadding: stagePadding,
      margin: 5,
      dots: true,
      nav: true,
      responsive: {
        0: {
          items: 4
        },
        768: {
          items: 10
        },
        992: {
          items: 15
        }
      }
    });
  }
};

},{}],17:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function () {
  var tagFilters = void 0,
      financesDates = document.querySelector('#finance-dates'),
      financePosts = document.querySelector('#finance-posts');

  if (!financePosts) return;

  var state = {
    filter: '2018',
    data: [{
      date: '22/12/2017',
      img: 'assets/img/finance.png',
      title: {
        first: 'Résultats',
        last: 'Financiers'
      }
    }, {
      date: '22/12/2018',
      img: 'assets/img/finance.png',
      title: {
        first: 'Résultats',
        last: 'Financiers'
      }
    }, {
      date: '22/12/2016',
      img: 'assets/img/finance.png',
      title: {
        first: 'Résultats',
        last: 'Financiers'
      }
    }, {
      date: '22/12/1994',
      img: 'assets/img/finance.png',
      title: {
        first: 'Résultats',
        last: 'Financiers'
      }
    }, {
      date: '22/12/2012',
      img: 'assets/img/finance.png',
      title: {
        first: 'Résultats',
        last: 'Financiers'
      }
    }, {
      date: '22/12/2018',
      img: 'assets/img/finance.png',
      title: {
        first: 'Résultats',
        last: 'Financiers'
      }
    }, {
      date: '22/12/1996',
      img: 'assets/img/finance.png',
      title: {
        first: 'Résultats',
        last: 'Financiers'
      }
    }, {
      date: '22/12/1991',
      img: 'assets/img/finance.png',
      title: {
        first: 'Résultats',
        last: 'Financiers'
      }
    }, {
      date: '22/12/2000',
      img: 'assets/img/finance.png',
      title: {
        first: 'Résultats',
        last: 'Financiers'
      }
    }, {
      date: '22/12/2015',
      img: 'assets/img/finance.png',
      title: {
        first: 'Résultats',
        last: 'Financiers'
      }
    }, {
      date: '22/12/2014',
      img: 'assets/img/finance.png',
      title: {
        first: 'Résultats',
        last: 'Financiers'
      }
    }, {
      date: '22/12/2013',
      img: 'assets/img/finance.png',
      title: {
        first: 'Résultats',
        last: 'Financiers'
      }
    }, {
      date: '22/12/2010',
      img: 'assets/img/finance.png',
      title: {
        first: 'Résultats',
        last: 'Financiers'
      }
    }, {
      date: '22/12/2018',
      img: 'assets/img/finance.png',
      title: {
        first: 'Résultats',
        last: 'Financiers'
      }
    }, {
      date: '22/12/2018',
      img: 'assets/img/finance.png',
      title: {
        first: 'Résultats',
        last: 'Financiers'
      }
    }, {
      date: '22/12/2017',
      img: 'assets/img/finance.png',
      title: {
        first: 'Résultats',
        last: 'Financiers'
      }
    }, {
      date: '22/12/2018',
      img: 'assets/img/finance.png',
      title: {
        first: 'Résultats',
        last: 'Financiers'
      }
    }, {
      date: '22/12/2018',
      img: 'assets/img/finance.png',
      title: {
        first: 'Résultats',
        last: 'Financiers'
      }
    }, {
      date: '22/12/2001',
      img: 'assets/img/finance.png',
      title: {
        first: 'Résultats',
        last: 'Financiers'
      }
    }, {
      date: '22/12/2003',
      img: 'assets/img/finance.png',
      title: {
        first: 'Résultats',
        last: 'Financiers'
      }
    }, {
      date: '22/12/2005',
      img: 'assets/img/finance.png',
      title: {
        first: 'Résultats',
        last: 'Financiers'
      }
    }, {
      date: '22/12/2002',
      img: 'assets/img/finance.png',
      title: {
        first: 'Résultats',
        last: 'Financiers'
      }
    }, {
      date: '22/12/1999',
      img: 'assets/img/finance.png',
      title: {
        first: 'Résultats',
        last: 'Financiers'
      }
    }, {
      date: '22/12/1985',
      img: 'assets/img/finance.png',
      title: {
        first: 'Résultats',
        last: 'Financiers'
      }
    }]
  };

  function applyFilters() {
    var data = state.data;
    if (state.filter) {
      data = data.filter(function (post) {
        if (state.filter.trim() === post.date.split('/')[2]) {
          return true;
        }
        return false;
      });
    }

    render(data);
  }

  function changeFilter(e) {
    e.preventDefault();

    tagFilters.forEach(function (tag) {
      tag.classList.remove('active');
    });

    this.classList.add('active');

    state.filter = this.innerText;

    // console.log(state.filters)
    applyFilters();
  }

  function bindEvents() {
    $('.finance').on('click', function () {
      var currentItem = $(this);
      console.log('clicked');
      $('.finance').each(function (index, el) {
        if ($(el)[0] !== currentItem[0]) {
          $(el).removeClass('open');
        }
      });

      $(this).toggleClass('open');
    });
  }

  function render(data) {
    financePosts.innerHTML = data.map(function (post, index) {
      return '\n        ' + (index == 0 && data.length > 1 ? '<div class="col-12 col-lg-8 mb-lg-3 mb-2"><div class="finance finance--lg clearfix">' : '<div class="col-12 col-lg-4 mb-lg-3 mb-2"><div class="finance clearfix">') + '\n            <div>\n              <img src="assets/img/finance.png" alt="">\n            </div>\n            <div class="finance_title">\n              <h3 class="first">\n                ' + post.title.first + '\n                </h3>\n                <h3 class="last">\n                ' + post.title.last + '\n                </h3>\n                \n                <p class="finance_date">\n                ' + post.date + '\n              </p>\n\n              <p class="download">\n                <label class="checkbox">\n                  Comptes sociaux de la Banque \n                  <input type="checkbox">\n                  <span class="checkmark">\n                  </span>\n                </label>\n                <label class="checkbox">\n                  Centrale Populaire\n                  <input type="checkbox" checked>\n                  <span class="checkmark">\n                  </span>\n                </label>\n                <label class="checkbox">\n                  Communiqu\xE9 de presse- VA\n                  <input type="checkbox" checked>\n                  <span class="checkmark">\n                  </span>\n                </label>\n                <label class="checkbox">\n                  Communiqu\xE9 de presse- VF\n                  <input type="checkbox" checked>\n                  <span class="checkmark">\n                  </span>\n                </label>\n                <button type="button" class="btn btn--download">\n                  telecharger\n                </button>\n              </p>\n              \n            </div>\n        </div>\n        </div>\n      ';
    }).join('');

    bindEvents();
  }

  function init() {
    var distinctTags = [];

    financesDates.innerHTML = state.data.filter(function (post) {
      if (!distinctTags.includes(post.date)) {
        distinctTags.push(post.date);
        return true;
      }

      return false;
    }).sort(function (py, ny) {
      return ny.date.split('/')[2] - py.date.split('/')[2];
    }).map(function (post, index) {
      return '<a href="#" class="btn btn--tag ' + (index == 0 ? 'active' : '') + ' ">\n                  ' + post.date.split('/')[2] + '\n                </a>';
    }).join('');

    tagFilters = financesDates.querySelectorAll('a');

    tagFilters.forEach(function (tag) {
      tag.addEventListener('click', changeFilter);
    });

    applyFilters();
    bindEvents();
  }

  init();
};

},{}],18:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function () {
	if ($('.finance.length')) {

		$('.finance').on('click', function () {

			var currentItem = $(this);

			$('.finance').each(function (index, el) {

				if ($(el)[0] !== currentItem[0]) {
					$(el).removeClass('open');
				}
			});

			$(this).toggleClass('open');
		});
	}
};

},{}],19:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function () {
	if ($('.footer_title').length) {

		$('.footer_title').on('click', function () {
			if ($(this).next('ul').css('display') === 'none') {

				$('.footer_title + ul.open').css('display', 'none');
				$('.footer_title + ul.open').removeClass('open');

				$(this).next('ul').css('display', 'block');
				$(this).next('ul').addClass('open');
			} else {

				$(this).next('ul').css('display', 'none');
				$(this).next('ul').removeClass('open');
			}
		});

		$(window).on('resize', function () {
			if ($(window).width() > 768) {
				$('.footer_title + ul').css('display', 'block');
				$('.footer_title + ul.open').removeClass('open');
			} else {
				$('.footer_title + ul').css('display', 'none');
			}
		});
	}
};

},{}],20:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function () {

    /* Variables */

    var $form = $('.form-stage');
    var $formDrop = $('.form_drop');
    var $input = $form.find('input[type=file]');
    var droppedFiles = false;

    /* Functions */

    var isAdvancedUpload = function () {
        var div = document.createElement('div');
        return ('draggable' in div || 'ondragstart' in div && 'ondrop' in div) && 'FormData' in window && 'FileReader' in window;
    }();

    var addfileDom = function addfileDom(file) {
        //console.log(file);

        var html = '<div class="col-12 col-md-6 mb-2">\n\t        \t\t\t<div class="form_file" id="' + (file.name + parseInt(file.size / 1024)) + '">\n\t\t\t                <div class="wrapper d-flex justify-content-between align-items-center">\n\t\t\t                    <div class="d-flex align-items-center">\n\t\t\t                        <span class="check d-none">\n\t\t\t                            <svg>\n\t\t\t                                <use xlink:href="#icon-check-file"></use>\n\t\t\t                            </svg>\n\t\t\t                        </span>\n\t\t\t                        <span class="pdf">\n\t\t\t                            <svg>\n\t\t\t                                <use xlink:href="#icon-pdf-file"></use>\n\t\t\t                            </svg>\n\t\t\t                        </span>\n\t\t\t                        <span>\n\t\t\t                            <p class="name">\n\t\t\t                                ' + file.name + '\n\t\t\t                            </p>\n\t\t\t                            <p class="size">\n\t\t\t                                ' + parseInt(file.size / 1024) + 'KB\n\t\t\t                            </p>\n\t\t\t                        </span>\n\t\t\t                    </div>\n\t\t\t                    <div class="d-flex align-items-center">\n\t\t\t                        <span class="remove d-none">\n\t\t\t                            <svg>\n\t\t\t                                <use xlink:href="#icon-remove-file"></use>\n\t\t\t                            </svg>\n\t\t\t                        </span>\n\t\t\t                        <span class="loading">\n\t\t\t                            Chargement en cours <span class="percentage"></span> %\n\t\t\t                        </span>\n\t\t\t                        <span class="cross">\n\t\t\t                            <svg>\n\t\t\t                                <use xlink:href="#icon-cross-file"></use>\n\t\t\t                            </svg>\n\t\t\t                        </span>\n\t\t\t                    </div>\n\t\t\t                </div>\n\t\t\t                <div class="progress-bar" style="width: 0%"></div>\n\t\t\t            </div>\n\t\t\t        </div>';

        $('.form_files').append(html);
    };

    var sendFiles = function sendFiles(files) {
        //console.log(files);

        var ajaxData = new FormData($form.get(0));

        $.each(droppedFiles, function (i, file) {

            var fileId = file.name + parseInt(file.size / 1024);
            ajaxData.append(fileId, file);

            addfileDom(file);

            $.ajax({
                xhr: function xhr() {

                    var xhr = new window.XMLHttpRequest();

                    xhr.upload.addEventListener("progress", function (evt) {
                        if (evt.lengthComputable) {

                            var percentComplete = evt.loaded / evt.total;
                            var fileId = file.name + parseInt(file.size / 1024);
                            var fileDom = $(document.getElementById(fileId));
                            var percentageDom = $(document.getElementById(fileId)).find('.percentage');
                            var progressBar = $(document.getElementById(fileId)).find('.progress-bar');

                            percentComplete = parseInt(percentComplete * 100);

                            percentageDom.append(percentComplete);
                            progressBar.css('width', percentComplete + '%');

                            //console.log(percentComplete);

                            if (percentComplete === 100) {
                                setTimeout(function () {

                                    fileDom.find('.progress-bar').toggleClass('d-none');
                                    fileDom.find('.loading').toggleClass('d-none');
                                    fileDom.find('.remove').toggleClass('d-none');
                                    fileDom.find('.cross').toggleClass('d-none');
                                }, 300);
                            }
                        }
                    }, false);

                    return xhr;
                },
                url: 'action/uploadfile',
                type: $form.attr('method'),
                data: ajaxData,
                dataType: 'json',
                cache: false,
                contentType: false,
                processData: false,
                complete: function complete() {
                    $form.removeClass('is-uploading');
                },
                success: function success(data) {
                    $form.addClass(data.success == true ? 'is-success' : 'is-error');
                    if (!data.success) console.log('upload error');
                },
                error: function error() {
                    // Log the error, show an alert, whatever works for you
                }
            });

            $('.remove').on('click', function () {
                var removeId = $(this).closest('.form_file').attr('id');

                removeFile(removeId);
            });
        });
    };

    var removeFile = function removeFile(id) {
        var file = $(document.getElementById(id)).parent();
        file.remove();
    };

    /* Drag and drop Listener */

    if (isAdvancedUpload) {
        // Browser support Drag and Drop

        $formDrop.on('drag dragstart dragend dragover dragenter dragleave drop', function (e) {
            e.preventDefault();
            e.stopPropagation();
        }).on('dragover dragenter', function () {
            $formDrop.addClass('is-dragover');
        }).on('dragleave dragend drop', function () {
            $formDrop.removeClass('is-dragover');
        }).on('drop', function (e) {
            droppedFiles = e.originalEvent.dataTransfer.files;
            sendFiles(droppedFiles);
        });

        $input.on('change', function (e) {
            droppedFiles = e.target.files;
            sendFiles(e.target.files);
        });
    } else {}

    //fallback for IE9- browsers


    /* Submit Listener */

    $form.on('submit', function (e) {
        if ($form.hasClass('is-uploading')) return false;

        $form.addClass('is-uploading').removeClass('is-error');

        if (isAdvancedUpload) {
            // ajax for modern browsers

            e.preventDefault();

            // Form Input Data
            var ajaxData = {};

            $.ajax({
                url: $form.attr('action'),
                type: $form.attr('method'),
                data: ajaxData,
                dataType: 'json',
                cache: false,
                contentType: false,
                processData: false,
                complete: function complete() {},
                success: function success(data) {},
                error: function error() {
                    // Log the error, show an alert, whatever works for you
                }
            });
        } else {
            // ajax for IE9- browsers
        }
    });
};

},{}],21:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function () {
    $("form[name='form-stage']").validate({

        // Specify validation rules
        rules: {
            firstname: 'required',
            lastname: 'required',
            email: {
                required: true,
                email: true
            },
            tel: {
                required: true,
                digits: true
            },
            service: 'required',
            formation: 'required',
            stage: {
                required: true
            },
            'type-formation': {
                required: true
            }
        },
        // Specify validation error messages
        messages: {
            firstname: 'Veuillez entrer votre prénom',
            lastname: 'Veuillez entrer votre nom',
            email: 'Veuillez entrer un email valide',
            tel: 'Veuillez entrer un numéro de téléphone valide (10 caractères min)',
            'type-formation': 'Veuillez entrer un type de formation',
            'conditions': 'Veuillez acceptez les conditions générales d\'utilisation',
            'service': 'Veuillez choisir un service',
            'formation': 'Veuillez choisir une formation',
            'stage': 'Veuillez choisir un type de stage'
        },
        errorPlacement: function errorPlacement(error, element) {
            if ((element.attr('type') == 'radio' || element.attr('type') == 'checkbox') && element.attr('name') != 'conditions') {
                error.insertAfter(element.parent().parent());
            } else if (element.attr('name') == 'conditions') {
                error.insertAfter(element.parent());
            } else {
                error.insertAfter(element);
            }
        },

        // Make sure the form is submitted to the destination defined
        // in the "action" attribute of the form when valid
        submitHandler: function submitHandler(form) {
            form.submit();
        }
    });
};

},{}],22:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function () {
	if ($('.header_mobile-menu').length) {
		$('.header_mobile-menu').on('click', function () {
			if ($('.header_menu').css('display') == 'block') {
				$('.header_menu').css('display', 'none');
			} else {
				$('.header_menu').css('display', 'block');
			}
		});
	}

	$(window).on('resize', function () {
		if ($(window).width() > 991) {
			if ($('.header_menu').css('display') == 'none') {
				$('.header_menu').css('display', 'block');
			}
		}
	});
};

},{}],23:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function () {
    if ($('.home-slider').length) {

        var rtl = $('html').attr('dir') == 'rtl';

        if ($(window).width() > 768) {

            setHeightSlider();
            homeSlider(0, rtl);
        } else {
            homeSlider(0, rtl);
        }

        $(window).on('resize', function () {

            if ($(window).width() > 768) {
                $('.home-slider').owlCarousel('destroy');
                homeSlider(0, rtl);
            } else {
                $('.home-slider').owlCarousel('destroy');
                homeSlider(0, rtl);
            }
        });
    }

    function setHeightSlider() {
        var windowHeight = $(window).height();
        var topHeaderHeight = $('.top-header').height();
        var headerHeight = $('.header').height();

        var sliderHeight = windowHeight - topHeaderHeight - headerHeight;

        var slider = $('.home-slider');
        var sliderItem = $('.home-slider_item');

        slider.css('max-height', sliderHeight);
        sliderItem.css('max-height', sliderHeight);
    }

    function homeSlider(stagePadding, rtl) {
        var owl = $('.home-slider.owl-carousel').owlCarousel({
            stagePadding: stagePadding,
            margin: 0,
            dots: true,
            nav: false,
            loop: true,
            navSpeed: 400,
            //autoplay: true,
            autoplayTimeout: 5000,
            rtl: rtl,
            responsive: {
                0: {
                    items: 1
                },
                768: {
                    items: 1,
                    dotsData: true
                }
            }
        });
    }
};

},{}],24:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function () {
  if ($('.logo-slider').length) {

    var rtl = $('html').attr('dir') == 'rtl';

    if ($(window).width() > 768) {
      logoSlider(0, rtl);
    } else {
      logoSlider(0, rtl);
    }

    $(window).on('resize', function () {
      if ($(window).width() > 768) {
        logoSlider(0, rtl);
      } else {
        logoSlider(0, rtl);
      }
    });
  }

  function logoSlider(stagePadding, rtl) {
    $('.logo-slider.owl-carousel').owlCarousel({
      stagePadding: stagePadding,
      margin: 45,
      dots: false,
      nav: true,
      loop: true,
      rtl: rtl,
      responsive: {
        0: {
          items: 2.5
        },
        768: {
          items: 4
        },
        992: {
          items: 5
        }
      }
    });
  }
};

},{}],25:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.buildMapCardInfo = exports.calculateAndDisplayRoute = exports.toggleControl = exports.ajustControlSize = exports.mapControl = undefined;

var _data = require('../../assets/js/data.json');

var _data2 = _interopRequireDefault(_data);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var mapControl = exports.mapControl = function mapControl() {
  var processData = function processData(data) {
    var inputedSearch = $('#inputed-search');
    var searchResult = $('#search-result');
    var suggestionHolder = $('#suggestions-holder');
    var searchInput = $('#search-input');
    var suggestionsContainer = $('#suggestions-container');
    var selectedContainer = $('#selected-container');
    var mapControlContainer = $('.mapcontrol_container');
    var filters = $('.mapcontrol_options > .btn');
    var nearByBtn = $('.mapcontrol_input-left');

    var selectedElement = void 0;

    var state = {
      userInput: '',
      filters: [],
      filtredData: [],
      nearByData: [],
      nearBy: false
    };

    var checkSuggestionsStatus = function checkSuggestionsStatus() {
      if (state.filtredData.length <= 0) {
        mapControlContainer.css('height', '186px');
        suggestionsContainer.hide();
      } else {
        mapControlContainer.css('height', '245px');
        suggestionsContainer.show();
      }
    };

    var applyFilters = function applyFilters() {
      if (!state.nearBy) {
        // filter data by user input
        state.filtredData = data.filter(function (element) {
          return (element.name.toLocaleLowerCase().includes(state.userInput) || element.address.toLocaleLowerCase().includes(state.userInputt) || element.city.toLocaleLowerCase().includes(state.userInput)) && state.userInput != '';
        });

        // Filter data by type
        state.filters.forEach(function (filter) {
          state.filtredData = state.filtredData.filter(function (element) {
            return element.type === filter;
          });
        });
      } else {
        state.filtredData = state.nearByData.map(function (entry) {
          return entry;
        });
        // Filter data by type
        state.filters.forEach(function (filter) {
          state.filtredData = state.filtredData.filter(function (element) {
            return element.type === filter;
          });
        });
      }

      // render filtred data
      render();
    };

    var filterChanges = function filterChanges() {
      $(this).toggleClass('active'); // change the style of the tag
      state.filters = [];

      filters.each(function () {
        if ($(this).hasClass('active')) {
          state.filters.push($(this).data('value'));
        }
      });

      applyFilters();
    };

    var inputChanges = function inputChanges(e) {
      state.userInput = e.target.value.toLocaleLowerCase();
      state.nearBy = false;
      nearByBtn.removeClass('active');
      applyFilters();
    };

    var showSelected = function showSelected() {
      var selectedName = $(this).find('h3').text();

      selectedElement = state.filtredData.filter(function (element) {
        return element.name === selectedName;
      }).reduce(function (prev) {
        return prev;
      });

      var selectedHTML = buildMapCardInfo(selectedElement);

      selectedContainer.html(selectedHTML);
      $('#selected-container--close').on('click', function (e) {
        e.preventDefault();
        render();
      });
      $('#selected-container--direction').on('click', displayDirection);
      selectedContainer.fadeIn();
      suggestionsContainer.hide();

      ajustControlSize(); // ajust map control to the screen size

      // console.log(selectedElement)

      window.map.setCenter(new google.maps.LatLng(selectedElement.coords.gps.lang, selectedElement.coords.gps.lat));

      // remove animation from all markers
      window.mapMarkers.forEach(function (marker) {
        if (marker.position.lat === selectedElement.coords.gps.lat && marker.position.lang === selectedElement.coords.gps.lang) {
          marker.marker.setAnimation(google.maps.Animation.BOUNCE);
        } else {
          marker.marker.setAnimation(null);
        }
      });

      window.map.setZoom(16);

      // window.isDisplayRoute = false
    };

    function displayDirection(e) {
      e.preventDefault();
      // console.log(selectedElement)
      calculateAndDisplayRoute(window.map, new google.maps.LatLng(selectedElement.coords.gps.lang, selectedElement.coords.gps.lat));
    }

    var render = function render() {
      // hide selected container
      selectedContainer.hide();

      // Check wether to display suggestions of not
      checkSuggestionsStatus();

      // update inputed search
      inputedSearch.text(state.userInput);
      // update search Result
      searchResult.text('( ' + state.filtredData.length + ' agences trouv\xE9es )');

      var content = state.filtredData.map(function (element) {
        return '<div class="suggestions_element d-flex justify-content-between">\n                  <div>\n                    <h3>' + element.name + '</h3>\n                    <span>' + element.address + '</span>\n                  </div>\n                  ' + (element.distanceOrigin ? '<div> <span>' + element.distanceOrigin.text + '</span></div>' : '') + '\n                </div>';
      }).join('');

      suggestionHolder.html(content);

      ajustControlSize(); // ajust map control to the screen size

      $('.suggestions_element').click(showSelected);
    };

    function distanceMatrix() {
      var service = new google.maps.DistanceMatrixService();

      return function getDistance(destination) {
        return new Promise(function (resolve, reject) {
          navigator.geolocation.getCurrentPosition(function (pos) {
            service.getDistanceMatrix({
              origins: [new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude)],
              destinations: [new google.maps.LatLng(destination.coords.gps.lang, destination.coords.gps.lat)],
              travelMode: 'DRIVING',
              unitSystem: google.maps.UnitSystem.METRIC,
              avoidHighways: false,
              avoidTolls: false
            }, function (response, status) {
              if (status !== 'OK') {
                reject('something wrong');
              }

              var agenceWithDistance = JSON.parse(JSON.stringify(destination));

              agenceWithDistance['distanceOrigin'] = response.rows[0].elements[0]['distance'];

              resolve(agenceWithDistance);
            });

            var latlng = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
            var marker = new google.maps.Marker({
              position: latlng
            });

            marker.setMap(window.map);

            window.map.setCenter(latlng);
          });
        });
      };
    }

    function showNearBy(e) {
      e.preventDefault();

      nearByBtn.addClass('animate'); // add animation class

      var getDistance = distanceMatrix();

      var distancePromises = [];

      data.forEach(function (agence) {
        distancePromises.push(getDistance(agence));
      });

      var distanceResults = Promise.all(distancePromises);

      distanceResults.then(function (data) {
        state.nearByData = data.sort(function (a, b) {
          return a.distanceOrigin.value - b.distanceOrigin.value;
        });

        state.userInput = 'proximité de vous';
        state.nearBy = true;

        nearByBtn.removeClass('animate'); // remove animation class
        nearByBtn.addClass('active'); // activate

        applyFilters();
        render();
      }).catch(function () {
        alert('something wrong!!');
      });
    }

    searchInput.on('input', inputChanges);
    filters.on('click', filterChanges);

    nearByBtn.on('click', showNearBy);
  };

  // $.getJSON('http://localhost:9000/data.json', processData)

  processData(_data2.default);
};

var ajustControlSize = exports.ajustControlSize = function ajustControlSize() {
  // Define the height of the map
  var topHeaderHeight = 300;
  var mapHeight = $(window).height() - topHeaderHeight;

  if (mapHeight < 400) mapHeight = 400;

  document.querySelector('#selected-container').maxHeight = mapHeight + 'px';
  document.querySelector('#suggestions-container').style.maxHeight = mapHeight + 'px';
};

var toggleControl = exports.toggleControl = function toggleControl() {
  $('.mapcontrol_toggle').click(function () {
    $('.mapcontrol').toggleClass('mapcontrol--hide');
  });
};

var calculateAndDisplayRoute = exports.calculateAndDisplayRoute = function calculateAndDisplayRoute(map, destination) {
  var directionsService = new google.maps.DirectionsService();
  window.directionsDisplay = window.directionsDisplay || new google.maps.DirectionsRenderer({
    preserveViewport: true
  });
  window.directionsDisplay.setMap(map);

  if (window.updateRouteTimer) {
    navigator.geolocation.clearWatch(window.updateRouteTimer);
  }

  function errorHandler(err) {
    if (err.code == 1) {
      alert('Error: Access is to your location is denied!');
    } else if (err.code == 2) {
      alert('Error: Position is unavailable!');
    }
  }

  function watchPosition(pos) {
    directionsService.route({
      origin: new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude),
      destination: destination,
      travelMode: 'DRIVING'
    }, function (response, status) {
      if (status === 'OK') {
        window.directionsDisplay.setDirections(response);
        console.log('updated');
      } else {
        window.alert('Directions request failed due to ' + status);
      }
    });
  }

  window.updateRouteTimer = navigator.geolocation.watchPosition(watchPosition, errorHandler);
};

var buildMapCardInfo = exports.buildMapCardInfo = function buildMapCardInfo(selectedElement) {
  return '<div class="moreinfo_content">\n  <div class="moreinfo_head">\n    <h3 class="moreinfo_title" id="info-name">' + selectedElement.name + '</h3>\n    <p class="moreinfo_address" id="info-address">' + selectedElement.address + '</p>\n    <div class="moreinfo_actions">\n      <a href="#" id="selected-container--close">RETOURNER</a>\n      <a href="#" id="selected-container--direction" >G\xC9N\xC9RER UN ITIN\xC9RAIRE</a>\n    </div>\n  </div>\n  <div class="moreinfo_body">\n    <div class="moreinfo_section">\n      <h4>Coordonn\xE9es</h4>\n      <div class="moreinfo_list">\n        <div class="moreinfo_list-item">\n          <div class="left">\n            <span>Email</span>\n          </div>\n          <div class="right">\n            <span id="info-email">' + selectedElement.coords.email + '</span>\n          </div>\n        </div>\n        <div class="moreinfo_list-item">\n          <div class="left">\n            <span>T\xE9l\xE9phone</span>\n          </div>\n          <div class="right">\n            <span id="info-phone">' + selectedElement.coords.phone + '</span>\n          </div>\n        </div>\n        <div class="moreinfo_list-item">\n          <div class="left">\n            <span>Fax</span>\n          </div>\n          <div class="right">\n            <span id="info-fax">' + selectedElement.coords.fax + '</span>\n          </div>\n        </div>\n        <div class="moreinfo_list-item">\n          <div class="left">\n            <span>Coords GPS</span>\n          </div>\n          <div class="right">\n            <span>\n              <bold>\n                Latitude\n              </bold> : ' + selectedElement.coords.gps.lat + ' |\n              <bold>\n                Longitude\n              </bold> : ' + selectedElement.coords.gps.lang + ' </span>\n          </div>\n        </div>\n      </div>\n    </div>\n    <div class="moreinfo_section">\n      <h4>Agence li\xE9e</h4>\n      <div class="moreinfo_container">\n        <h5>' + selectedElement.extension.name + '</h5>\n        <p class="moreinfo_address">' + selectedElement.extension.address + '</p>\n      </div>\n    </div>\n    <div class="moreinfo_section">\n      <div class="moreinfo_list">\n        <div class="moreinfo_list-item">\n          <div class="left">\n            <span>Lundi</span>\n          </div>\n          <div class="right">\n            <span>' + selectedElement.timetable.monday + '</span>\n          </div>\n        </div>\n        <div class="moreinfo_list-item">\n          <div class="left">\n            <span>Mardi</span>\n          </div>\n          <div class="right">\n            <span>' + selectedElement.timetable.tuesday + '</span>\n          </div>\n        </div>\n        <div class="moreinfo_list-item">\n          <div class="left">\n            <span>Mercredi</span>\n          </div>\n          <div class="right">\n            <span>' + selectedElement.timetable.wednesday + '</span>\n          </div>\n        </div>\n        <div class="moreinfo_list-item">\n          <div class="left">\n            <span>Jeudi</span>\n          </div>\n          <div class="right">\n            <span>' + selectedElement.timetable.thursday + '</span>\n          </div>\n        </div>\n        <div class="moreinfo_list-item">\n          <div class="left">\n            <span>Vendredi</span>\n          </div>\n          <div class="right">\n            <span>' + selectedElement.timetable.friday + '</span>\n          </div>\n        </div>\n        <div class="moreinfo_list-item">\n          <div class="left">\n            <span>Samedi</span>\n          </div>\n          <div class="right">\n            <span>' + selectedElement.timetable.saturday + '</span>\n          </div>\n        </div>\n        <div class="moreinfo_list-item">\n          <div class="left">\n            <span>Diamanche</span>\n          </div>\n          <div class="right">\n            <span>' + selectedElement.timetable.sunday + '</span>\n          </div>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>';
};

},{"../../assets/js/data.json":3}],26:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function () {
  var mapControlContainer = $('.mapcontrol_container');
  var mapControl = $('.mapcontrol');
  var selectedContainer = $('#selected-container');
  var suggestionsContainer = $('#suggestions-container');

  window.mapMarkers = [];

  var bindMarkers = function bindMarkers(map, locations) {
    var marker = void 0,
        latlng = void 0;

    locations.forEach(function (location) {
      latlng = new google.maps.LatLng(location.coords.gps.lang, location.coords.gps.lat);

      var icon = {
        url: 'assets/img/pin.svg', // url
        scaledSize: new google.maps.Size(40, 40), // scaled size
        origin: new google.maps.Point(0, 0), // origin
        anchor: new google.maps.Point(20, 40) // anchor
      };

      marker = new google.maps.Marker({
        position: latlng,
        icon: icon
      });

      window.mapMarkers.push({
        marker: marker,
        position: {
          lat: location.coords.gps.lat,
          lang: location.coords.gps.lang
        }
      });

      marker.setMap(map);

      // biding the click event with each marker
      google.maps.event.addListener(marker, 'click', function () {
        // remove animation from all markers
        window.mapMarkers.forEach(function (_ref) {
          var marker = _ref.marker;

          marker.setAnimation(null);
        });

        // console.log(this)

        this.setAnimation(google.maps.Animation.BOUNCE);
        mapControl.removeClass('mapcontrol--hide');
        mapControlContainer.css('height', '245px');
        var selectedHTML = (0, _index.buildMapCardInfo)(location);
        selectedContainer.html(selectedHTML);
        (0, _index.ajustControlSize)(); // ajust the map control size
        $('.mapcontrol_input-left').removeClass('active'); // remove active from localisation btn
        $('#selected-container--close').on('click', function (e) {
          e.preventDefault();
          mapControlContainer.css('height', '186px');
          selectedContainer.hide();
        });
        $('#selected-container--direction').on('click', function (e) {
          e.preventDefault();
          (0, _index.calculateAndDisplayRoute)(window.map, new google.maps.LatLng(location.coords.gps.lang, location.coords.gps.lat));
        });
        suggestionsContainer.hide();
        selectedContainer.show();
      });
    });
  };

  var ajustMapSize = function ajustMapSize(mapHolder) {
    // Define the height of the map
    var topHeaderHeight = 51;
    var mapHeight = $(window).height();
    mapHolder.style.height = mapHeight - topHeaderHeight + 'px';
  };
  function processMap(data) {
    // console.log(data)
    $.getScript('https://maps.googleapis.com/maps/api/js?key=AIzaSyDCWD_q5NoEyVblC1mtS2bl08kukrnzDQs&region=MA', function () {
      var defaultProps = {
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        zoom: 14,
        mapTypeControl: false,
        fullscreenControl: false
      };
      var mapHolder = document.getElementById('map');
      if (mapHolder) {
        ajustMapSize(mapHolder);

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(function (pos) {
            var mapProp = {
              center: new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude),
              mapTypeId: google.maps.MapTypeId.ROADMAP,
              zoom: 14,
              mapTypeControl: false,
              fullscreenControl: false
            };

            window.map = new google.maps.Map(mapHolder, mapProp);

            bindMarkers(window.map, data);
          }, function errorHandler(err) {
            if (err.code == 1) {
              window.map = new google.maps.Map(mapHolder, defaultProps);

              window.map.setCenter(new google.maps.LatLng(31.791702, -7.092620000000011));

              bindMarkers(window.map, data);

              alert('Error: Access is to your location is denied!');
            } else if (err.code == 2) {
              alert('Error: Position is unavailable!');
            }
          });
        } else {
          window.map = new google.maps.Map(mapHolder, defaultProps);

          window.map.setCenter(new google.maps.LatLng(31.791702, -7.092620000000011));

          bindMarkers(window.map, data);

          alert('Geolocation is not supported by this browser.');
        }
      }
    });
  }

  // $.getJSON('http://localhost:9000/data.json', processMap)
  processMap(_data2.default);

  $('#map').click(function () {
    $('#search-input').blur();
    console.log('mouse down');
  });
};

var _index = require('../../components/map-control/index.js');

var _data = require('../../assets/js/data.json');

var _data2 = _interopRequireDefault(_data);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

},{"../../assets/js/data.json":3,"../../components/map-control/index.js":25}],27:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function () {
  var tagFilters = document.querySelectorAll('#mediacenter-detail-filters a');
  var allFilterBtn = document.querySelector('#mediacenter-detail-filter-all');
  var mediaCenterHolder = document.querySelector('#mediacenter-detail-holder');

  if (!mediaCenterHolder) return;

  var state = {
    filters: [],
    data: [{
      type: 'audio',
      tags: ['RSE', 'FINANCE', 'ENTREPRENARIAT'],
      media: 'assets/img/media-img.png'
    }, {
      type: 'image',
      tags: ['RSE', 'FINANCE', 'ENTREPRENARIAT', 'DEVELOPPEMENT DURABLE'],
      media: 'assets/img/media-img.png'
    }, {
      type: 'video',
      tags: ['RSE', 'FINANCE', 'ENTREPRENARIAT', 'DEVELOPPEMENT DURABLE'],
      media: 'assets/img/res-2.png'
    }, {
      type: 'audio',
      tags: ['RSE', 'DEVELOPPEMENT DURABLE'],
      media: 'assets/img/media-img.png'
    }, {
      type: 'video',
      tags: ['RSE', 'FINANCE', 'DEVELOPPEMENT DURABLE'],
      media: 'assets/img/res-2.png'
    }, {
      type: 'image',
      tags: ['RSE', 'FINANCE', 'ENTREPRENARIAT', 'DEVELOPPEMENT DURABLE'],
      media: 'assets/img/media-img.png'
    }, {
      type: 'image',
      tags: ['RSE'],
      media: 'assets/img/media-img.png'
    }, {
      type: 'audio',
      tags: ['RSE', 'FINANCE', 'ENTREPRENARIAT'],
      media: 'assets/img/media-img.png'
    }, {
      type: 'image',
      tags: ['RSE', 'FINANCE', 'ENTREPRENARIAT', 'DEVELOPPEMENT DURABLE'],
      media: 'assets/img/media-img.png'
    }, {
      type: 'video',
      tags: ['RSE', 'FINANCE', 'ENTREPRENARIAT', 'DEVELOPPEMENT DURABLE'],
      media: 'assets/img/res-2.png'
    }, {
      type: 'audio',
      tags: ['RSE', 'DEVELOPPEMENT DURABLE'],
      media: 'assets/img/media-img.png'
    }, {
      type: 'video',
      tags: ['RSE', 'FINANCE', 'DEVELOPPEMENT DURABLE'],
      media: 'assets/img/res-2.png'
    }, {
      type: 'image',
      tags: ['RSE', 'FINANCE', 'ENTREPRENARIAT', 'DEVELOPPEMENT DURABLE'],
      media: 'assets/img/media-img.png'
    }, {
      type: 'image',
      tags: ['RSE'],
      media: 'assets/img/media-img.png'
    }, {
      type: 'audio',
      tags: ['RSE', 'FINANCE', 'ENTREPRENARIAT'],
      media: 'assets/img/media-img.png'
    }, {
      type: 'image',
      tags: ['RSE', 'FINANCE', 'ENTREPRENARIAT', 'DEVELOPPEMENT DURABLE'],
      media: 'assets/img/media-img.png'
    }, {
      type: 'video',
      tags: ['RSE', 'FINANCE', 'ENTREPRENARIAT', 'DEVELOPPEMENT DURABLE'],
      media: 'assets/img/res-2.png'
    }, {
      type: 'audio',
      tags: ['RSE', 'DEVELOPPEMENT DURABLE'],
      media: 'assets/img/media-img.png'
    }, {
      type: 'video',
      tags: ['RSE', 'FINANCE', 'DEVELOPPEMENT DURABLE'],
      media: 'assets/img/res-2.png'
    }, {
      type: 'image',
      tags: ['RSE', 'FINANCE', 'ENTREPRENARIAT', 'DEVELOPPEMENT DURABLE'],
      media: 'assets/img/media-img.png'
    }, {
      type: 'image',
      tags: ['RSE'],
      media: 'assets/img/media-img.png'
    }]
  };

  var $grid = void 0;

  function cleanTag(tagFilter) {
    tagFilter = tagFilter.trim().toLowerCase();
    if (tagFilter[0] == '#') {
      return tagFilter.slice(1);
    }

    return tagFilter;
  }

  function applyFilters() {
    $('.gallery-grid > .grid-item').each(function () {
      var notFound = true;
      $(this).find('.gallery-grid_tags > a').each(function () {
        if (state.filters.includes($(this).text().trim().slice(1).toLowerCase())) {
          notFound = false;
        }
      });
      if (notFound) {
        $(this).hide();
      } else {
        $(this).show();
      }
      console.log(notFound);
      $grid.masonry('layout');
    });

    if (state.filters.length <= 0) {
      $('.gallery-grid > .grid-item').each(function () {
        $(this).show();
        $grid.masonry('layout');
      });
    }
  }

  function changeFilters(e) {
    e.preventDefault();

    this.classList.toggle('active');

    state.filters = [];

    $('#mediacenter-detail-filters a').each(function () {
      if ($(this).hasClass('active')) {
        state.filters.push(cleanTag($(this).text()));
      }
    });

    if (state.filters.length > 0) {
      allFilterBtn.classList.remove('active');
    } else {
      allFilterBtn.classList.add('active');
    }

    applyFilters();
  }

  function init() {
    var newItems = state.data.map(function (post) {
      if (post.type == 'audio') {
        return '<div class="grid-item">\n        <div class="gallery-grid_element gallery-grid_element--empty">\n            <a class="swipebox swipebox--audio" href="' + post.media + '">\n                <div class="content"></div>\n            </a>\n            <div class="gallery-grid_tags">\n                <a href="#" class="btn btn--tag mb-s mr-s">\n                    #INSTITUTIONNELLE\n                </a>\n                <a href="#" class="btn btn--tag mb-s mr-s">\n                    #PARTICULIERS\n                </a>\n            </div>\n        </div>\n    </div>';
      } else if (post.type == 'video') {
        return '<div class="grid-item">\n        <div class="gallery-grid_element gallery-grid_element--2">\n            <a class="swipebox swipebox--video" href="' + post.media + '">\n                <img src="' + post.media + '" alt="">\n            </a>\n            <div class="gallery-grid_tags">\n                <a href="#" class="btn btn--tag mb-s mr-s">\n                    #INSTITUTIONNELLE\n                </a>\n                <a href="#" class="btn btn--tag mb-s mr-s">\n                    #PARTICULIERS\n                </a>\n            </div>\n        </div>\n    </div>';
      } else {
        return '<div class="grid-item">\n        <div class="gallery-grid_element gallery-grid_element--2">\n            <a class="swipebox swipebox--img" href="' + post.media + '">\n                <img src="' + post.media + '" alt="">\n            </a>\n            <div class="gallery-grid_tags">\n            ' + post.tags.map(function (tag) {
          return '<a href="#" class="btn btn--tag mb-s mr-s">\n              #' + tag + '\n            </a>';
        }).join('') + '\n            </div>\n        </div>\n    </div>';
      }
    });

    mediaCenterHolder.innerHTML = ['<div class="grid-sizer"></div>'].concat(_toConsumableArray(newItems)).join('');

    $(window).on('load', function () {
      $grid = gridSetup();
    });

    // setTimeout(() => {
    //   $grid = gridSetup()
    //   console.log('we are in')
    // }, 3000)
  }

  init();

  allFilterBtn.addEventListener('click', function (e) {
    e.preventDefault();
    state.filters = [];
    $('#mediacenter-detail-filters a').each(function () {
      $(this).removeClass('.active');
    });
    this.classList.add('active');
    applyFilters();
  });

  $('#mediacenter-detail-filters a').each(function () {
    $(this).on('click', changeFilters);
  });
};

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var gridSetup = exports.gridSetup = function gridSetup() {
  return $('.gallery-grid').masonry({
    itemSelector: '.grid-item',
    columnWidth: '.grid-sizer',
    percentPosition: true
  });
};

},{}],28:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.default = function () {
  var tagFilters = document.querySelectorAll('#mediacenter-filters a');
  var mediacenterHolder = document.querySelector('#mediacenter-holder');
  var startDate = document.querySelector('.start');
  var endDate = document.querySelector('.end');
  var allFilterBtn = document.querySelector('#mediacenter-filter-all');

  if (tagFilters.length <= 0 || !mediacenterHolder) return;

  var state = {
    filters: [],
    dateFilter: {
      from: '',
      to: ''
    },
    order: 'desc',
    max: 3,
    data: [{
      tags: ['RSE', 'FINANCE', 'ENTREPRENARIAT'],
      date: '21/07/2017',
      title: 'HISTOIRES POPULAIRES',
      content: 'La campagne \u201CHistoires populaires\u201D adopte une d\xE9marche encore plus proche des pr\xE9occupations des gens : ce sont des histoires\n                r\xE9elles de Marocains issus de toutes les classes sociales et qui ont r\xE9ussi \xE0 atteindre leurs objectifs dans\n                diff\xE9rents secteurs de la vie gr\xE2ce au soutien de leur banque.',
      image: 'assets/img/media-img.png'
    }, {
      title: 'HISTOIRES POPULAIRES',
      tags: ['RSE'],
      date: '29/07/2017',
      content: 'La campagne \u201CHistoires populaires\u201D adopte une d\xE9marche encore plus proche des pr\xE9occupations des gens : ce sont des histoires\n        r\xE9elles de Marocains issus de toutes les classes sociales et qui ont r\xE9ussi \xE0 atteindre leurs objectifs dans\n        diff\xE9rents secteurs de la vie gr\xE2ce au soutien de leur banque.',
      image: 'assets/img/media-img.png'
    }, {
      tags: ['RSE', 'ENTREPRENARIAT'],
      date: '22/07/2017',
      title: 'HISTOIRES POPULAIRES',
      content: 'La campagne \u201CHistoires populaires\u201D adopte une d\xE9marche encore plus proche des pr\xE9occupations des gens : ce sont des histoires\n                r\xE9elles de Marocains issus de toutes les classes sociales et qui ont r\xE9ussi \xE0 atteindre leurs objectifs dans\n                diff\xE9rents secteurs de la vie gr\xE2ce au soutien de leur banque.',
      image: 'assets/img/media-img.png'
    }, {
      tags: ['RSE', 'DEVELOPPEMENT DURABLE'],
      date: '23/07/2017',
      title: 'HISTOIRES POPULAIRES',
      content: 'La campagne \u201CHistoires populaires\u201D adopte une d\xE9marche encore plus proche des pr\xE9occupations des gens : ce sont des histoires\n                r\xE9elles de Marocains issus de toutes les classes sociales et qui ont r\xE9ussi \xE0 atteindre leurs objectifs dans\n                diff\xE9rents secteurs de la vie gr\xE2ce au soutien de leur banque.',
      image: 'assets/img/media-img.png'
    }, {
      tags: ['RSE'],
      date: '21/07/2017',
      title: 'HISTOIRES POPULAIRES',
      content: 'La campagne \u201CHistoires populaires\u201D adopte une d\xE9marche encore plus proche des pr\xE9occupations des gens : ce sont des histoires\n                r\xE9elles de Marocains issus de toutes les classes sociales et qui ont r\xE9ussi \xE0 atteindre leurs objectifs dans\n                diff\xE9rents secteurs de la vie gr\xE2ce au soutien de leur banque.',
      image: 'assets/img/media-img.png'
    }, {
      tags: ['RSE', 'FINANCE'],
      date: '24/07/2017',
      title: 'HISTOIRES POPULAIRES',
      content: 'La campagne \u201CHistoires populaires\u201D adopte une d\xE9marche encore plus proche des pr\xE9occupations des gens : ce sont des histoires\n                r\xE9elles de Marocains issus de toutes les classes sociales et qui ont r\xE9ussi \xE0 atteindre leurs objectifs dans\n                diff\xE9rents secteurs de la vie gr\xE2ce au soutien de leur banque.',
      image: 'assets/img/media-img.png'
    }, {
      tags: ['RSE', 'FINANCE'],
      date: '25/07/2017',
      title: 'HISTOIRES POPULAIRES',
      content: 'La campagne \u201CHistoires populaires\u201D adopte une d\xE9marche encore plus proche des pr\xE9occupations des gens : ce sont des histoires\n                r\xE9elles de Marocains issus de toutes les classes sociales et qui ont r\xE9ussi \xE0 atteindre leurs objectifs dans\n                diff\xE9rents secteurs de la vie gr\xE2ce au soutien de leur banque.',
      image: 'assets/img/media-img.png'
    }, {
      tags: ['RSE'],
      date: '26/07/2017',
      title: 'HISTOIRES POPULAIRES',
      content: 'La campagne \u201CHistoires populaires\u201D adopte une d\xE9marche encore plus proche des pr\xE9occupations des gens : ce sont des histoires\n                r\xE9elles de Marocains issus de toutes les classes sociales et qui ont r\xE9ussi \xE0 atteindre leurs objectifs dans\n                diff\xE9rents secteurs de la vie gr\xE2ce au soutien de leur banque.',
      image: 'assets/img/media-img.png'
    }, {
      tags: ['RSE', 'FINANCE'],
      date: '21/07/2017',
      title: 'HISTOIRES POPULAIRES',
      content: 'La campagne \u201CHistoires populaires\u201D adopte une d\xE9marche encore plus proche des pr\xE9occupations des gens : ce sont des histoires\n                r\xE9elles de Marocains issus de toutes les classes sociales et qui ont r\xE9ussi \xE0 atteindre leurs objectifs dans\n                diff\xE9rents secteurs de la vie gr\xE2ce au soutien de leur banque.',
      image: 'assets/img/media-img.png'
    }, {
      tags: ['RSE', 'FINANCE'],
      date: '21/08/2017',
      title: 'HISTOIRES POPULAIRES',
      content: 'La campagne \u201CHistoires populaires\u201D adopte une d\xE9marche encore plus proche des pr\xE9occupations des gens : ce sont des histoires\n                r\xE9elles de Marocains issus de toutes les classes sociales et qui ont r\xE9ussi \xE0 atteindre leurs objectifs dans\n                diff\xE9rents secteurs de la vie gr\xE2ce au soutien de leur banque.',
      image: 'assets/img/media-img.png'
    }, {
      tags: ['RSE'],
      date: '22/08/2016',
      title: 'HISTOIRES POPULAIRES',
      content: 'La campagne \u201CHistoires populaires\u201D adopte une d\xE9marche encore plus proche des pr\xE9occupations des gens : ce sont des histoires\n                r\xE9elles de Marocains issus de toutes les classes sociales et qui ont r\xE9ussi \xE0 atteindre leurs objectifs dans\n                diff\xE9rents secteurs de la vie gr\xE2ce au soutien de leur banque.',
      image: 'assets/img/media-img.png'
    }, {
      tags: ['RSE', 'FINANCE'],
      date: '21/09/2017',
      title: 'HISTOIRES POPULAIRES',
      content: 'La campagne \u201CHistoires populaires\u201D adopte une d\xE9marche encore plus proche des pr\xE9occupations des gens : ce sont des histoires\n                r\xE9elles de Marocains issus de toutes les classes sociales et qui ont r\xE9ussi \xE0 atteindre leurs objectifs dans\n                diff\xE9rents secteurs de la vie gr\xE2ce au soutien de leur banque.',
      image: 'assets/img/media-img.png'
    }, {
      tags: ['RSE', 'FINANCE'],
      date: '21/10/2017',
      title: 'HISTOIRES POPULAIRES',
      content: 'La campagne \u201CHistoires populaires\u201D adopte une d\xE9marche encore plus proche des pr\xE9occupations des gens : ce sont des histoires\n                r\xE9elles de Marocains issus de toutes les classes sociales et qui ont r\xE9ussi \xE0 atteindre leurs objectifs dans\n                diff\xE9rents secteurs de la vie gr\xE2ce au soutien de leur banque.',
      image: 'assets/img/media-img.png'
    }, {
      tags: ['RSE', 'FINANCE'],
      date: '21/07/2018',
      title: 'HISTOIRES POPULAIRES',
      content: 'La campagne \u201CHistoires populaires\u201D adopte une d\xE9marche encore plus proche des pr\xE9occupations des gens : ce sont des histoires\n                r\xE9elles de Marocains issus de toutes les classes sociales et qui ont r\xE9ussi \xE0 atteindre leurs objectifs dans\n                diff\xE9rents secteurs de la vie gr\xE2ce au soutien de leur banque.',
      image: 'assets/img/media-img.png'
    }, {
      tags: ['RSE', 'FINANCE'],
      date: '21/07/2018',
      title: 'HISTOIRES POPULAIRES',
      content: 'La campagne \u201CHistoires populaires\u201D adopte une d\xE9marche encore plus proche des pr\xE9occupations des gens : ce sont des histoires\n                r\xE9elles de Marocains issus de toutes les classes sociales et qui ont r\xE9ussi \xE0 atteindre leurs objectifs dans\n                diff\xE9rents secteurs de la vie gr\xE2ce au soutien de leur banque.',
      image: 'assets/img/media-img.png'
    }, {
      tags: ['RSE', 'FINANCE'],
      date: '21/07/2019',
      title: 'HISTOIRES POPULAIRES',
      content: 'La campagne \u201CHistoires populaires\u201D adopte une d\xE9marche encore plus proche des pr\xE9occupations des gens : ce sont des histoires\n                r\xE9elles de Marocains issus de toutes les classes sociales et qui ont r\xE9ussi \xE0 atteindre leurs objectifs dans\n                diff\xE9rents secteurs de la vie gr\xE2ce au soutien de leur banque.',
      image: 'assets/img/media-img.png'
    }, {
      tags: ['RSE', 'FINANCE'],
      date: '21/07/2020',
      title: 'HISTOIRES POPULAIRES',
      content: 'La campagne \u201CHistoires populaires\u201D adopte une d\xE9marche encore plus proche des pr\xE9occupations des gens : ce sont des histoires\n                r\xE9elles de Marocains issus de toutes les classes sociales et qui ont r\xE9ussi \xE0 atteindre leurs objectifs dans\n                diff\xE9rents secteurs de la vie gr\xE2ce au soutien de leur banque.',
      image: 'assets/img/media-img.png'
    }]
  };

  function cleanTag(tagFilter) {
    tagFilter = tagFilter.toLowerCase();
    if (tagFilter[0] == '#') {
      tagFilter = tagFilter.slice(1);
    }

    return tagFilter;
  }

  function makeDateObject(dateString) {
    var _dateString$split = dateString.split('/'),
        _dateString$split2 = _slicedToArray(_dateString$split, 3),
        day = _dateString$split2[0],
        month = _dateString$split2[1],
        year = _dateString$split2[2];

    return new Date(year, month - 1, day);
  }

  function applyFilters() {
    var data = state.data;
    if (state.filters.length > 0) {
      data = data.filter(function (post) {
        for (var i = 0; i < state.filters.length; i++) {
          if (post.tags.includes(state.filters[i].toUpperCase())) {
            return true;
          }
        }
        return false;
      });
    }

    if (state.dateFilter.from && state.dateFilter.to) {
      data = data.filter(function (post) {
        if (makeDateObject(post.date) - makeDateObject(state.dateFilter.from) >= 0 && makeDateObject(post.date) - makeDateObject(state.dateFilter.to) <= 0) {
          return true;
        }

        return false;
      });
    }

    data = data.sort(function (a, b) {
      return state.order == 'desc' ? makeDateObject(b.date) - makeDateObject(a.date) : makeDateObject(a.date) - makeDateObject(b.date);
    });

    showSelected(data);
  }
  function changeFilters(e) {
    e.preventDefault();

    this.classList.toggle('active');

    state.filters = [];

    tagFilters.forEach(function (tag) {
      if ($(tag).hasClass('active')) {
        state.filters.push(cleanTag(tag.innerText));
      }
    });

    if (state.filters.length > 0) {
      allFilterBtn.classList.remove('active');
    } else {
      allFilterBtn.classList.add('active');
    }

    applyFilters();
  }

  function showSelected(data) {
    var selectedData = data.slice(0, state.max * 3);

    console.log(data.length);
    console.log(selectedData.length);

    if (selectedData.length >= data.length) {
      $('#more-mediacenter').hide();
    } else {
      $('#more-mediacenter').show();
    }

    render(selectedData);
  }

  applyFilters();

  $('#more-mediacenter').on('click', function (e) {
    e.preventDefault();
    state.max++;
    applyFilters();

    this.scrollIntoView({
      behavior: 'smooth',
      inline: 'end'
    });
    if (state.max + 1 > state.data.length / 3) $(this).hide();
  });

  function render(data) {
    mediacenterHolder.innerHTML = data.map(function (post, index) {
      if (index % 2 === 0) {
        return '<div class="media-card my-8 ">\n                    <div class="row">\n                        <a class="col-md-5 media-card__imgside" href="/gbp-front/mediacenter-detail.html">\n                            <img class="media-card__img" src="' + post.image + '" alt="media image">\n                        </a>\n                        <div class="col-md-7 media-card__contentside ">\n                            <div class="card-media__tag ">\n                            ' + post.tags.map(function (tag) {
          return '<a class="btn btn--tag btn--orange active mr-1" href="/gbp-front/mediacenter.html"> #' + tag + '</a>';
        }).join('') + '\n                            </div>\n                            <h2 class="media-card__title">' + post.title + '</h2>\n                            <p class="media-card__content">\n                                ' + post.content + '\n                            </p>\n                            <div class="media-card__footer">\n                                <div class="card-footer__metadata">\n                                    <strong class="card-footer__datetitle">Date de lancement</strong>\n                                    <span class="card-footer__date">' + post.date + '</span>\n                                </div>\n                                <div class="card-footer__action">\n                                    <a href="/gbp-front/mediacenter-detail.html">D\xC9COUVRIR</a>\n                                </div>\n                            </div>\n                        </div>\n                    </div>\n                </div>';
      } else {
        return '<div class="media-card media-card--reverse my-8">\n          <div class="row">\n              <div class="col-md-7 media-card__contentside">\n                  <div class="card-media__tag ">\n                  ' + post.tags.map(function (tag) {
          return '<a class="btn btn--tag btn--orange active mr-1" href="/gbp-front/mediacenter.html"> #' + tag + '</a>';
        }).join('') + '\n                  </div>\n                  <h2 class="media-card__title">' + post.title + '</h2>\n                  <p class="media-card__content">\n                  ' + post.content + '\n                  </p>\n                  <div class="media-card__footer">\n                      <div class="card-footer__metadata">\n                          <strong class="card-footer__datetitle">Date de lancement</strong>\n                          <span class="card-footer__date">' + post.date + '</span>\n                      </div>\n                      <div class="card-footer__action">\n                          <a href="/gbp-front/mediacenter-detail.html">D\xC9COUVRIR</a>\n                      </div>\n                  </div>\n              </div>\n              <a class="col-md-5 media-card__imgside" href="/gbp-front/mediacenter-detail.html">\n                  <img class="media-card__img" src="' + post.image + '" alt="media image">\n              </a>\n          </div>\n      </div>';
      }
    }).join('');
  }

  function dateFormat(date) {
    return '1/' + (date.month() + 1) + '/' + date.year();
  }

  var startFilter = new _index2.default(startDate, false, function (start) {
    state.dateFilter.from = dateFormat(start);
    applyFilters();
  });
  startFilter.init();

  var endFilter = new _index2.default(endDate, true, function (end) {
    state.dateFilter.to = dateFormat(end);
    applyFilters();
  });
  endFilter.init();

  $('#mediacenter-select-filter').on('change', function () {
    var selected = $('#mediacenter-select-filter').next().find('.current').text();
    selected = selected.toLowerCase();

    // console.log(selected)

    $('#date-filter').addClass('d-flex');
    $('#date-filter').show();

    if (selected !== 'période') {
      $('#date-filter').removeClass('d-flex');
      $('#date-filter').hide();
      state.order = 'desc';
      state.dateFilter.from = '';
      state.dateFilter.to = '';
      startFilter.clear();
      endFilter.clear();
    }

    if (selected === 'plus anciens') {
      state.order = 'asc';
      applyFilters();
    } else if (selected === 'plus récents') {
      applyFilters();
      state.order = 'desc';
    }
  });

  allFilterBtn.addEventListener('click', function (e) {
    e.preventDefault();
    state.filters = [];
    tagFilters.forEach(function (tag) {
      tag.classList.remove('active');
    });
    this.classList.add('active');
    applyFilters();
  });
  tagFilters.forEach(function (tag) {
    tag.addEventListener('click', changeFilters);
  });
};

var _index = require('../../components/date-filter/index.js');

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

},{"../../components/date-filter/index.js":15}],29:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function () {
  var sliderIndex;

  if ($('.nos-banques').length) {
    handleEventListeners();
  }

  if ($('.nos-banques .owl-carousel').length) {
    var rtl = $('html').attr('dir') == 'rtl';

    if ($(window).width() > 768) {
      $('.nos-banques .owl-carousel').owlCarousel('destroy');
      banquesSlider(0, rtl);
    } else {
      $('.nos-banques .owl-carousel').owlCarousel('destroy');
      banquesSlider(0, rtl);
    }

    $(window).on('resize', function () {
      if ($(window).width() > 768) {
        $('.nos-banques .owl-carousel').owlCarousel('destroy');
        banquesSlider(0, rtl);
      } else {
        $('.nos-banques .owl-carousel').owlCarousel('destroy');
        banquesSlider(0, rtl);
      }
    });
  }

  function removeHash() {
    history.pushState('', document.title, window.location.pathname + window.location.search);
  }

  function banquesSlider(stagePadding, rtl) {
    var owl = $('.nos-banques .owl-carousel').owlCarousel({
      stagePadding: stagePadding,
      margin: 0,
      dots: true,
      nav: true,
      loop: true,
      URLhashListener: true,
      navSpeed: 1000,
      rtl: rtl,
      responsive: {
        0: {
          items: 1
        }
      }
    });

    owl.on('drag.owl.carousel', function (event) {
      if (event.relatedTarget['_drag']['direction']) {
        var indexBeforeChange = event.page.index;

        sliderIndex = indexBeforeChange;
      }
    });

    owl.on('dragged.owl.carousel', function (event) {
      var indexAfterChange = event.page.index;

      if (event.relatedTarget['_drag']['direction']) {
        if (indexAfterChange !== sliderIndex) {
          if (event.relatedTarget['_drag']['direction'] === 'left') {
            next();
          } else {
            prev();
          }
        }
      }

      // console.log(event)
    });

    $('.owl-next').on('click', function () {
      next();
    });

    $('.owl-prev').on('click', function () {
      prev();
    });

    function next() {
      var currentItem = $('.nos-banques_links .item.active');

      currentItem.removeClass('active');

      if (currentItem.is(':last-child')) {
        $('.nos-banques_links .item:first-child').addClass('active');
      } else {
        currentItem.next().addClass('active');
      }
    }

    function prev() {
      var currentItem = $('.nos-banques_links .item.active');

      currentItem.removeClass('active');

      if (currentItem.is(':first-child')) {
        $('.nos-banques_links .item:last-child').addClass('active');
      } else {
        currentItem.prev().addClass('active');
      }
    }
  }

  function handleEventListeners() {
    $('.nos-banques_links .item:first-child').addClass('active');

    $('.nos-banques_links .item').on('click', function (e) {
      e.preventDefault();
      var clickedItem = $(this);

      if (!clickedItem.hasClass('active')) {
        $('.nos-banques_links .item.active').removeClass('active');
        clickedItem.addClass('active');
      }

      var clickedIndex = clickedItem.data('index');

      $('.nos-banques .owl-carousel').trigger('to.owl.carousel', clickedIndex);
    });
  }
};

},{}],30:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function () {
  var searchInput = document.querySelector('#popup-search-input');
  var tagFilters = document.querySelectorAll('.popup-search_tag');
  var allFilterBtn = document.querySelector('.popup-search_tag--all');

  if (!searchInput) return;

  var state = {
    search: '',
    filters: [],
    data: [{
      category: 'ACTUALITES',
      tags: ['articles', 'videos'],
      text: 'Lorem1 ipsum dolor set amet'
    }, {
      category: 'ACTUALITES',
      tags: ['articles', 'videos'],
      text: 'Lorem2 ipsum dolor set amet'
    }, {
      category: 'ACTUALITES',
      tags: ['articles', 'videos', 'images'],
      text: 'Lorem1 ipsum dolor set amet'
    }, {
      category: 'ACTUALITES',
      tags: ['articles', 'videos'],
      text: 'Lorem3 ipsum dolor set amet'
    }, {
      category: 'COMMUNIQUÉS',
      tags: ['articles', 'videos', 'images'],
      text: 'Lorem1 ipsum dolor set amet'
    }, {
      category: 'COMMUNIQUÉS',
      tags: ['articles', 'videos'],
      text: 'Lorem1 ipsum dolor set amet'
    }, {
      category: 'COMMUNIQUÉS',
      tags: ['articles', 'videos', 'images'],
      text: 'Lorem2 ipsum dolor set amet'
    }, {
      category: 'COMMUNIQUÉS',
      tags: ['articles', 'videos'],
      text: 'Lorem1 ipsum dolor set amet'
    }, {
      category: 'COMMUNIQUÉS',
      tags: ['articles', 'videos'],
      text: 'Lorem3 ipsum dolor set amet'
    }, {
      category: 'PRESSE',
      tags: ['articles', 'videos', 'images'],
      text: 'Lorem2 ipsum dolor set amet'
    }, {
      category: 'PRESSE',
      tags: ['articles', 'videos'],
      text: 'Lorem1 ipsum dolor set amet'
    }, {
      category: 'PRESSE',
      tags: ['articles', 'videos'],
      text: 'Lorem3 ipsum dolor set amet'
    }, {
      category: 'COMPAGNES PUB',
      tags: ['articles', 'videos', 'images'],
      text: 'Lorem2 ipsum dolor set amet'
    }, {
      category: 'COMPAGNES PUB',
      tags: ['articles', 'videos'],
      text: 'Lorem1 ipsum dolor set amet'
    }, {
      category: 'RAPPORTS FINANCIERS',
      tags: ['articles', 'videos'],
      text: 'Lorem3 ipsum dolor set amet'
    }, {
      category: 'RAPPORTS FINANCIERS',
      tags: ['articles', 'videos', 'images'],
      text: 'Lorem2 ipsum dolor set amet'
    }, {
      category: 'RAPPORTS FINANCIERS',
      tags: ['articles', 'videos'],
      text: 'Lorem1 ipsum dolor set amet'
    }, {
      category: 'RAPPORTS FINANCIERS',
      tags: ['articles', 'videos'],
      text: 'Lorem3 ipsum dolor set amet'
    }, {
      category: 'AUTRES',
      tags: ['articles', 'videos', 'images'],
      text: 'Lorem2 ipsum dolor set amet'
    }, {
      category: 'AUTRES',
      tags: ['articles', 'videos'],
      text: 'Lorem1 ipsum dolor set amet'
    }, {
      category: 'AUTRES',
      tags: ['articles', 'videos'],
      text: 'Lorem3 ipsum dolor set amet'
    }]
  };

  function cleanTag(tagFilter) {
    tagFilter = tagFilter.trim().toLowerCase();
    if (tagFilter[0] == '#') {
      tagFilter = tagFilter.slice(1);
    }

    return tagFilter;
  }

  function matchTags(tags, filters) {
    return tags.some(function (tag) {
      for (var i = 0; i < filters.length; i++) {
        if (tag.includes(filters[i])) return true;
      }

      return false;
    });
  }

  function checkSearchResult() {
    if (state.search) {
      $('.popup-search_result').show();
    } else {
      $('.popup-search_result').hide();
    }
  }

  function applyFilters() {
    var data = state.data;

    if (state.search) {
      data = data.filter(function (post) {
        if (post.text.toLowerCase().includes(state.search.toLowerCase()) && (matchTags(post.tags, state.filters) || state.filters.length <= 0)) {
          return true;
        }
        return false;
      }).map(function (post) {
        var regexp = new RegExp('(' + state.search + ')', 'i');

        var text = post.text.replace(regexp, '<span class="found" >$1</span>');

        return {
          category: post.category,
          tags: [].concat(_toConsumableArray(post.tags)),
          text: text
        };
      });
    }

    checkSearchResult();

    render(data);
  }

  function filterAndMap(elem, data, category) {
    var foundResult = data.filter(function (post) {
      if (post.category === 'COMMUNIQUÉS') return true;

      return false;
    }).map(function (post) {
      var text = post.text;
      return '<li class="item">\n              <a href="/gbp-front/news-detail.html">\n                  ' + text + '\n              </a>\n          </li>';
    });

    elem.find('ul').html(foundResult.join(''));
    elem.find('.popup-menu_length').text(foundResult.length);
    if (foundResult.length <= 0) {
      elem.find('.item-plus').hide();
    } else {
      elem.find('.item-plus').show();
    }
  }

  function render(data) {
    // console.log(data)

    // COMMUNIQUÉS
    filterAndMap($('#search-communiques'), data, 'COMMUNIQUÉS');
    // ACTUALITES
    filterAndMap($('#search-actualites'), data, 'ACTUALITES');
    // RAPPORTS FINANCIERS
    filterAndMap($('#search-rapports'), data, 'RAPPORTS FINANCIERS');
    // AUTRES
    filterAndMap($('#search-autres'), data, 'AUTRES');
    // PRESSE
    filterAndMap($('#search-presse'), data, 'PRESSE');
    // COMPAGNES PUB
    filterAndMap($('#search-compagnes'), data, 'COMPAGNES PUB');
  }

  function changeFilters(e) {
    e.preventDefault();

    this.classList.toggle('active');

    state.filters = [];

    tagFilters.forEach(function (tag) {
      if ($(tag).hasClass('active')) {
        state.filters.push(cleanTag(tag.innerText));
      }
    });

    // console.log(state.filters)

    if (state.filters.length > 0) {
      allFilterBtn.classList.remove('active');
    } else {
      allFilterBtn.classList.add('active');
    }

    applyFilters();
  }

  allFilterBtn.addEventListener('click', function (e) {
    e.preventDefault();
    state.filters = [];
    tagFilters.forEach(function (tag) {
      tag.classList.remove('active');
    });
    this.classList.add('active');
    applyFilters();
  });

  tagFilters.forEach(function (tag) {
    tag.addEventListener('click', changeFilters);
  });

  searchInput.addEventListener('input', function () {
    state.search = this.value;
    applyFilters();
  });
};

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

},{}],31:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function () {
  if ($('.header_search').length) {
    addEventListeners();
  }

  function addEventListeners() {
    $('.header_search-pop, .header_mobile-search').on('click', function () {
      $('.page-content').addClass('d-none');
      $('.popup-search').removeClass('d-none');
    });

    $('.close-wrapper').on('click', function () {
      $('.page-content').removeClass('d-none');
      $('.popup-search').addClass('d-none');
    });
  }
};

},{}],32:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function () {
	if ($('.swipebox--video').length) {
		addEventListeners();
	}

	function addEventListeners() {
		$('.swipebox--video').on('click', function () {
			$('.page-content').addClass('d-none');
			$('.popup-video').removeClass('d-none');
		});

		$('.close-wrapper').on('click', function () {
			$('.page-content').removeClass('d-none');
			$('.popup-video_section iframe').remove();
			$('.popup-video').addClass('d-none');
		});

		$('.swipebox--video').on('click', function (e) {
			var ytbId = $(this).attr('href');

			e.preventDefault();
			playVideo(ytbId);
		});

		$('.popup-video_slider .swipebox--video').on('click', function (e) {
			var ytbId = $(this).attr('href');

			e.preventDefault();
			playVideo(ytbId);
		});
	}

	function playVideo(ytbId) {

		var html = '<iframe  width="100%" height="400" \n\t\t\t\t\t\tsrc="https://www.youtube.com/embed/' + ytbId + '?autoplay=1" \n\t\t\t\t\t\tframeborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>';

		$('.popup-video_section iframe').remove();

		$('.popup-video_section').prepend(html);
	}

	// carousel video
	if ($('.popup-video_slider').length) {

		var rtl = $('html').attr('dir') == 'rtl';

		if ($(window).width() > 768) {
			popupVideoSlider(0, rtl);
		} else {
			popupVideoSlider(20, rtl);
		}

		$(window).on('resize', function () {
			if ($(window).width() > 768) {
				popupVideoSlider(0, rtl);
			} else {
				popupVideoSlider(20, rtl);
			}
		});
	}

	function popupVideoSlider(stagePadding, rtl) {
		$('.popup-video_slider.owl-carousel').owlCarousel({
			stagePadding: stagePadding,
			margin: 10,
			dots: false,
			nav: false,
			loop: false,
			rtl: rtl,
			responsive: {
				0: {
					items: 1
				},
				768: {
					items: 5
				}
			}
		});
	}
};

},{}],33:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function () {
  if ($('.pub-slider').length) {
    if ($(window).width() > 991) {
      articleSlider(0);
    } else {
      articleSlider(0);
    }

    $(window).on('resize', function () {
      if ($(window).width() > 991) {
        articleSlider(0);
      } else {
        articleSlider(0);
      }
    });
  }

  function articleSlider(stagePadding) {
    $('.pub-slider.owl-carousel').owlCarousel({
      stagePadding: stagePadding,
      margin: 18,
      dots: true,
      nav: true,
      loop: true,
      responsive: {
        0: {
          items: 1
        },
        992: {
          items: 1
        }
      }
    });
  }
};

},{}],34:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function () {
  var tagFilters = document.querySelectorAll('#result-filters a');
  var allFilterBtn = document.querySelector('#result-filter-all');
  var acualitesHolder = document.querySelector('#result-acualites-holder');

  if (!acualitesHolder) return;

  var state = {
    filters: [],
    search: '',
    type: 'documents',
    data: {
      actualites: [{
        type: 'article-img',
        tags: ['RSE', 'FINANCE', 'ENTREPRENARIAT'],
        date: '21/07/2017',
        title: 'une ambiance festive et familiale que s’est déroulé',
        content: 'Le Groupe BCP, acteur panafricain de référence, et la Société FinaTncière Internationale (IFC)...',
        image: 'assets/img/actu-2.png'
      }, {
        type: 'article',
        tags: ['RSE', 'ENTREPRENARIAT'],
        date: '22/07/2017',
        title: 'une ambiance festive et familiale que s’est déroulé',
        content: 'Le Groupe BCP, acteur panafricain de référence, et la Société FinaTncière Internationale (IFC)...'
      }, {
        type: 'article',
        tags: ['RSE', 'DEVELOPPEMENT DURABLE'],
        date: '23/07/2017',
        title: 'une ambiance festive et familiale que s’est déroulé',
        content: 'Le Groupe BCP, acteur panafricain de référence, et la Société FinaTncière Internationale (IFC)...'
      }, {
        type: 'article',
        tags: ['RSE'],
        date: '21/07/2017',
        title: 'une ambiance festive et familiale que s’est déroulé',
        content: 'Le Groupe BCP, acteur panafricain de référence, et la Société FinaTncière Internationale (IFC)...'
      }],
      communiques: [{
        tags: ['RSE', 'FINANCE'],
        date: '21/07/2018',
        title: 'Le Groupe BCP lance la première banque marocaine dédiée à l’activité “titres”',
        size: 450,
        type: 'pdf'
      }, {
        tags: ['RSE', 'FINANCE'],
        date: '21/07/2018',
        title: 'Le Groupe BCP lance la première banque marocaine dédiée à l’activité “titres”',
        size: 450,
        type: 'pdf'
      }, {
        tags: ['RSE', 'FINANCE'],
        date: '21/07/2019',
        title: 'Le Groupe BCP lance la première banque marocaine dédiée à l’activité “titres”',
        size: 450,
        type: 'pdf'
      }, {
        tags: ['RSE', 'FINANCE'],
        date: '21/07/2020',
        title: 'Le Groupe BCP lance la première banque marocaine dédiée à l’activité “titres”',
        size: 450,
        type: 'pdf'
      }],
      compagnes: [{
        tags: ['RSE', 'FINANCE'],
        date: '21/07/2018',
        title: 'HISTOIRES POPULAIRES',
        content: 'La campagne \u201CHistoires populaires\u201D adopte une d\xE9marche encore plus proche des pr\xE9occupations des gens : ce sont des histoires\n                r\xE9elles de Marocains issus de toutes les classes sociales et qui ont r\xE9ussi \xE0 atteindre leurs objectifs dans\n                diff\xE9rents secteurs de la vie gr\xE2ce au soutien de leur banque.',
        image: 'assets/img/media-img.png'
      }, {
        tags: ['RSE', 'FINANCE'],
        date: '21/07/2018',
        title: 'HISTOIRES POPULAIRES',
        content: 'La campagne \u201CHistoires populaires\u201D adopte une d\xE9marche encore plus proche des pr\xE9occupations des gens : ce sont des histoires\n                r\xE9elles de Marocains issus de toutes les classes sociales et qui ont r\xE9ussi \xE0 atteindre leurs objectifs dans\n                diff\xE9rents secteurs de la vie gr\xE2ce au soutien de leur banque.',
        image: 'assets/img/media-img.png'
      }, {
        tags: ['RSE', 'FINANCE'],
        date: '21/07/2019',
        title: 'HISTOIRES POPULAIRES',
        content: 'La campagne \u201CHistoires populaires\u201D adopte une d\xE9marche encore plus proche des pr\xE9occupations des gens : ce sont des histoires\n                r\xE9elles de Marocains issus de toutes les classes sociales et qui ont r\xE9ussi \xE0 atteindre leurs objectifs dans\n                diff\xE9rents secteurs de la vie gr\xE2ce au soutien de leur banque.',
        image: 'assets/img/media-img.png'
      }, {
        tags: ['RSE', 'FINANCE'],
        date: '21/07/2020',
        title: 'HISTOIRES POPULAIRES',
        content: 'La campagne \u201CHistoires populaires\u201D adopte une d\xE9marche encore plus proche des pr\xE9occupations des gens : ce sont des histoires\n                r\xE9elles de Marocains issus de toutes les classes sociales et qui ont r\xE9ussi \xE0 atteindre leurs objectifs dans\n                diff\xE9rents secteurs de la vie gr\xE2ce au soutien de leur banque.',
        image: 'assets/img/media-img.png'
      }]
    }
  };

  function applyFilters() {
    $('.header-section_search-result').text(state.search);

    var data = state.data;
    if (state.filters.length > 0) {
      data.actualites = state.data.actualites.filter(function (post) {
        for (var i = 0; i < state.filters.length; i++) {
          if (post.tags.includes(state.filters[i].toUpperCase())) {
            return true;
          }
        }
        return false;
      });
    }
    render(data);
  }

  function render(data) {}

  function cleanTag(tagFilter) {
    tagFilter = tagFilter.trim().toLowerCase();
    if (tagFilter[0] == '#') {
      return tagFilter.slice(1);
    }

    return tagFilter;
  }

  function changeFilters(e) {
    e.preventDefault();

    this.classList.toggle('active');

    state.filters = [];

    tagFilters.forEach(function (tag) {
      if ($(tag).hasClass('active')) {
        state.filters.push(cleanTag(tag.innerText));
      }
    });

    if (state.filters.length > 0) {
      allFilterBtn.classList.remove('active');
    } else {
      allFilterBtn.classList.add('active');
    }

    applyFilters();
  }

  function submitForm(e) {
    e.preventDefault();
    state.search = $('#result-search').val();
    applyFilters();
  }

  allFilterBtn.addEventListener('click', function (e) {
    e.preventDefault();
    state.filters = [];
    tagFilters.forEach(function (tag) {
      tag.classList.remove('active');
    });
    this.classList.add('active');
    applyFilters();
  });

  tagFilters.forEach(function (tag) {
    tag.addEventListener('click', changeFilters);
  });

  $('#result-select-type').on('change', function () {
    state.type = $(this).next().find('.current').text().toLowerCase();
    applyFilters();
  });

  $('#result-search-btn').on('click', submitForm);
  $('#search-form').on('submit', submitForm);
};

},{}],35:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function () {
	$('select.nice-select').niceSelect();
};

},{}],36:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function () {
	if ($('.swipebox').length) {
		//$('.swipebox').swipebox();
	}
};

},{}],37:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.tracker = tracker;

exports.default = function () {
  var data = {
    periods: [{
      year: 2018,
      actions: {
        left: [{
          date: '11-01-2018',
          content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Dignissimos, suscipit!'
        }, {
          date: '11-02-2018',
          content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Dignissimos, suscipit!'
        }, {
          date: '11-03-2018',
          title: 'DISTINCTIONS<br> &TROPHÉES',
          content: '<span class="timeline_card_smalltitle">\n                        African Banker Awards 2015\n                      </span>\n                      Troph\xE9e \xAB Banque Africaine de l\u2019Ann\xE9e \xBB d\xE9cern\xE9 au Groupe Banque Centrale Populaire Troph\xE9e \xAB Inclusion Financi\xE8re \xBB remport\xE9\n                      par la filiale Attawfiq Micro-Finance. Cartes\n                      <span class="timeline_card_smalltitle">\n                        Afrique Awards 2015\n                      </span>\n                      Obtention du troph\xE9e \xAB Best Innovative Card Programme \xBB attribu\xE9 \xE0 \xAB GlobalCard \xBB, une carte mon\xE9tique pr\xE9pay\xE9e destin\xE9e\n                      aux voyageurs de passage au Maroc et qui constitue un moyen de substitution \xE0 la monnaie fiduciaire.\n                      <span class="timeline_card_smalltitle">\n                        Morocco MasterCard Customers Meetings 2015\n                      </span>\n                      Le Groupe Banque Centrale Populaire a remport\xE9 \xE0 cette occasion le troph\xE9e de champion national d\u2019activation des cartes de\n                      paiement TPE \xAB Pos Usage Activation Champion \xBB.'
        }],
        right: [{
          date: '11-03-2018',
          content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Dignissimos, suscipit!',
          media: 'assets/img/res-2.png'
        }, {
          date: '11-03-2018',
          content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Dignissimos, suscipit!',
          media: 'assets/img/explorer-metiers2.png'
        }]
      }
    }, {
      year: 2017,
      actions: {
        left: [{
          date: '11-01-2018',
          content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Dignissimos, suscipit!'
        }, {
          date: '11-02-2018',
          content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Dignissimos, suscipit!'
        }, {
          date: '11-03-2018',
          title: 'DISTINCTIONS<br> &TROPHÉES',
          content: '<span class="timeline_card_smalltitle">\n                        African Banker Awards 2015\n                      </span>\n                      Troph\xE9e \xAB Banque Africaine de l\u2019Ann\xE9e \xBB d\xE9cern\xE9 au Groupe Banque Centrale Populaire Troph\xE9e \xAB Inclusion Financi\xE8re \xBB remport\xE9\n                      par la filiale Attawfiq Micro-Finance. Cartes\n                      <span class="timeline_card_smalltitle">\n                        Afrique Awards 2015\n                      </span>\n                      Obtention du troph\xE9e \xAB Best Innovative Card Programme \xBB attribu\xE9 \xE0 \xAB GlobalCard \xBB, une carte mon\xE9tique pr\xE9pay\xE9e destin\xE9e\n                      aux voyageurs de passage au Maroc et qui constitue un moyen de substitution \xE0 la monnaie fiduciaire.\n                      <span class="timeline_card_smalltitle">\n                        Morocco MasterCard Customers Meetings 2015\n                      </span>\n                      Le Groupe Banque Centrale Populaire a remport\xE9 \xE0 cette occasion le troph\xE9e de champion national d\u2019activation des cartes de\n                      paiement TPE \xAB Pos Usage Activation Champion \xBB.'
        }],
        right: [{
          date: '11-03-2018',
          content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Dignissimos, suscipit!',
          media: 'assets/img/res-2.png'
        }, {
          date: '11-03-2018',
          content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Dignissimos, suscipit!',
          media: 'assets/img/explorer-metiers2.png'
        }]
      }
    }, {
      year: 2016,
      actions: {
        left: [{
          date: '11-01-2018',
          content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Dignissimos, suscipit!'
        }, {
          date: '11-02-2018',
          content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Dignissimos, suscipit!'
        }, {
          date: '11-03-2018',
          title: 'DISTINCTIONS<br> &TROPHÉES',
          content: '<span class="timeline_card_smalltitle">\n                        African Banker Awards 2015\n                      </span>\n                      Troph\xE9e \xAB Banque Africaine de l\u2019Ann\xE9e \xBB d\xE9cern\xE9 au Groupe Banque Centrale Populaire Troph\xE9e \xAB Inclusion Financi\xE8re \xBB remport\xE9\n                      par la filiale Attawfiq Micro-Finance. Cartes\n                      <span class="timeline_card_smalltitle">\n                        Afrique Awards 2015\n                      </span>\n                      Obtention du troph\xE9e \xAB Best Innovative Card Programme \xBB attribu\xE9 \xE0 \xAB GlobalCard \xBB, une carte mon\xE9tique pr\xE9pay\xE9e destin\xE9e\n                      aux voyageurs de passage au Maroc et qui constitue un moyen de substitution \xE0 la monnaie fiduciaire.\n                      <span class="timeline_card_smalltitle">\n                        Morocco MasterCard Customers Meetings 2015\n                      </span>\n                      Le Groupe Banque Centrale Populaire a remport\xE9 \xE0 cette occasion le troph\xE9e de champion national d\u2019activation des cartes de\n                      paiement TPE \xAB Pos Usage Activation Champion \xBB.'
        }],
        right: [{
          date: '11-03-2018',
          content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Dignissimos, suscipit!',
          media: 'assets/img/res-2.png'
        }, {
          date: '11-03-2018',
          content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Dignissimos, suscipit!',
          media: 'assets/img/explorer-metiers2.png'
        }]
      }
    }, {
      year: 2015,
      actions: {
        left: [{
          date: '11-01-2018',
          content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Dignissimos, suscipit!'
        }, {
          date: '11-02-2018',
          content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Dignissimos, suscipit!'
        }, {
          date: '11-03-2018',
          title: 'DISTINCTIONS<br> &TROPHÉES',
          content: '<span class="timeline_card_smalltitle">\n                        African Banker Awards 2015\n                      </span>\n                      Troph\xE9e \xAB Banque Africaine de l\u2019Ann\xE9e \xBB d\xE9cern\xE9 au Groupe Banque Centrale Populaire Troph\xE9e \xAB Inclusion Financi\xE8re \xBB remport\xE9\n                      par la filiale Attawfiq Micro-Finance. Cartes\n                      <span class="timeline_card_smalltitle">\n                        Afrique Awards 2015\n                      </span>\n                      Obtention du troph\xE9e \xAB Best Innovative Card Programme \xBB attribu\xE9 \xE0 \xAB GlobalCard \xBB, une carte mon\xE9tique pr\xE9pay\xE9e destin\xE9e\n                      aux voyageurs de passage au Maroc et qui constitue un moyen de substitution \xE0 la monnaie fiduciaire.\n                      <span class="timeline_card_smalltitle">\n                        Morocco MasterCard Customers Meetings 2015\n                      </span>\n                      Le Groupe Banque Centrale Populaire a remport\xE9 \xE0 cette occasion le troph\xE9e de champion national d\u2019activation des cartes de\n                      paiement TPE \xAB Pos Usage Activation Champion \xBB.'
        }],
        right: [{
          date: '11-03-2018',
          content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Dignissimos, suscipit!',
          media: 'assets/img/res-2.png'
        }, {
          date: '11-03-2018',
          content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Dignissimos, suscipit!',
          media: 'assets/img/explorer-metiers2.png'
        }]
      }
    }, {
      year: 2014,
      actions: {
        left: [{
          date: '11-01-2018',
          content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Dignissimos, suscipit!'
        }, {
          date: '11-02-2018',
          content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Dignissimos, suscipit!'
        }, {
          date: '11-03-2018',
          title: 'DISTINCTIONS<br> &TROPHÉES',
          content: '<span class="timeline_card_smalltitle">\n                        African Banker Awards 2015\n                      </span>\n                      Troph\xE9e \xAB Banque Africaine de l\u2019Ann\xE9e \xBB d\xE9cern\xE9 au Groupe Banque Centrale Populaire Troph\xE9e \xAB Inclusion Financi\xE8re \xBB remport\xE9\n                      par la filiale Attawfiq Micro-Finance. Cartes\n                      <span class="timeline_card_smalltitle">\n                        Afrique Awards 2015\n                      </span>\n                      Obtention du troph\xE9e \xAB Best Innovative Card Programme \xBB attribu\xE9 \xE0 \xAB GlobalCard \xBB, une carte mon\xE9tique pr\xE9pay\xE9e destin\xE9e\n                      aux voyageurs de passage au Maroc et qui constitue un moyen de substitution \xE0 la monnaie fiduciaire.\n                      <span class="timeline_card_smalltitle">\n                        Morocco MasterCard Customers Meetings 2015\n                      </span>\n                      Le Groupe Banque Centrale Populaire a remport\xE9 \xE0 cette occasion le troph\xE9e de champion national d\u2019activation des cartes de\n                      paiement TPE \xAB Pos Usage Activation Champion \xBB.'
        }],
        right: [{
          date: '11-03-2018',
          content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Dignissimos, suscipit!',
          media: 'assets/img/res-2.png'
        }, {
          date: '11-03-2018',
          content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Dignissimos, suscipit!',
          media: 'assets/img/explorer-metiers2.png'
        }]
      }
    }, {
      year: 2013,
      actions: {
        left: [{
          date: '11-01-2018',
          content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Dignissimos, suscipit!'
        }, {
          date: '11-02-2018',
          content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Dignissimos, suscipit!'
        }, {
          date: '11-03-2018',
          title: 'DISTINCTIONS<br> &TROPHÉES',
          content: '<span class="timeline_card_smalltitle">\n                        African Banker Awards 2015\n                      </span>\n                      Troph\xE9e \xAB Banque Africaine de l\u2019Ann\xE9e \xBB d\xE9cern\xE9 au Groupe Banque Centrale Populaire Troph\xE9e \xAB Inclusion Financi\xE8re \xBB remport\xE9\n                      par la filiale Attawfiq Micro-Finance. Cartes\n                      <span class="timeline_card_smalltitle">\n                        Afrique Awards 2015\n                      </span>\n                      Obtention du troph\xE9e \xAB Best Innovative Card Programme \xBB attribu\xE9 \xE0 \xAB GlobalCard \xBB, une carte mon\xE9tique pr\xE9pay\xE9e destin\xE9e\n                      aux voyageurs de passage au Maroc et qui constitue un moyen de substitution \xE0 la monnaie fiduciaire.\n                      <span class="timeline_card_smalltitle">\n                        Morocco MasterCard Customers Meetings 2015\n                      </span>\n                      Le Groupe Banque Centrale Populaire a remport\xE9 \xE0 cette occasion le troph\xE9e de champion national d\u2019activation des cartes de\n                      paiement TPE \xAB Pos Usage Activation Champion \xBB.'
        }],
        right: [{
          date: '11-03-2018',
          content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Dignissimos, suscipit!',
          media: 'assets/img/res-2.png'
        }, {
          date: '11-03-2018',
          content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Dignissimos, suscipit!',
          media: 'assets/img/explorer-metiers2.png'
        }]
      }
    }, {
      year: 2012,
      actions: {
        left: [{
          date: '11-01-2018',
          content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Dignissimos, suscipit!'
        }, {
          date: '11-02-2018',
          content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Dignissimos, suscipit!'
        }, {
          date: '11-03-2018',
          title: 'DISTINCTIONS<br> &TROPHÉES',
          content: '<span class="timeline_card_smalltitle">\n                        African Banker Awards 2015\n                      </span>\n                      Troph\xE9e \xAB Banque Africaine de l\u2019Ann\xE9e \xBB d\xE9cern\xE9 au Groupe Banque Centrale Populaire Troph\xE9e \xAB Inclusion Financi\xE8re \xBB remport\xE9\n                      par la filiale Attawfiq Micro-Finance. Cartes\n                      <span class="timeline_card_smalltitle">\n                        Afrique Awards 2015\n                      </span>\n                      Obtention du troph\xE9e \xAB Best Innovative Card Programme \xBB attribu\xE9 \xE0 \xAB GlobalCard \xBB, une carte mon\xE9tique pr\xE9pay\xE9e destin\xE9e\n                      aux voyageurs de passage au Maroc et qui constitue un moyen de substitution \xE0 la monnaie fiduciaire.\n                      <span class="timeline_card_smalltitle">\n                        Morocco MasterCard Customers Meetings 2015\n                      </span>\n                      Le Groupe Banque Centrale Populaire a remport\xE9 \xE0 cette occasion le troph\xE9e de champion national d\u2019activation des cartes de\n                      paiement TPE \xAB Pos Usage Activation Champion \xBB.'
        }],
        right: [{
          date: '11-03-2018',
          content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Dignissimos, suscipit!',
          media: 'assets/img/res-2.png'
        }, {
          date: '11-03-2018',
          content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Dignissimos, suscipit!',
          media: 'assets/img/explorer-metiers2.png'
        }]
      }
    }, {
      year: 2011,
      actions: {
        left: [{
          date: '11-01-2018',
          content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Dignissimos, suscipit!'
        }, {
          date: '11-02-2018',
          content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Dignissimos, suscipit!'
        }, {
          date: '11-03-2018',
          title: 'DISTINCTIONS<br> &TROPHÉES',
          content: '<span class="timeline_card_smalltitle">\n                        African Banker Awards 2015\n                      </span>\n                      Troph\xE9e \xAB Banque Africaine de l\u2019Ann\xE9e \xBB d\xE9cern\xE9 au Groupe Banque Centrale Populaire Troph\xE9e \xAB Inclusion Financi\xE8re \xBB remport\xE9\n                      par la filiale Attawfiq Micro-Finance. Cartes\n                      <span class="timeline_card_smalltitle">\n                        Afrique Awards 2015\n                      </span>\n                      Obtention du troph\xE9e \xAB Best Innovative Card Programme \xBB attribu\xE9 \xE0 \xAB GlobalCard \xBB, une carte mon\xE9tique pr\xE9pay\xE9e destin\xE9e\n                      aux voyageurs de passage au Maroc et qui constitue un moyen de substitution \xE0 la monnaie fiduciaire.\n                      <span class="timeline_card_smalltitle">\n                        Morocco MasterCard Customers Meetings 2015\n                      </span>\n                      Le Groupe Banque Centrale Populaire a remport\xE9 \xE0 cette occasion le troph\xE9e de champion national d\u2019activation des cartes de\n                      paiement TPE \xAB Pos Usage Activation Champion \xBB.'
        }],
        right: [{
          date: '11-03-2018',
          content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Dignissimos, suscipit!',
          media: 'assets/img/res-2.png'
        }, {
          date: '11-03-2018',
          content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Dignissimos, suscipit!',
          media: 'assets/img/explorer-metiers2.png'
        }]
      }
    }]
  };

  var dataIndex = 1;

  var mappedData = data.periods.map(function (period) {
    return '<div class="timeline_period">\n              <span class="timeline_period_date">' + period.year + '</span>\n                <div class="row">\n                   <div class="col-md-6 mt-3">\n\n                    ' + period.actions.left.map(function (action) {
      return '<div class="timeline_card timeline_card-left">\n                        <div class="timeline_card_content">\n                            <p class="timeline_card_date">' + action.date + '</p>\n                            ' + (action.title ? '<h2 class="timeline_card_title">' + action.title + '</h2>' : '') + '\n                            <p class="timeline_card_text">' + action.content + '</p>\n                        </div>\n                        ' + (action.media ? '<a class="swipebox swipebox--video" href="' + action.media + '">\n                          <img src="' + action.media + '" alt="">\n                        </a>' : '') + '\n                    </div>';
    }).join('') + '\n                    </div>\n                    <div class="col-md-6 mt-3">\n\n                    ' + period.actions.right.map(function (action) {
      return '<div class="timeline_card timeline_card-right">\n                        <div class="timeline_card_content">\n                            <p class="timeline_card_date">' + action.date + '</p>\n                            ' + (action.title ? '<h2 class="timeline_card_title">' + action.title + '</h2>' : '') + '\n                            <p class="timeline_card_text">' + action.content + '</p>\n                        </div>\n                        ' + (action.media ? '<a class="swipebox swipebox--video" href="' + action.media + '">\n                          <img src="' + action.media + '" alt="">\n                        </a>' : '') + '\n                    </div>';
    }).join('') + '\n                    </div>\n                </div>\n              </div>';
  });

  var updatePosition = tracker(function (position) {
    dataIndex = position;
    render();
    if (dataIndex + 1 > mappedData.length) {
      $('.timeline_actions-plus').css('display', 'none');
    } else {
      $('.timeline_actions-plus').css('display', 'block');
    }
  }); // init the trackbar

  function render() {
    var toRender = '';
    for (var i = 0; i < dataIndex; i++) {
      toRender += mappedData[i];
    }
    var actionsHolder = document.querySelector('.timeline_actions');
    if (actionsHolder) {
      actionsHolder.innerHTML = toRender;
    }
  }

  function increment() {
    dataIndex++;
    if (dataIndex + 1 > mappedData.length) {
      $('.timeline_actions-plus').css('display', 'none');
    }
    updatePosition(dataIndex - 1);
  }

  function scrollToLast() {
    var actions = document.querySelectorAll('.timeline_period');
    actions[actions.length - 1].scrollIntoView({
      behavior: 'smooth'
    });
  }

  render();

  $('.timeline_actions-plus').on('click', function () {
    increment();
    render();
    scrollToLast();
  });
};

function tracker(callback) {
  var elmnt = document.getElementById('timeline-selector');

  if (!elmnt) return null;

  var dots = document.getElementsByClassName('line_dot');

  var SIZE = 1140; // set the width of the tracker

  var step = SIZE / dots.length;
  var BLOCKSIZE = step;

  $('.line_dot').css('width', step + 'px');
  $('#timeline-selector').css('left', step / 2 - 20 + 'px');
  $('.timeline_line .container').append('<div class="timeline_line-progress"><div class="timeline_line-fill"></div></div>');
  $('.timeline_line-progress').css('width', SIZE - BLOCKSIZE + 'px');

  var pos1 = 0,
      pos3 = 0,
      position = 0;
  elmnt.onmousedown = dragMouseDown;

  function dragMouseDown(e) {
    e = e || window.event;
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos3 = e.clientX;
    // set the element's new position:
    var newPosition = elmnt.offsetLeft - pos1;
    if (newPosition >= BLOCKSIZE / 2 - 20 && newPosition < SIZE - BLOCKSIZE / 2 - 20) {
      elmnt.style.left = newPosition + 'px';
    } else {
      document.onmouseup = closeDragElement;
    }
  }

  function setProperPosition() {
    position = Math.round((parseFloat(elmnt.style.left) - 50) / step);
    var newPosition = position * BLOCKSIZE + BLOCKSIZE / 2 - 20;
    elmnt.style.left = newPosition + 'px';
    updateActiveDots();
  }

  function updateActiveDots() {
    for (var i = 0; i < dots.length; i++) {
      dots[i].classList.remove('line_dot--active');
    }
    for (var _i = 0; _i < position; _i++) {
      dots[_i].classList.add('line_dot--active');
    }

    updateProgress();
  }

  function updateProgress() {
    var width = position * BLOCKSIZE;
    $('.timeline_line-fill').css('width', width + 'px');
  }

  function closeDragElement() {
    setProperPosition();
    callback(position + 1);
    /* stop moving when mouse button is released: */
    document.onmouseup = null;
    document.onmousemove = null;
  }

  Array.prototype.forEach.call(dots, function (dot, index) {
    dot.addEventListener('click', function () {
      updatePosition(index);
      callback(position + 1);
    });
  });

  function updatePosition(position) {
    elmnt.style.left = position * BLOCKSIZE + 'px';
    setProperPosition();
  }
  return updatePosition;
}

},{}],38:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function () {
    $('.top-header_list .list, .top-header_list .lang').on('click', function (e) {

        if (!$(e.target).closest('.dropdown').length) {
            e.preventDefault();
        }

        $(this).toggleClass('open');
        $(this).find('.dropdown').toggleClass('d-none');
    });

    $('*').on('click', function (e) {

        if (!$.contains($('.top-header_list')[0], $(e.target)[0]) && ($('.lang').hasClass('open') || $('.list').hasClass('open'))) {

            closeDropdowns();
        }
    });

    function closeDropdowns() {
        if ($('.top-header_list .list').hasClass('open')) {
            $('.top-header_list .list').toggleClass('open');
            $('.top-header_list .list').find('.dropdown').toggleClass('d-none');
        }

        if ($('.top-header_list .lang').hasClass('open')) {
            $('.top-header_list .lang').toggleClass('open');
            $('.top-header_list .lang').find('.dropdown').toggleClass('d-none');
        }
    }
};

},{}]},{},[4])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvbW9tZW50L21vbWVudC5qcyIsIm5vZGVfbW9kdWxlcy9zbW9vdGhzY3JvbGwtcG9seWZpbGwvZGlzdC9zbW9vdGhzY3JvbGwuanMiLCJzcmMvYXNzZXRzL2pzL2RhdGEuanNvbiIsInNyYy9hc3NldHMvanMvbWFpbi5qcyIsInNyYy9jb21wb25lbnRzL2FjdHVhbGl0ZS1zbGlkZXIvaW5kZXguanMiLCJzcmMvY29tcG9uZW50cy9hY3R1YWxpdGVzL2luZGV4LmpzIiwic3JjL2NvbXBvbmVudHMvYXBwZWwtb2ZmcmVzL2luZGV4LmpzIiwic3JjL2NvbXBvbmVudHMvYXJ0aWNsZS1zbGlkZXIvaW5kZXguanMiLCJzcmMvY29tcG9uZW50cy9iZXNvaW4tYWlkZS9pbmRleC5qcyIsInNyYy9jb21wb25lbnRzL2NhcmQvY2FyZC1hY3R1YWxpdGVzLmpzIiwic3JjL2NvbXBvbmVudHMvY2FyZC9jYXJkLWhpc3RvaXJlLmpzIiwic3JjL2NvbXBvbmVudHMvY2FyZC9jYXJkLXJhcHBvcnQvY2FyZC1yYXBwb3J0LmpzIiwic3JjL2NvbXBvbmVudHMvY2FyZC9jYXJkLXNsaWRlci5qcyIsInNyYy9jb21wb25lbnRzL2NvbW11bmlxdWVzL2luZGV4LmpzIiwic3JjL2NvbXBvbmVudHMvZGF0ZS1maWx0ZXIvaW5kZXguanMiLCJzcmMvY29tcG9uZW50cy9kYXRlLXNsaWRlci9kYXRlLXNsaWRlci5qcyIsInNyYy9jb21wb25lbnRzL2ZpbmFuY2UvZmlsdGVyLmpzIiwic3JjL2NvbXBvbmVudHMvZmluYW5jZS9pbmRleC5qcyIsInNyYy9jb21wb25lbnRzL2Zvb3Rlci9pbmRleC5qcyIsInNyYy9jb21wb25lbnRzL2Zvcm0vZm9ybS11cGxvYWQuanMiLCJzcmMvY29tcG9uZW50cy9mb3JtL2Zvcm0tdmFsaWRhdGlvbi5qcyIsInNyYy9jb21wb25lbnRzL2hlYWRlci9pbmRleC5qcyIsInNyYy9jb21wb25lbnRzL2hvbWUtc2xpZGVyL2luZGV4LmpzIiwic3JjL2NvbXBvbmVudHMvbG9nby1zbGlkZXIvaW5kZXguanMiLCJzcmMvY29tcG9uZW50cy9tYXAtY29udHJvbC9pbmRleC5qcyIsInNyYy9jb21wb25lbnRzL21hcC9pbmRleC5qcyIsInNyYy9jb21wb25lbnRzL21lZGlhLWdhbGxlcnkvaW5kZXguanMiLCJzcmMvY29tcG9uZW50cy9tZWRpYWNlbnRlci9pbmRleC5qcyIsInNyYy9jb21wb25lbnRzL25vcy1iYW5xdWVzL2luZGV4LmpzIiwic3JjL2NvbXBvbmVudHMvcG9wdXAtc2VhcmNoL2ZpbHRlci5qcyIsInNyYy9jb21wb25lbnRzL3BvcHVwLXNlYXJjaC9pbmRleC5qcyIsInNyYy9jb21wb25lbnRzL3BvcHVwLXZpZGVvL2luZGV4LmpzIiwic3JjL2NvbXBvbmVudHMvcHViLXNsaWRlci9pbmRleC5qcyIsInNyYy9jb21wb25lbnRzL3Jlc3VsdC9pbmRleC5qcyIsInNyYy9jb21wb25lbnRzL3NlbGVjdC1maWx0ZXIvaW5kZXguanMiLCJzcmMvY29tcG9uZW50cy9zd2lwZWJveC9pbmRleC5qcyIsInNyYy9jb21wb25lbnRzL3RpbWVsaW5lL2luZGV4LmpzIiwic3JjL2NvbXBvbmVudHMvdG9wLWhlYWRlci9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzE1SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2YkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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LENBQUosRUFFbUM7O0FBRS9CO0FBQ0g7QUFDSixLQVJEOztBQVVBLGFBQVMsY0FBVCxHQUEwQjtBQUN0QixZQUFJLEVBQUUsd0JBQUYsRUFBNEIsUUFBNUIsQ0FBcUMsTUFBckMsQ0FBSixFQUFrRDtBQUM5QyxjQUFFLHdCQUFGLEVBQTRCLFdBQTVCLENBQXdDLE1BQXhDO0FBQ0EsY0FBRSx3QkFBRixFQUE0QixJQUE1QixDQUFpQyxXQUFqQyxFQUE4QyxXQUE5QyxDQUEwRCxRQUExRDtBQUNIOztBQUVELFlBQUksRUFBRSx3QkFBRixFQUE0QixRQUE1QixDQUFxQyxNQUFyQyxDQUFKLEVBQWtEO0FBQzlDLGNBQUUsd0JBQUYsRUFBNEIsV0FBNUIsQ0FBd0MsTUFBeEM7QUFDQSxjQUFFLHdCQUFGLEVBQTRCLElBQTVCLENBQWlDLFdBQWpDLEVBQThDLFdBQTlDLENBQTBELFFBQTFEO0FBQ0g7QUFDSjtBQUNKLEMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIvLyEgbW9tZW50LmpzXG5cbjsoZnVuY3Rpb24gKGdsb2JhbCwgZmFjdG9yeSkge1xuICAgIHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyA/IG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpIDpcbiAgICB0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgPyBkZWZpbmUoZmFjdG9yeSkgOlxuICAgIGdsb2JhbC5tb21lbnQgPSBmYWN0b3J5KClcbn0odGhpcywgKGZ1bmN0aW9uICgpIHsgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyIGhvb2tDYWxsYmFjaztcblxuICAgIGZ1bmN0aW9uIGhvb2tzICgpIHtcbiAgICAgICAgcmV0dXJuIGhvb2tDYWxsYmFjay5hcHBseShudWxsLCBhcmd1bWVudHMpO1xuICAgIH1cblxuICAgIC8vIFRoaXMgaXMgZG9uZSB0byByZWdpc3RlciB0aGUgbWV0aG9kIGNhbGxlZCB3aXRoIG1vbWVudCgpXG4gICAgLy8gd2l0aG91dCBjcmVhdGluZyBjaXJjdWxhciBkZXBlbmRlbmNpZXMuXG4gICAgZnVuY3Rpb24gc2V0SG9va0NhbGxiYWNrIChjYWxsYmFjaykge1xuICAgICAgICBob29rQ2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpc0FycmF5KGlucHV0KSB7XG4gICAgICAgIHJldHVybiBpbnB1dCBpbnN0YW5jZW9mIEFycmF5IHx8IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChpbnB1dCkgPT09ICdbb2JqZWN0IEFycmF5XSc7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaXNPYmplY3QoaW5wdXQpIHtcbiAgICAgICAgLy8gSUU4IHdpbGwgdHJlYXQgdW5kZWZpbmVkIGFuZCBudWxsIGFzIG9iamVjdCBpZiBpdCB3YXNuJ3QgZm9yXG4gICAgICAgIC8vIGlucHV0ICE9IG51bGxcbiAgICAgICAgcmV0dXJuIGlucHV0ICE9IG51bGwgJiYgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGlucHV0KSA9PT0gJ1tvYmplY3QgT2JqZWN0XSc7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaXNPYmplY3RFbXB0eShvYmopIHtcbiAgICAgICAgaWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKSB7XG4gICAgICAgICAgICByZXR1cm4gKE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKG9iaikubGVuZ3RoID09PSAwKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhciBrO1xuICAgICAgICAgICAgZm9yIChrIGluIG9iaikge1xuICAgICAgICAgICAgICAgIGlmIChvYmouaGFzT3duUHJvcGVydHkoaykpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaXNVbmRlZmluZWQoaW5wdXQpIHtcbiAgICAgICAgcmV0dXJuIGlucHV0ID09PSB2b2lkIDA7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaXNOdW1iZXIoaW5wdXQpIHtcbiAgICAgICAgcmV0dXJuIHR5cGVvZiBpbnB1dCA9PT0gJ251bWJlcicgfHwgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGlucHV0KSA9PT0gJ1tvYmplY3QgTnVtYmVyXSc7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaXNEYXRlKGlucHV0KSB7XG4gICAgICAgIHJldHVybiBpbnB1dCBpbnN0YW5jZW9mIERhdGUgfHwgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGlucHV0KSA9PT0gJ1tvYmplY3QgRGF0ZV0nO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG1hcChhcnIsIGZuKSB7XG4gICAgICAgIHZhciByZXMgPSBbXSwgaTtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGFyci5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgcmVzLnB1c2goZm4oYXJyW2ldLCBpKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlcztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBoYXNPd25Qcm9wKGEsIGIpIHtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChhLCBiKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBleHRlbmQoYSwgYikge1xuICAgICAgICBmb3IgKHZhciBpIGluIGIpIHtcbiAgICAgICAgICAgIGlmIChoYXNPd25Qcm9wKGIsIGkpKSB7XG4gICAgICAgICAgICAgICAgYVtpXSA9IGJbaV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaGFzT3duUHJvcChiLCAndG9TdHJpbmcnKSkge1xuICAgICAgICAgICAgYS50b1N0cmluZyA9IGIudG9TdHJpbmc7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaGFzT3duUHJvcChiLCAndmFsdWVPZicpKSB7XG4gICAgICAgICAgICBhLnZhbHVlT2YgPSBiLnZhbHVlT2Y7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjcmVhdGVVVEMgKGlucHV0LCBmb3JtYXQsIGxvY2FsZSwgc3RyaWN0KSB7XG4gICAgICAgIHJldHVybiBjcmVhdGVMb2NhbE9yVVRDKGlucHV0LCBmb3JtYXQsIGxvY2FsZSwgc3RyaWN0LCB0cnVlKS51dGMoKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBkZWZhdWx0UGFyc2luZ0ZsYWdzKCkge1xuICAgICAgICAvLyBXZSBuZWVkIHRvIGRlZXAgY2xvbmUgdGhpcyBvYmplY3QuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBlbXB0eSAgICAgICAgICAgOiBmYWxzZSxcbiAgICAgICAgICAgIHVudXNlZFRva2VucyAgICA6IFtdLFxuICAgICAgICAgICAgdW51c2VkSW5wdXQgICAgIDogW10sXG4gICAgICAgICAgICBvdmVyZmxvdyAgICAgICAgOiAtMixcbiAgICAgICAgICAgIGNoYXJzTGVmdE92ZXIgICA6IDAsXG4gICAgICAgICAgICBudWxsSW5wdXQgICAgICAgOiBmYWxzZSxcbiAgICAgICAgICAgIGludmFsaWRNb250aCAgICA6IG51bGwsXG4gICAgICAgICAgICBpbnZhbGlkRm9ybWF0ICAgOiBmYWxzZSxcbiAgICAgICAgICAgIHVzZXJJbnZhbGlkYXRlZCA6IGZhbHNlLFxuICAgICAgICAgICAgaXNvICAgICAgICAgICAgIDogZmFsc2UsXG4gICAgICAgICAgICBwYXJzZWREYXRlUGFydHMgOiBbXSxcbiAgICAgICAgICAgIG1lcmlkaWVtICAgICAgICA6IG51bGwsXG4gICAgICAgICAgICByZmMyODIyICAgICAgICAgOiBmYWxzZSxcbiAgICAgICAgICAgIHdlZWtkYXlNaXNtYXRjaCA6IGZhbHNlXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0UGFyc2luZ0ZsYWdzKG0pIHtcbiAgICAgICAgaWYgKG0uX3BmID09IG51bGwpIHtcbiAgICAgICAgICAgIG0uX3BmID0gZGVmYXVsdFBhcnNpbmdGbGFncygpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtLl9wZjtcbiAgICB9XG5cbiAgICB2YXIgc29tZTtcbiAgICBpZiAoQXJyYXkucHJvdG90eXBlLnNvbWUpIHtcbiAgICAgICAgc29tZSA9IEFycmF5LnByb3RvdHlwZS5zb21lO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHNvbWUgPSBmdW5jdGlvbiAoZnVuKSB7XG4gICAgICAgICAgICB2YXIgdCA9IE9iamVjdCh0aGlzKTtcbiAgICAgICAgICAgIHZhciBsZW4gPSB0Lmxlbmd0aCA+Pj4gMDtcblxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgICAgIGlmIChpIGluIHQgJiYgZnVuLmNhbGwodGhpcywgdFtpXSwgaSwgdCkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaXNWYWxpZChtKSB7XG4gICAgICAgIGlmIChtLl9pc1ZhbGlkID09IG51bGwpIHtcbiAgICAgICAgICAgIHZhciBmbGFncyA9IGdldFBhcnNpbmdGbGFncyhtKTtcbiAgICAgICAgICAgIHZhciBwYXJzZWRQYXJ0cyA9IHNvbWUuY2FsbChmbGFncy5wYXJzZWREYXRlUGFydHMsIGZ1bmN0aW9uIChpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGkgIT0gbnVsbDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdmFyIGlzTm93VmFsaWQgPSAhaXNOYU4obS5fZC5nZXRUaW1lKCkpICYmXG4gICAgICAgICAgICAgICAgZmxhZ3Mub3ZlcmZsb3cgPCAwICYmXG4gICAgICAgICAgICAgICAgIWZsYWdzLmVtcHR5ICYmXG4gICAgICAgICAgICAgICAgIWZsYWdzLmludmFsaWRNb250aCAmJlxuICAgICAgICAgICAgICAgICFmbGFncy5pbnZhbGlkV2Vla2RheSAmJlxuICAgICAgICAgICAgICAgICFmbGFncy53ZWVrZGF5TWlzbWF0Y2ggJiZcbiAgICAgICAgICAgICAgICAhZmxhZ3MubnVsbElucHV0ICYmXG4gICAgICAgICAgICAgICAgIWZsYWdzLmludmFsaWRGb3JtYXQgJiZcbiAgICAgICAgICAgICAgICAhZmxhZ3MudXNlckludmFsaWRhdGVkICYmXG4gICAgICAgICAgICAgICAgKCFmbGFncy5tZXJpZGllbSB8fCAoZmxhZ3MubWVyaWRpZW0gJiYgcGFyc2VkUGFydHMpKTtcblxuICAgICAgICAgICAgaWYgKG0uX3N0cmljdCkge1xuICAgICAgICAgICAgICAgIGlzTm93VmFsaWQgPSBpc05vd1ZhbGlkICYmXG4gICAgICAgICAgICAgICAgICAgIGZsYWdzLmNoYXJzTGVmdE92ZXIgPT09IDAgJiZcbiAgICAgICAgICAgICAgICAgICAgZmxhZ3MudW51c2VkVG9rZW5zLmxlbmd0aCA9PT0gMCAmJlxuICAgICAgICAgICAgICAgICAgICBmbGFncy5iaWdIb3VyID09PSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChPYmplY3QuaXNGcm96ZW4gPT0gbnVsbCB8fCAhT2JqZWN0LmlzRnJvemVuKG0pKSB7XG4gICAgICAgICAgICAgICAgbS5faXNWYWxpZCA9IGlzTm93VmFsaWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaXNOb3dWYWxpZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbS5faXNWYWxpZDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjcmVhdGVJbnZhbGlkIChmbGFncykge1xuICAgICAgICB2YXIgbSA9IGNyZWF0ZVVUQyhOYU4pO1xuICAgICAgICBpZiAoZmxhZ3MgIT0gbnVsbCkge1xuICAgICAgICAgICAgZXh0ZW5kKGdldFBhcnNpbmdGbGFncyhtKSwgZmxhZ3MpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgZ2V0UGFyc2luZ0ZsYWdzKG0pLnVzZXJJbnZhbGlkYXRlZCA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbTtcbiAgICB9XG5cbiAgICAvLyBQbHVnaW5zIHRoYXQgYWRkIHByb3BlcnRpZXMgc2hvdWxkIGFsc28gYWRkIHRoZSBrZXkgaGVyZSAobnVsbCB2YWx1ZSksXG4gICAgLy8gc28gd2UgY2FuIHByb3Blcmx5IGNsb25lIG91cnNlbHZlcy5cbiAgICB2YXIgbW9tZW50UHJvcGVydGllcyA9IGhvb2tzLm1vbWVudFByb3BlcnRpZXMgPSBbXTtcblxuICAgIGZ1bmN0aW9uIGNvcHlDb25maWcodG8sIGZyb20pIHtcbiAgICAgICAgdmFyIGksIHByb3AsIHZhbDtcblxuICAgICAgICBpZiAoIWlzVW5kZWZpbmVkKGZyb20uX2lzQU1vbWVudE9iamVjdCkpIHtcbiAgICAgICAgICAgIHRvLl9pc0FNb21lbnRPYmplY3QgPSBmcm9tLl9pc0FNb21lbnRPYmplY3Q7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFpc1VuZGVmaW5lZChmcm9tLl9pKSkge1xuICAgICAgICAgICAgdG8uX2kgPSBmcm9tLl9pO1xuICAgICAgICB9XG4gICAgICAgIGlmICghaXNVbmRlZmluZWQoZnJvbS5fZikpIHtcbiAgICAgICAgICAgIHRvLl9mID0gZnJvbS5fZjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWlzVW5kZWZpbmVkKGZyb20uX2wpKSB7XG4gICAgICAgICAgICB0by5fbCA9IGZyb20uX2w7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFpc1VuZGVmaW5lZChmcm9tLl9zdHJpY3QpKSB7XG4gICAgICAgICAgICB0by5fc3RyaWN0ID0gZnJvbS5fc3RyaWN0O1xuICAgICAgICB9XG4gICAgICAgIGlmICghaXNVbmRlZmluZWQoZnJvbS5fdHptKSkge1xuICAgICAgICAgICAgdG8uX3R6bSA9IGZyb20uX3R6bTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWlzVW5kZWZpbmVkKGZyb20uX2lzVVRDKSkge1xuICAgICAgICAgICAgdG8uX2lzVVRDID0gZnJvbS5faXNVVEM7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFpc1VuZGVmaW5lZChmcm9tLl9vZmZzZXQpKSB7XG4gICAgICAgICAgICB0by5fb2Zmc2V0ID0gZnJvbS5fb2Zmc2V0O1xuICAgICAgICB9XG4gICAgICAgIGlmICghaXNVbmRlZmluZWQoZnJvbS5fcGYpKSB7XG4gICAgICAgICAgICB0by5fcGYgPSBnZXRQYXJzaW5nRmxhZ3MoZnJvbSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFpc1VuZGVmaW5lZChmcm9tLl9sb2NhbGUpKSB7XG4gICAgICAgICAgICB0by5fbG9jYWxlID0gZnJvbS5fbG9jYWxlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG1vbWVudFByb3BlcnRpZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IG1vbWVudFByb3BlcnRpZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBwcm9wID0gbW9tZW50UHJvcGVydGllc1tpXTtcbiAgICAgICAgICAgICAgICB2YWwgPSBmcm9tW3Byb3BdO1xuICAgICAgICAgICAgICAgIGlmICghaXNVbmRlZmluZWQodmFsKSkge1xuICAgICAgICAgICAgICAgICAgICB0b1twcm9wXSA9IHZhbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdG87XG4gICAgfVxuXG4gICAgdmFyIHVwZGF0ZUluUHJvZ3Jlc3MgPSBmYWxzZTtcblxuICAgIC8vIE1vbWVudCBwcm90b3R5cGUgb2JqZWN0XG4gICAgZnVuY3Rpb24gTW9tZW50KGNvbmZpZykge1xuICAgICAgICBjb3B5Q29uZmlnKHRoaXMsIGNvbmZpZyk7XG4gICAgICAgIHRoaXMuX2QgPSBuZXcgRGF0ZShjb25maWcuX2QgIT0gbnVsbCA/IGNvbmZpZy5fZC5nZXRUaW1lKCkgOiBOYU4pO1xuICAgICAgICBpZiAoIXRoaXMuaXNWYWxpZCgpKSB7XG4gICAgICAgICAgICB0aGlzLl9kID0gbmV3IERhdGUoTmFOKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBQcmV2ZW50IGluZmluaXRlIGxvb3AgaW4gY2FzZSB1cGRhdGVPZmZzZXQgY3JlYXRlcyBuZXcgbW9tZW50XG4gICAgICAgIC8vIG9iamVjdHMuXG4gICAgICAgIGlmICh1cGRhdGVJblByb2dyZXNzID09PSBmYWxzZSkge1xuICAgICAgICAgICAgdXBkYXRlSW5Qcm9ncmVzcyA9IHRydWU7XG4gICAgICAgICAgICBob29rcy51cGRhdGVPZmZzZXQodGhpcyk7XG4gICAgICAgICAgICB1cGRhdGVJblByb2dyZXNzID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpc01vbWVudCAob2JqKSB7XG4gICAgICAgIHJldHVybiBvYmogaW5zdGFuY2VvZiBNb21lbnQgfHwgKG9iaiAhPSBudWxsICYmIG9iai5faXNBTW9tZW50T2JqZWN0ICE9IG51bGwpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGFic0Zsb29yIChudW1iZXIpIHtcbiAgICAgICAgaWYgKG51bWJlciA8IDApIHtcbiAgICAgICAgICAgIC8vIC0wIC0+IDBcbiAgICAgICAgICAgIHJldHVybiBNYXRoLmNlaWwobnVtYmVyKSB8fCAwO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IobnVtYmVyKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHRvSW50KGFyZ3VtZW50Rm9yQ29lcmNpb24pIHtcbiAgICAgICAgdmFyIGNvZXJjZWROdW1iZXIgPSArYXJndW1lbnRGb3JDb2VyY2lvbixcbiAgICAgICAgICAgIHZhbHVlID0gMDtcblxuICAgICAgICBpZiAoY29lcmNlZE51bWJlciAhPT0gMCAmJiBpc0Zpbml0ZShjb2VyY2VkTnVtYmVyKSkge1xuICAgICAgICAgICAgdmFsdWUgPSBhYnNGbG9vcihjb2VyY2VkTnVtYmVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG5cbiAgICAvLyBjb21wYXJlIHR3byBhcnJheXMsIHJldHVybiB0aGUgbnVtYmVyIG9mIGRpZmZlcmVuY2VzXG4gICAgZnVuY3Rpb24gY29tcGFyZUFycmF5cyhhcnJheTEsIGFycmF5MiwgZG9udENvbnZlcnQpIHtcbiAgICAgICAgdmFyIGxlbiA9IE1hdGgubWluKGFycmF5MS5sZW5ndGgsIGFycmF5Mi5sZW5ndGgpLFxuICAgICAgICAgICAgbGVuZ3RoRGlmZiA9IE1hdGguYWJzKGFycmF5MS5sZW5ndGggLSBhcnJheTIubGVuZ3RoKSxcbiAgICAgICAgICAgIGRpZmZzID0gMCxcbiAgICAgICAgICAgIGk7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgaWYgKChkb250Q29udmVydCAmJiBhcnJheTFbaV0gIT09IGFycmF5MltpXSkgfHxcbiAgICAgICAgICAgICAgICAoIWRvbnRDb252ZXJ0ICYmIHRvSW50KGFycmF5MVtpXSkgIT09IHRvSW50KGFycmF5MltpXSkpKSB7XG4gICAgICAgICAgICAgICAgZGlmZnMrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZGlmZnMgKyBsZW5ndGhEaWZmO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHdhcm4obXNnKSB7XG4gICAgICAgIGlmIChob29rcy5zdXBwcmVzc0RlcHJlY2F0aW9uV2FybmluZ3MgPT09IGZhbHNlICYmXG4gICAgICAgICAgICAgICAgKHR5cGVvZiBjb25zb2xlICE9PSAgJ3VuZGVmaW5lZCcpICYmIGNvbnNvbGUud2Fybikge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdEZXByZWNhdGlvbiB3YXJuaW5nOiAnICsgbXNnKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGRlcHJlY2F0ZShtc2csIGZuKSB7XG4gICAgICAgIHZhciBmaXJzdFRpbWUgPSB0cnVlO1xuXG4gICAgICAgIHJldHVybiBleHRlbmQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKGhvb2tzLmRlcHJlY2F0aW9uSGFuZGxlciAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgaG9va3MuZGVwcmVjYXRpb25IYW5kbGVyKG51bGwsIG1zZyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZmlyc3RUaW1lKSB7XG4gICAgICAgICAgICAgICAgdmFyIGFyZ3MgPSBbXTtcbiAgICAgICAgICAgICAgICB2YXIgYXJnO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGFyZyA9ICcnO1xuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGFyZ3VtZW50c1tpXSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFyZyArPSAnXFxuWycgKyBpICsgJ10gJztcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGtleSBpbiBhcmd1bWVudHNbMF0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcmcgKz0ga2V5ICsgJzogJyArIGFyZ3VtZW50c1swXVtrZXldICsgJywgJztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGFyZyA9IGFyZy5zbGljZSgwLCAtMik7IC8vIFJlbW92ZSB0cmFpbGluZyBjb21tYSBhbmQgc3BhY2VcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFyZyA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBhcmdzLnB1c2goYXJnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgd2Fybihtc2cgKyAnXFxuQXJndW1lbnRzOiAnICsgQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJncykuam9pbignJykgKyAnXFxuJyArIChuZXcgRXJyb3IoKSkuc3RhY2spO1xuICAgICAgICAgICAgICAgIGZpcnN0VGltZSA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIH0sIGZuKTtcbiAgICB9XG5cbiAgICB2YXIgZGVwcmVjYXRpb25zID0ge307XG5cbiAgICBmdW5jdGlvbiBkZXByZWNhdGVTaW1wbGUobmFtZSwgbXNnKSB7XG4gICAgICAgIGlmIChob29rcy5kZXByZWNhdGlvbkhhbmRsZXIgIT0gbnVsbCkge1xuICAgICAgICAgICAgaG9va3MuZGVwcmVjYXRpb25IYW5kbGVyKG5hbWUsIG1zZyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFkZXByZWNhdGlvbnNbbmFtZV0pIHtcbiAgICAgICAgICAgIHdhcm4obXNnKTtcbiAgICAgICAgICAgIGRlcHJlY2F0aW9uc1tuYW1lXSA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBob29rcy5zdXBwcmVzc0RlcHJlY2F0aW9uV2FybmluZ3MgPSBmYWxzZTtcbiAgICBob29rcy5kZXByZWNhdGlvbkhhbmRsZXIgPSBudWxsO1xuXG4gICAgZnVuY3Rpb24gaXNGdW5jdGlvbihpbnB1dCkge1xuICAgICAgICByZXR1cm4gaW5wdXQgaW5zdGFuY2VvZiBGdW5jdGlvbiB8fCBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoaW5wdXQpID09PSAnW29iamVjdCBGdW5jdGlvbl0nO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNldCAoY29uZmlnKSB7XG4gICAgICAgIHZhciBwcm9wLCBpO1xuICAgICAgICBmb3IgKGkgaW4gY29uZmlnKSB7XG4gICAgICAgICAgICBwcm9wID0gY29uZmlnW2ldO1xuICAgICAgICAgICAgaWYgKGlzRnVuY3Rpb24ocHJvcCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzW2ldID0gcHJvcDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpc1snXycgKyBpXSA9IHByb3A7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fY29uZmlnID0gY29uZmlnO1xuICAgICAgICAvLyBMZW5pZW50IG9yZGluYWwgcGFyc2luZyBhY2NlcHRzIGp1c3QgYSBudW1iZXIgaW4gYWRkaXRpb24gdG9cbiAgICAgICAgLy8gbnVtYmVyICsgKHBvc3NpYmx5KSBzdHVmZiBjb21pbmcgZnJvbSBfZGF5T2ZNb250aE9yZGluYWxQYXJzZS5cbiAgICAgICAgLy8gVE9ETzogUmVtb3ZlIFwib3JkaW5hbFBhcnNlXCIgZmFsbGJhY2sgaW4gbmV4dCBtYWpvciByZWxlYXNlLlxuICAgICAgICB0aGlzLl9kYXlPZk1vbnRoT3JkaW5hbFBhcnNlTGVuaWVudCA9IG5ldyBSZWdFeHAoXG4gICAgICAgICAgICAodGhpcy5fZGF5T2ZNb250aE9yZGluYWxQYXJzZS5zb3VyY2UgfHwgdGhpcy5fb3JkaW5hbFBhcnNlLnNvdXJjZSkgK1xuICAgICAgICAgICAgICAgICd8JyArICgvXFxkezEsMn0vKS5zb3VyY2UpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG1lcmdlQ29uZmlncyhwYXJlbnRDb25maWcsIGNoaWxkQ29uZmlnKSB7XG4gICAgICAgIHZhciByZXMgPSBleHRlbmQoe30sIHBhcmVudENvbmZpZyksIHByb3A7XG4gICAgICAgIGZvciAocHJvcCBpbiBjaGlsZENvbmZpZykge1xuICAgICAgICAgICAgaWYgKGhhc093blByb3AoY2hpbGRDb25maWcsIHByb3ApKSB7XG4gICAgICAgICAgICAgICAgaWYgKGlzT2JqZWN0KHBhcmVudENvbmZpZ1twcm9wXSkgJiYgaXNPYmplY3QoY2hpbGRDb25maWdbcHJvcF0pKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc1twcm9wXSA9IHt9O1xuICAgICAgICAgICAgICAgICAgICBleHRlbmQocmVzW3Byb3BdLCBwYXJlbnRDb25maWdbcHJvcF0pO1xuICAgICAgICAgICAgICAgICAgICBleHRlbmQocmVzW3Byb3BdLCBjaGlsZENvbmZpZ1twcm9wXSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjaGlsZENvbmZpZ1twcm9wXSAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc1twcm9wXSA9IGNoaWxkQ29uZmlnW3Byb3BdO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSByZXNbcHJvcF07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGZvciAocHJvcCBpbiBwYXJlbnRDb25maWcpIHtcbiAgICAgICAgICAgIGlmIChoYXNPd25Qcm9wKHBhcmVudENvbmZpZywgcHJvcCkgJiZcbiAgICAgICAgICAgICAgICAgICAgIWhhc093blByb3AoY2hpbGRDb25maWcsIHByb3ApICYmXG4gICAgICAgICAgICAgICAgICAgIGlzT2JqZWN0KHBhcmVudENvbmZpZ1twcm9wXSkpIHtcbiAgICAgICAgICAgICAgICAvLyBtYWtlIHN1cmUgY2hhbmdlcyB0byBwcm9wZXJ0aWVzIGRvbid0IG1vZGlmeSBwYXJlbnQgY29uZmlnXG4gICAgICAgICAgICAgICAgcmVzW3Byb3BdID0gZXh0ZW5kKHt9LCByZXNbcHJvcF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXM7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gTG9jYWxlKGNvbmZpZykge1xuICAgICAgICBpZiAoY29uZmlnICE9IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0KGNvbmZpZyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIga2V5cztcblxuICAgIGlmIChPYmplY3Qua2V5cykge1xuICAgICAgICBrZXlzID0gT2JqZWN0LmtleXM7XG4gICAgfSBlbHNlIHtcbiAgICAgICAga2V5cyA9IGZ1bmN0aW9uIChvYmopIHtcbiAgICAgICAgICAgIHZhciBpLCByZXMgPSBbXTtcbiAgICAgICAgICAgIGZvciAoaSBpbiBvYmopIHtcbiAgICAgICAgICAgICAgICBpZiAoaGFzT3duUHJvcChvYmosIGkpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlcy5wdXNoKGkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXM7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgdmFyIGRlZmF1bHRDYWxlbmRhciA9IHtcbiAgICAgICAgc2FtZURheSA6ICdbVG9kYXkgYXRdIExUJyxcbiAgICAgICAgbmV4dERheSA6ICdbVG9tb3Jyb3cgYXRdIExUJyxcbiAgICAgICAgbmV4dFdlZWsgOiAnZGRkZCBbYXRdIExUJyxcbiAgICAgICAgbGFzdERheSA6ICdbWWVzdGVyZGF5IGF0XSBMVCcsXG4gICAgICAgIGxhc3RXZWVrIDogJ1tMYXN0XSBkZGRkIFthdF0gTFQnLFxuICAgICAgICBzYW1lRWxzZSA6ICdMJ1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBjYWxlbmRhciAoa2V5LCBtb20sIG5vdykge1xuICAgICAgICB2YXIgb3V0cHV0ID0gdGhpcy5fY2FsZW5kYXJba2V5XSB8fCB0aGlzLl9jYWxlbmRhclsnc2FtZUVsc2UnXTtcbiAgICAgICAgcmV0dXJuIGlzRnVuY3Rpb24ob3V0cHV0KSA/IG91dHB1dC5jYWxsKG1vbSwgbm93KSA6IG91dHB1dDtcbiAgICB9XG5cbiAgICB2YXIgZGVmYXVsdExvbmdEYXRlRm9ybWF0ID0ge1xuICAgICAgICBMVFMgIDogJ2g6bW06c3MgQScsXG4gICAgICAgIExUICAgOiAnaDptbSBBJyxcbiAgICAgICAgTCAgICA6ICdNTS9ERC9ZWVlZJyxcbiAgICAgICAgTEwgICA6ICdNTU1NIEQsIFlZWVknLFxuICAgICAgICBMTEwgIDogJ01NTU0gRCwgWVlZWSBoOm1tIEEnLFxuICAgICAgICBMTExMIDogJ2RkZGQsIE1NTU0gRCwgWVlZWSBoOm1tIEEnXG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIGxvbmdEYXRlRm9ybWF0IChrZXkpIHtcbiAgICAgICAgdmFyIGZvcm1hdCA9IHRoaXMuX2xvbmdEYXRlRm9ybWF0W2tleV0sXG4gICAgICAgICAgICBmb3JtYXRVcHBlciA9IHRoaXMuX2xvbmdEYXRlRm9ybWF0W2tleS50b1VwcGVyQ2FzZSgpXTtcblxuICAgICAgICBpZiAoZm9ybWF0IHx8ICFmb3JtYXRVcHBlcikge1xuICAgICAgICAgICAgcmV0dXJuIGZvcm1hdDtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2xvbmdEYXRlRm9ybWF0W2tleV0gPSBmb3JtYXRVcHBlci5yZXBsYWNlKC9NTU1NfE1NfEREfGRkZGQvZywgZnVuY3Rpb24gKHZhbCkge1xuICAgICAgICAgICAgcmV0dXJuIHZhbC5zbGljZSgxKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX2xvbmdEYXRlRm9ybWF0W2tleV07XG4gICAgfVxuXG4gICAgdmFyIGRlZmF1bHRJbnZhbGlkRGF0ZSA9ICdJbnZhbGlkIGRhdGUnO1xuXG4gICAgZnVuY3Rpb24gaW52YWxpZERhdGUgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5faW52YWxpZERhdGU7XG4gICAgfVxuXG4gICAgdmFyIGRlZmF1bHRPcmRpbmFsID0gJyVkJztcbiAgICB2YXIgZGVmYXVsdERheU9mTW9udGhPcmRpbmFsUGFyc2UgPSAvXFxkezEsMn0vO1xuXG4gICAgZnVuY3Rpb24gb3JkaW5hbCAobnVtYmVyKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9vcmRpbmFsLnJlcGxhY2UoJyVkJywgbnVtYmVyKTtcbiAgICB9XG5cbiAgICB2YXIgZGVmYXVsdFJlbGF0aXZlVGltZSA9IHtcbiAgICAgICAgZnV0dXJlIDogJ2luICVzJyxcbiAgICAgICAgcGFzdCAgIDogJyVzIGFnbycsXG4gICAgICAgIHMgIDogJ2EgZmV3IHNlY29uZHMnLFxuICAgICAgICBzcyA6ICclZCBzZWNvbmRzJyxcbiAgICAgICAgbSAgOiAnYSBtaW51dGUnLFxuICAgICAgICBtbSA6ICclZCBtaW51dGVzJyxcbiAgICAgICAgaCAgOiAnYW4gaG91cicsXG4gICAgICAgIGhoIDogJyVkIGhvdXJzJyxcbiAgICAgICAgZCAgOiAnYSBkYXknLFxuICAgICAgICBkZCA6ICclZCBkYXlzJyxcbiAgICAgICAgTSAgOiAnYSBtb250aCcsXG4gICAgICAgIE1NIDogJyVkIG1vbnRocycsXG4gICAgICAgIHkgIDogJ2EgeWVhcicsXG4gICAgICAgIHl5IDogJyVkIHllYXJzJ1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiByZWxhdGl2ZVRpbWUgKG51bWJlciwgd2l0aG91dFN1ZmZpeCwgc3RyaW5nLCBpc0Z1dHVyZSkge1xuICAgICAgICB2YXIgb3V0cHV0ID0gdGhpcy5fcmVsYXRpdmVUaW1lW3N0cmluZ107XG4gICAgICAgIHJldHVybiAoaXNGdW5jdGlvbihvdXRwdXQpKSA/XG4gICAgICAgICAgICBvdXRwdXQobnVtYmVyLCB3aXRob3V0U3VmZml4LCBzdHJpbmcsIGlzRnV0dXJlKSA6XG4gICAgICAgICAgICBvdXRwdXQucmVwbGFjZSgvJWQvaSwgbnVtYmVyKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwYXN0RnV0dXJlIChkaWZmLCBvdXRwdXQpIHtcbiAgICAgICAgdmFyIGZvcm1hdCA9IHRoaXMuX3JlbGF0aXZlVGltZVtkaWZmID4gMCA/ICdmdXR1cmUnIDogJ3Bhc3QnXTtcbiAgICAgICAgcmV0dXJuIGlzRnVuY3Rpb24oZm9ybWF0KSA/IGZvcm1hdChvdXRwdXQpIDogZm9ybWF0LnJlcGxhY2UoLyVzL2ksIG91dHB1dCk7XG4gICAgfVxuXG4gICAgdmFyIGFsaWFzZXMgPSB7fTtcblxuICAgIGZ1bmN0aW9uIGFkZFVuaXRBbGlhcyAodW5pdCwgc2hvcnRoYW5kKSB7XG4gICAgICAgIHZhciBsb3dlckNhc2UgPSB1bml0LnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIGFsaWFzZXNbbG93ZXJDYXNlXSA9IGFsaWFzZXNbbG93ZXJDYXNlICsgJ3MnXSA9IGFsaWFzZXNbc2hvcnRoYW5kXSA9IHVuaXQ7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbm9ybWFsaXplVW5pdHModW5pdHMpIHtcbiAgICAgICAgcmV0dXJuIHR5cGVvZiB1bml0cyA9PT0gJ3N0cmluZycgPyBhbGlhc2VzW3VuaXRzXSB8fCBhbGlhc2VzW3VuaXRzLnRvTG93ZXJDYXNlKCldIDogdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG5vcm1hbGl6ZU9iamVjdFVuaXRzKGlucHV0T2JqZWN0KSB7XG4gICAgICAgIHZhciBub3JtYWxpemVkSW5wdXQgPSB7fSxcbiAgICAgICAgICAgIG5vcm1hbGl6ZWRQcm9wLFxuICAgICAgICAgICAgcHJvcDtcblxuICAgICAgICBmb3IgKHByb3AgaW4gaW5wdXRPYmplY3QpIHtcbiAgICAgICAgICAgIGlmIChoYXNPd25Qcm9wKGlucHV0T2JqZWN0LCBwcm9wKSkge1xuICAgICAgICAgICAgICAgIG5vcm1hbGl6ZWRQcm9wID0gbm9ybWFsaXplVW5pdHMocHJvcCk7XG4gICAgICAgICAgICAgICAgaWYgKG5vcm1hbGl6ZWRQcm9wKSB7XG4gICAgICAgICAgICAgICAgICAgIG5vcm1hbGl6ZWRJbnB1dFtub3JtYWxpemVkUHJvcF0gPSBpbnB1dE9iamVjdFtwcm9wXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbm9ybWFsaXplZElucHV0O1xuICAgIH1cblxuICAgIHZhciBwcmlvcml0aWVzID0ge307XG5cbiAgICBmdW5jdGlvbiBhZGRVbml0UHJpb3JpdHkodW5pdCwgcHJpb3JpdHkpIHtcbiAgICAgICAgcHJpb3JpdGllc1t1bml0XSA9IHByaW9yaXR5O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldFByaW9yaXRpemVkVW5pdHModW5pdHNPYmopIHtcbiAgICAgICAgdmFyIHVuaXRzID0gW107XG4gICAgICAgIGZvciAodmFyIHUgaW4gdW5pdHNPYmopIHtcbiAgICAgICAgICAgIHVuaXRzLnB1c2goe3VuaXQ6IHUsIHByaW9yaXR5OiBwcmlvcml0aWVzW3VdfSk7XG4gICAgICAgIH1cbiAgICAgICAgdW5pdHMuc29ydChmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICAgICAgcmV0dXJuIGEucHJpb3JpdHkgLSBiLnByaW9yaXR5O1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHVuaXRzO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHplcm9GaWxsKG51bWJlciwgdGFyZ2V0TGVuZ3RoLCBmb3JjZVNpZ24pIHtcbiAgICAgICAgdmFyIGFic051bWJlciA9ICcnICsgTWF0aC5hYnMobnVtYmVyKSxcbiAgICAgICAgICAgIHplcm9zVG9GaWxsID0gdGFyZ2V0TGVuZ3RoIC0gYWJzTnVtYmVyLmxlbmd0aCxcbiAgICAgICAgICAgIHNpZ24gPSBudW1iZXIgPj0gMDtcbiAgICAgICAgcmV0dXJuIChzaWduID8gKGZvcmNlU2lnbiA/ICcrJyA6ICcnKSA6ICctJykgK1xuICAgICAgICAgICAgTWF0aC5wb3coMTAsIE1hdGgubWF4KDAsIHplcm9zVG9GaWxsKSkudG9TdHJpbmcoKS5zdWJzdHIoMSkgKyBhYnNOdW1iZXI7XG4gICAgfVxuXG4gICAgdmFyIGZvcm1hdHRpbmdUb2tlbnMgPSAvKFxcW1teXFxbXSpcXF0pfChcXFxcKT8oW0hoXW1tKHNzKT98TW98TU0/TT9NP3xEb3xERERvfEREP0Q/RD98ZGRkP2Q/fGRvP3x3W298d10/fFdbb3xXXT98UW8/fFlZWVlZWXxZWVlZWXxZWVlZfFlZfGdnKGdnZz8pP3xHRyhHR0c/KT98ZXxFfGF8QXxoaD98SEg/fGtrP3xtbT98c3M/fFN7MSw5fXx4fFh8eno/fFpaP3wuKS9nO1xuXG4gICAgdmFyIGxvY2FsRm9ybWF0dGluZ1Rva2VucyA9IC8oXFxbW15cXFtdKlxcXSl8KFxcXFwpPyhMVFN8TFR8TEw/TD9MP3xsezEsNH0pL2c7XG5cbiAgICB2YXIgZm9ybWF0RnVuY3Rpb25zID0ge307XG5cbiAgICB2YXIgZm9ybWF0VG9rZW5GdW5jdGlvbnMgPSB7fTtcblxuICAgIC8vIHRva2VuOiAgICAnTSdcbiAgICAvLyBwYWRkZWQ6ICAgWydNTScsIDJdXG4gICAgLy8gb3JkaW5hbDogICdNbydcbiAgICAvLyBjYWxsYmFjazogZnVuY3Rpb24gKCkgeyB0aGlzLm1vbnRoKCkgKyAxIH1cbiAgICBmdW5jdGlvbiBhZGRGb3JtYXRUb2tlbiAodG9rZW4sIHBhZGRlZCwgb3JkaW5hbCwgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIGZ1bmMgPSBjYWxsYmFjaztcbiAgICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIGZ1bmMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXNbY2FsbGJhY2tdKCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIGlmICh0b2tlbikge1xuICAgICAgICAgICAgZm9ybWF0VG9rZW5GdW5jdGlvbnNbdG9rZW5dID0gZnVuYztcbiAgICAgICAgfVxuICAgICAgICBpZiAocGFkZGVkKSB7XG4gICAgICAgICAgICBmb3JtYXRUb2tlbkZ1bmN0aW9uc1twYWRkZWRbMF1dID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB6ZXJvRmlsbChmdW5jLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyksIHBhZGRlZFsxXSwgcGFkZGVkWzJdKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG9yZGluYWwpIHtcbiAgICAgICAgICAgIGZvcm1hdFRva2VuRnVuY3Rpb25zW29yZGluYWxdID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmxvY2FsZURhdGEoKS5vcmRpbmFsKGZ1bmMuYXBwbHkodGhpcywgYXJndW1lbnRzKSwgdG9rZW4pO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlbW92ZUZvcm1hdHRpbmdUb2tlbnMoaW5wdXQpIHtcbiAgICAgICAgaWYgKGlucHV0Lm1hdGNoKC9cXFtbXFxzXFxTXS8pKSB7XG4gICAgICAgICAgICByZXR1cm4gaW5wdXQucmVwbGFjZSgvXlxcW3xcXF0kL2csICcnKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaW5wdXQucmVwbGFjZSgvXFxcXC9nLCAnJyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbWFrZUZvcm1hdEZ1bmN0aW9uKGZvcm1hdCkge1xuICAgICAgICB2YXIgYXJyYXkgPSBmb3JtYXQubWF0Y2goZm9ybWF0dGluZ1Rva2VucyksIGksIGxlbmd0aDtcblxuICAgICAgICBmb3IgKGkgPSAwLCBsZW5ndGggPSBhcnJheS5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKGZvcm1hdFRva2VuRnVuY3Rpb25zW2FycmF5W2ldXSkge1xuICAgICAgICAgICAgICAgIGFycmF5W2ldID0gZm9ybWF0VG9rZW5GdW5jdGlvbnNbYXJyYXlbaV1dO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBhcnJheVtpXSA9IHJlbW92ZUZvcm1hdHRpbmdUb2tlbnMoYXJyYXlbaV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChtb20pIHtcbiAgICAgICAgICAgIHZhciBvdXRwdXQgPSAnJywgaTtcbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIG91dHB1dCArPSBpc0Z1bmN0aW9uKGFycmF5W2ldKSA/IGFycmF5W2ldLmNhbGwobW9tLCBmb3JtYXQpIDogYXJyYXlbaV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gb3V0cHV0O1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8vIGZvcm1hdCBkYXRlIHVzaW5nIG5hdGl2ZSBkYXRlIG9iamVjdFxuICAgIGZ1bmN0aW9uIGZvcm1hdE1vbWVudChtLCBmb3JtYXQpIHtcbiAgICAgICAgaWYgKCFtLmlzVmFsaWQoKSkge1xuICAgICAgICAgICAgcmV0dXJuIG0ubG9jYWxlRGF0YSgpLmludmFsaWREYXRlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBmb3JtYXQgPSBleHBhbmRGb3JtYXQoZm9ybWF0LCBtLmxvY2FsZURhdGEoKSk7XG4gICAgICAgIGZvcm1hdEZ1bmN0aW9uc1tmb3JtYXRdID0gZm9ybWF0RnVuY3Rpb25zW2Zvcm1hdF0gfHwgbWFrZUZvcm1hdEZ1bmN0aW9uKGZvcm1hdCk7XG5cbiAgICAgICAgcmV0dXJuIGZvcm1hdEZ1bmN0aW9uc1tmb3JtYXRdKG0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGV4cGFuZEZvcm1hdChmb3JtYXQsIGxvY2FsZSkge1xuICAgICAgICB2YXIgaSA9IDU7XG5cbiAgICAgICAgZnVuY3Rpb24gcmVwbGFjZUxvbmdEYXRlRm9ybWF0VG9rZW5zKGlucHV0KSB7XG4gICAgICAgICAgICByZXR1cm4gbG9jYWxlLmxvbmdEYXRlRm9ybWF0KGlucHV0KSB8fCBpbnB1dDtcbiAgICAgICAgfVxuXG4gICAgICAgIGxvY2FsRm9ybWF0dGluZ1Rva2Vucy5sYXN0SW5kZXggPSAwO1xuICAgICAgICB3aGlsZSAoaSA+PSAwICYmIGxvY2FsRm9ybWF0dGluZ1Rva2Vucy50ZXN0KGZvcm1hdCkpIHtcbiAgICAgICAgICAgIGZvcm1hdCA9IGZvcm1hdC5yZXBsYWNlKGxvY2FsRm9ybWF0dGluZ1Rva2VucywgcmVwbGFjZUxvbmdEYXRlRm9ybWF0VG9rZW5zKTtcbiAgICAgICAgICAgIGxvY2FsRm9ybWF0dGluZ1Rva2Vucy5sYXN0SW5kZXggPSAwO1xuICAgICAgICAgICAgaSAtPSAxO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZvcm1hdDtcbiAgICB9XG5cbiAgICB2YXIgbWF0Y2gxICAgICAgICAgPSAvXFxkLzsgICAgICAgICAgICAvLyAgICAgICAwIC0gOVxuICAgIHZhciBtYXRjaDIgICAgICAgICA9IC9cXGRcXGQvOyAgICAgICAgICAvLyAgICAgIDAwIC0gOTlcbiAgICB2YXIgbWF0Y2gzICAgICAgICAgPSAvXFxkezN9LzsgICAgICAgICAvLyAgICAgMDAwIC0gOTk5XG4gICAgdmFyIG1hdGNoNCAgICAgICAgID0gL1xcZHs0fS87ICAgICAgICAgLy8gICAgMDAwMCAtIDk5OTlcbiAgICB2YXIgbWF0Y2g2ICAgICAgICAgPSAvWystXT9cXGR7Nn0vOyAgICAvLyAtOTk5OTk5IC0gOTk5OTk5XG4gICAgdmFyIG1hdGNoMXRvMiAgICAgID0gL1xcZFxcZD8vOyAgICAgICAgIC8vICAgICAgIDAgLSA5OVxuICAgIHZhciBtYXRjaDN0bzQgICAgICA9IC9cXGRcXGRcXGRcXGQ/LzsgICAgIC8vICAgICA5OTkgLSA5OTk5XG4gICAgdmFyIG1hdGNoNXRvNiAgICAgID0gL1xcZFxcZFxcZFxcZFxcZFxcZD8vOyAvLyAgIDk5OTk5IC0gOTk5OTk5XG4gICAgdmFyIG1hdGNoMXRvMyAgICAgID0gL1xcZHsxLDN9LzsgICAgICAgLy8gICAgICAgMCAtIDk5OVxuICAgIHZhciBtYXRjaDF0bzQgICAgICA9IC9cXGR7MSw0fS87ICAgICAgIC8vICAgICAgIDAgLSA5OTk5XG4gICAgdmFyIG1hdGNoMXRvNiAgICAgID0gL1srLV0/XFxkezEsNn0vOyAgLy8gLTk5OTk5OSAtIDk5OTk5OVxuXG4gICAgdmFyIG1hdGNoVW5zaWduZWQgID0gL1xcZCsvOyAgICAgICAgICAgLy8gICAgICAgMCAtIGluZlxuICAgIHZhciBtYXRjaFNpZ25lZCAgICA9IC9bKy1dP1xcZCsvOyAgICAgIC8vICAgIC1pbmYgLSBpbmZcblxuICAgIHZhciBtYXRjaE9mZnNldCAgICA9IC9afFsrLV1cXGRcXGQ6P1xcZFxcZC9naTsgLy8gKzAwOjAwIC0wMDowMCArMDAwMCAtMDAwMCBvciBaXG4gICAgdmFyIG1hdGNoU2hvcnRPZmZzZXQgPSAvWnxbKy1dXFxkXFxkKD86Oj9cXGRcXGQpPy9naTsgLy8gKzAwIC0wMCArMDA6MDAgLTAwOjAwICswMDAwIC0wMDAwIG9yIFpcblxuICAgIHZhciBtYXRjaFRpbWVzdGFtcCA9IC9bKy1dP1xcZCsoXFwuXFxkezEsM30pPy87IC8vIDEyMzQ1Njc4OSAxMjM0NTY3ODkuMTIzXG5cbiAgICAvLyBhbnkgd29yZCAob3IgdHdvKSBjaGFyYWN0ZXJzIG9yIG51bWJlcnMgaW5jbHVkaW5nIHR3by90aHJlZSB3b3JkIG1vbnRoIGluIGFyYWJpYy5cbiAgICAvLyBpbmNsdWRlcyBzY290dGlzaCBnYWVsaWMgdHdvIHdvcmQgYW5kIGh5cGhlbmF0ZWQgbW9udGhzXG4gICAgdmFyIG1hdGNoV29yZCA9IC9bMC05XXswLDI1Nn1bJ2EtelxcdTAwQTAtXFx1MDVGRlxcdTA3MDAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkYwN1xcdUZGMTAtXFx1RkZFRl17MSwyNTZ9fFtcXHUwNjAwLVxcdTA2RkZcXC9dezEsMjU2fShcXHMqP1tcXHUwNjAwLVxcdTA2RkZdezEsMjU2fSl7MSwyfS9pO1xuXG4gICAgdmFyIHJlZ2V4ZXMgPSB7fTtcblxuICAgIGZ1bmN0aW9uIGFkZFJlZ2V4VG9rZW4gKHRva2VuLCByZWdleCwgc3RyaWN0UmVnZXgpIHtcbiAgICAgICAgcmVnZXhlc1t0b2tlbl0gPSBpc0Z1bmN0aW9uKHJlZ2V4KSA/IHJlZ2V4IDogZnVuY3Rpb24gKGlzU3RyaWN0LCBsb2NhbGVEYXRhKSB7XG4gICAgICAgICAgICByZXR1cm4gKGlzU3RyaWN0ICYmIHN0cmljdFJlZ2V4KSA/IHN0cmljdFJlZ2V4IDogcmVnZXg7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0UGFyc2VSZWdleEZvclRva2VuICh0b2tlbiwgY29uZmlnKSB7XG4gICAgICAgIGlmICghaGFzT3duUHJvcChyZWdleGVzLCB0b2tlbikpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgUmVnRXhwKHVuZXNjYXBlRm9ybWF0KHRva2VuKSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVnZXhlc1t0b2tlbl0oY29uZmlnLl9zdHJpY3QsIGNvbmZpZy5fbG9jYWxlKTtcbiAgICB9XG5cbiAgICAvLyBDb2RlIGZyb20gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8zNTYxNDkzL2lzLXRoZXJlLWEtcmVnZXhwLWVzY2FwZS1mdW5jdGlvbi1pbi1qYXZhc2NyaXB0XG4gICAgZnVuY3Rpb24gdW5lc2NhcGVGb3JtYXQocykge1xuICAgICAgICByZXR1cm4gcmVnZXhFc2NhcGUocy5yZXBsYWNlKCdcXFxcJywgJycpLnJlcGxhY2UoL1xcXFwoXFxbKXxcXFxcKFxcXSl8XFxbKFteXFxdXFxbXSopXFxdfFxcXFwoLikvZywgZnVuY3Rpb24gKG1hdGNoZWQsIHAxLCBwMiwgcDMsIHA0KSB7XG4gICAgICAgICAgICByZXR1cm4gcDEgfHwgcDIgfHwgcDMgfHwgcDQ7XG4gICAgICAgIH0pKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZWdleEVzY2FwZShzKSB7XG4gICAgICAgIHJldHVybiBzLnJlcGxhY2UoL1stXFwvXFxcXF4kKis/LigpfFtcXF17fV0vZywgJ1xcXFwkJicpO1xuICAgIH1cblxuICAgIHZhciB0b2tlbnMgPSB7fTtcblxuICAgIGZ1bmN0aW9uIGFkZFBhcnNlVG9rZW4gKHRva2VuLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgaSwgZnVuYyA9IGNhbGxiYWNrO1xuICAgICAgICBpZiAodHlwZW9mIHRva2VuID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgdG9rZW4gPSBbdG9rZW5dO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpc051bWJlcihjYWxsYmFjaykpIHtcbiAgICAgICAgICAgIGZ1bmMgPSBmdW5jdGlvbiAoaW5wdXQsIGFycmF5KSB7XG4gICAgICAgICAgICAgICAgYXJyYXlbY2FsbGJhY2tdID0gdG9JbnQoaW5wdXQpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgdG9rZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHRva2Vuc1t0b2tlbltpXV0gPSBmdW5jO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYWRkV2Vla1BhcnNlVG9rZW4gKHRva2VuLCBjYWxsYmFjaykge1xuICAgICAgICBhZGRQYXJzZVRva2VuKHRva2VuLCBmdW5jdGlvbiAoaW5wdXQsIGFycmF5LCBjb25maWcsIHRva2VuKSB7XG4gICAgICAgICAgICBjb25maWcuX3cgPSBjb25maWcuX3cgfHwge307XG4gICAgICAgICAgICBjYWxsYmFjayhpbnB1dCwgY29uZmlnLl93LCBjb25maWcsIHRva2VuKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYWRkVGltZVRvQXJyYXlGcm9tVG9rZW4odG9rZW4sIGlucHV0LCBjb25maWcpIHtcbiAgICAgICAgaWYgKGlucHV0ICE9IG51bGwgJiYgaGFzT3duUHJvcCh0b2tlbnMsIHRva2VuKSkge1xuICAgICAgICAgICAgdG9rZW5zW3Rva2VuXShpbnB1dCwgY29uZmlnLl9hLCBjb25maWcsIHRva2VuKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHZhciBZRUFSID0gMDtcbiAgICB2YXIgTU9OVEggPSAxO1xuICAgIHZhciBEQVRFID0gMjtcbiAgICB2YXIgSE9VUiA9IDM7XG4gICAgdmFyIE1JTlVURSA9IDQ7XG4gICAgdmFyIFNFQ09ORCA9IDU7XG4gICAgdmFyIE1JTExJU0VDT05EID0gNjtcbiAgICB2YXIgV0VFSyA9IDc7XG4gICAgdmFyIFdFRUtEQVkgPSA4O1xuXG4gICAgLy8gRk9STUFUVElOR1xuXG4gICAgYWRkRm9ybWF0VG9rZW4oJ1knLCAwLCAwLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciB5ID0gdGhpcy55ZWFyKCk7XG4gICAgICAgIHJldHVybiB5IDw9IDk5OTkgPyAnJyArIHkgOiAnKycgKyB5O1xuICAgIH0pO1xuXG4gICAgYWRkRm9ybWF0VG9rZW4oMCwgWydZWScsIDJdLCAwLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnllYXIoKSAlIDEwMDtcbiAgICB9KTtcblxuICAgIGFkZEZvcm1hdFRva2VuKDAsIFsnWVlZWScsICAgNF0sICAgICAgIDAsICd5ZWFyJyk7XG4gICAgYWRkRm9ybWF0VG9rZW4oMCwgWydZWVlZWScsICA1XSwgICAgICAgMCwgJ3llYXInKTtcbiAgICBhZGRGb3JtYXRUb2tlbigwLCBbJ1lZWVlZWScsIDYsIHRydWVdLCAwLCAneWVhcicpO1xuXG4gICAgLy8gQUxJQVNFU1xuXG4gICAgYWRkVW5pdEFsaWFzKCd5ZWFyJywgJ3knKTtcblxuICAgIC8vIFBSSU9SSVRJRVNcblxuICAgIGFkZFVuaXRQcmlvcml0eSgneWVhcicsIDEpO1xuXG4gICAgLy8gUEFSU0lOR1xuXG4gICAgYWRkUmVnZXhUb2tlbignWScsICAgICAgbWF0Y2hTaWduZWQpO1xuICAgIGFkZFJlZ2V4VG9rZW4oJ1lZJywgICAgIG1hdGNoMXRvMiwgbWF0Y2gyKTtcbiAgICBhZGRSZWdleFRva2VuKCdZWVlZJywgICBtYXRjaDF0bzQsIG1hdGNoNCk7XG4gICAgYWRkUmVnZXhUb2tlbignWVlZWVknLCAgbWF0Y2gxdG82LCBtYXRjaDYpO1xuICAgIGFkZFJlZ2V4VG9rZW4oJ1lZWVlZWScsIG1hdGNoMXRvNiwgbWF0Y2g2KTtcblxuICAgIGFkZFBhcnNlVG9rZW4oWydZWVlZWScsICdZWVlZWVknXSwgWUVBUik7XG4gICAgYWRkUGFyc2VUb2tlbignWVlZWScsIGZ1bmN0aW9uIChpbnB1dCwgYXJyYXkpIHtcbiAgICAgICAgYXJyYXlbWUVBUl0gPSBpbnB1dC5sZW5ndGggPT09IDIgPyBob29rcy5wYXJzZVR3b0RpZ2l0WWVhcihpbnB1dCkgOiB0b0ludChpbnB1dCk7XG4gICAgfSk7XG4gICAgYWRkUGFyc2VUb2tlbignWVknLCBmdW5jdGlvbiAoaW5wdXQsIGFycmF5KSB7XG4gICAgICAgIGFycmF5W1lFQVJdID0gaG9va3MucGFyc2VUd29EaWdpdFllYXIoaW5wdXQpO1xuICAgIH0pO1xuICAgIGFkZFBhcnNlVG9rZW4oJ1knLCBmdW5jdGlvbiAoaW5wdXQsIGFycmF5KSB7XG4gICAgICAgIGFycmF5W1lFQVJdID0gcGFyc2VJbnQoaW5wdXQsIDEwKTtcbiAgICB9KTtcblxuICAgIC8vIEhFTFBFUlNcblxuICAgIGZ1bmN0aW9uIGRheXNJblllYXIoeWVhcikge1xuICAgICAgICByZXR1cm4gaXNMZWFwWWVhcih5ZWFyKSA/IDM2NiA6IDM2NTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpc0xlYXBZZWFyKHllYXIpIHtcbiAgICAgICAgcmV0dXJuICh5ZWFyICUgNCA9PT0gMCAmJiB5ZWFyICUgMTAwICE9PSAwKSB8fCB5ZWFyICUgNDAwID09PSAwO1xuICAgIH1cblxuICAgIC8vIEhPT0tTXG5cbiAgICBob29rcy5wYXJzZVR3b0RpZ2l0WWVhciA9IGZ1bmN0aW9uIChpbnB1dCkge1xuICAgICAgICByZXR1cm4gdG9JbnQoaW5wdXQpICsgKHRvSW50KGlucHV0KSA+IDY4ID8gMTkwMCA6IDIwMDApO1xuICAgIH07XG5cbiAgICAvLyBNT01FTlRTXG5cbiAgICB2YXIgZ2V0U2V0WWVhciA9IG1ha2VHZXRTZXQoJ0Z1bGxZZWFyJywgdHJ1ZSk7XG5cbiAgICBmdW5jdGlvbiBnZXRJc0xlYXBZZWFyICgpIHtcbiAgICAgICAgcmV0dXJuIGlzTGVhcFllYXIodGhpcy55ZWFyKCkpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG1ha2VHZXRTZXQgKHVuaXQsIGtlZXBUaW1lKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIGlmICh2YWx1ZSAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgc2V0JDEodGhpcywgdW5pdCwgdmFsdWUpO1xuICAgICAgICAgICAgICAgIGhvb2tzLnVwZGF0ZU9mZnNldCh0aGlzLCBrZWVwVGltZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBnZXQodGhpcywgdW5pdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0IChtb20sIHVuaXQpIHtcbiAgICAgICAgcmV0dXJuIG1vbS5pc1ZhbGlkKCkgP1xuICAgICAgICAgICAgbW9tLl9kWydnZXQnICsgKG1vbS5faXNVVEMgPyAnVVRDJyA6ICcnKSArIHVuaXRdKCkgOiBOYU47XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc2V0JDEgKG1vbSwgdW5pdCwgdmFsdWUpIHtcbiAgICAgICAgaWYgKG1vbS5pc1ZhbGlkKCkgJiYgIWlzTmFOKHZhbHVlKSkge1xuICAgICAgICAgICAgaWYgKHVuaXQgPT09ICdGdWxsWWVhcicgJiYgaXNMZWFwWWVhcihtb20ueWVhcigpKSAmJiBtb20ubW9udGgoKSA9PT0gMSAmJiBtb20uZGF0ZSgpID09PSAyOSkge1xuICAgICAgICAgICAgICAgIG1vbS5fZFsnc2V0JyArIChtb20uX2lzVVRDID8gJ1VUQycgOiAnJykgKyB1bml0XSh2YWx1ZSwgbW9tLm1vbnRoKCksIGRheXNJbk1vbnRoKHZhbHVlLCBtb20ubW9udGgoKSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgbW9tLl9kWydzZXQnICsgKG1vbS5faXNVVEMgPyAnVVRDJyA6ICcnKSArIHVuaXRdKHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIE1PTUVOVFNcblxuICAgIGZ1bmN0aW9uIHN0cmluZ0dldCAodW5pdHMpIHtcbiAgICAgICAgdW5pdHMgPSBub3JtYWxpemVVbml0cyh1bml0cyk7XG4gICAgICAgIGlmIChpc0Z1bmN0aW9uKHRoaXNbdW5pdHNdKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXNbdW5pdHNdKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG5cbiAgICBmdW5jdGlvbiBzdHJpbmdTZXQgKHVuaXRzLCB2YWx1ZSkge1xuICAgICAgICBpZiAodHlwZW9mIHVuaXRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgdW5pdHMgPSBub3JtYWxpemVPYmplY3RVbml0cyh1bml0cyk7XG4gICAgICAgICAgICB2YXIgcHJpb3JpdGl6ZWQgPSBnZXRQcmlvcml0aXplZFVuaXRzKHVuaXRzKTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcHJpb3JpdGl6ZWQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB0aGlzW3ByaW9yaXRpemVkW2ldLnVuaXRdKHVuaXRzW3ByaW9yaXRpemVkW2ldLnVuaXRdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHVuaXRzID0gbm9ybWFsaXplVW5pdHModW5pdHMpO1xuICAgICAgICAgICAgaWYgKGlzRnVuY3Rpb24odGhpc1t1bml0c10pKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXNbdW5pdHNdKHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBtb2QobiwgeCkge1xuICAgICAgICByZXR1cm4gKChuICUgeCkgKyB4KSAlIHg7XG4gICAgfVxuXG4gICAgdmFyIGluZGV4T2Y7XG5cbiAgICBpZiAoQXJyYXkucHJvdG90eXBlLmluZGV4T2YpIHtcbiAgICAgICAgaW5kZXhPZiA9IEFycmF5LnByb3RvdHlwZS5pbmRleE9mO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGluZGV4T2YgPSBmdW5jdGlvbiAobykge1xuICAgICAgICAgICAgLy8gSSBrbm93XG4gICAgICAgICAgICB2YXIgaTtcbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCB0aGlzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXNbaV0gPT09IG8pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGRheXNJbk1vbnRoKHllYXIsIG1vbnRoKSB7XG4gICAgICAgIGlmIChpc05hTih5ZWFyKSB8fCBpc05hTihtb250aCkpIHtcbiAgICAgICAgICAgIHJldHVybiBOYU47XG4gICAgICAgIH1cbiAgICAgICAgdmFyIG1vZE1vbnRoID0gbW9kKG1vbnRoLCAxMik7XG4gICAgICAgIHllYXIgKz0gKG1vbnRoIC0gbW9kTW9udGgpIC8gMTI7XG4gICAgICAgIHJldHVybiBtb2RNb250aCA9PT0gMSA/IChpc0xlYXBZZWFyKHllYXIpID8gMjkgOiAyOCkgOiAoMzEgLSBtb2RNb250aCAlIDcgJSAyKTtcbiAgICB9XG5cbiAgICAvLyBGT1JNQVRUSU5HXG5cbiAgICBhZGRGb3JtYXRUb2tlbignTScsIFsnTU0nLCAyXSwgJ01vJywgZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5tb250aCgpICsgMTtcbiAgICB9KTtcblxuICAgIGFkZEZvcm1hdFRva2VuKCdNTU0nLCAwLCAwLCBmdW5jdGlvbiAoZm9ybWF0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLmxvY2FsZURhdGEoKS5tb250aHNTaG9ydCh0aGlzLCBmb3JtYXQpO1xuICAgIH0pO1xuXG4gICAgYWRkRm9ybWF0VG9rZW4oJ01NTU0nLCAwLCAwLCBmdW5jdGlvbiAoZm9ybWF0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLmxvY2FsZURhdGEoKS5tb250aHModGhpcywgZm9ybWF0KTtcbiAgICB9KTtcblxuICAgIC8vIEFMSUFTRVNcblxuICAgIGFkZFVuaXRBbGlhcygnbW9udGgnLCAnTScpO1xuXG4gICAgLy8gUFJJT1JJVFlcblxuICAgIGFkZFVuaXRQcmlvcml0eSgnbW9udGgnLCA4KTtcblxuICAgIC8vIFBBUlNJTkdcblxuICAgIGFkZFJlZ2V4VG9rZW4oJ00nLCAgICBtYXRjaDF0bzIpO1xuICAgIGFkZFJlZ2V4VG9rZW4oJ01NJywgICBtYXRjaDF0bzIsIG1hdGNoMik7XG4gICAgYWRkUmVnZXhUb2tlbignTU1NJywgIGZ1bmN0aW9uIChpc1N0cmljdCwgbG9jYWxlKSB7XG4gICAgICAgIHJldHVybiBsb2NhbGUubW9udGhzU2hvcnRSZWdleChpc1N0cmljdCk7XG4gICAgfSk7XG4gICAgYWRkUmVnZXhUb2tlbignTU1NTScsIGZ1bmN0aW9uIChpc1N0cmljdCwgbG9jYWxlKSB7XG4gICAgICAgIHJldHVybiBsb2NhbGUubW9udGhzUmVnZXgoaXNTdHJpY3QpO1xuICAgIH0pO1xuXG4gICAgYWRkUGFyc2VUb2tlbihbJ00nLCAnTU0nXSwgZnVuY3Rpb24gKGlucHV0LCBhcnJheSkge1xuICAgICAgICBhcnJheVtNT05USF0gPSB0b0ludChpbnB1dCkgLSAxO1xuICAgIH0pO1xuXG4gICAgYWRkUGFyc2VUb2tlbihbJ01NTScsICdNTU1NJ10sIGZ1bmN0aW9uIChpbnB1dCwgYXJyYXksIGNvbmZpZywgdG9rZW4pIHtcbiAgICAgICAgdmFyIG1vbnRoID0gY29uZmlnLl9sb2NhbGUubW9udGhzUGFyc2UoaW5wdXQsIHRva2VuLCBjb25maWcuX3N0cmljdCk7XG4gICAgICAgIC8vIGlmIHdlIGRpZG4ndCBmaW5kIGEgbW9udGggbmFtZSwgbWFyayB0aGUgZGF0ZSBhcyBpbnZhbGlkLlxuICAgICAgICBpZiAobW9udGggIT0gbnVsbCkge1xuICAgICAgICAgICAgYXJyYXlbTU9OVEhdID0gbW9udGg7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBnZXRQYXJzaW5nRmxhZ3MoY29uZmlnKS5pbnZhbGlkTW9udGggPSBpbnB1dDtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gTE9DQUxFU1xuXG4gICAgdmFyIE1PTlRIU19JTl9GT1JNQVQgPSAvRFtvRF0/KFxcW1teXFxbXFxdXSpcXF18XFxzKStNTU1NPy87XG4gICAgdmFyIGRlZmF1bHRMb2NhbGVNb250aHMgPSAnSmFudWFyeV9GZWJydWFyeV9NYXJjaF9BcHJpbF9NYXlfSnVuZV9KdWx5X0F1Z3VzdF9TZXB0ZW1iZXJfT2N0b2Jlcl9Ob3ZlbWJlcl9EZWNlbWJlcicuc3BsaXQoJ18nKTtcbiAgICBmdW5jdGlvbiBsb2NhbGVNb250aHMgKG0sIGZvcm1hdCkge1xuICAgICAgICBpZiAoIW0pIHtcbiAgICAgICAgICAgIHJldHVybiBpc0FycmF5KHRoaXMuX21vbnRocykgPyB0aGlzLl9tb250aHMgOlxuICAgICAgICAgICAgICAgIHRoaXMuX21vbnRoc1snc3RhbmRhbG9uZSddO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpc0FycmF5KHRoaXMuX21vbnRocykgPyB0aGlzLl9tb250aHNbbS5tb250aCgpXSA6XG4gICAgICAgICAgICB0aGlzLl9tb250aHNbKHRoaXMuX21vbnRocy5pc0Zvcm1hdCB8fCBNT05USFNfSU5fRk9STUFUKS50ZXN0KGZvcm1hdCkgPyAnZm9ybWF0JyA6ICdzdGFuZGFsb25lJ11bbS5tb250aCgpXTtcbiAgICB9XG5cbiAgICB2YXIgZGVmYXVsdExvY2FsZU1vbnRoc1Nob3J0ID0gJ0phbl9GZWJfTWFyX0Fwcl9NYXlfSnVuX0p1bF9BdWdfU2VwX09jdF9Ob3ZfRGVjJy5zcGxpdCgnXycpO1xuICAgIGZ1bmN0aW9uIGxvY2FsZU1vbnRoc1Nob3J0IChtLCBmb3JtYXQpIHtcbiAgICAgICAgaWYgKCFtKSB7XG4gICAgICAgICAgICByZXR1cm4gaXNBcnJheSh0aGlzLl9tb250aHNTaG9ydCkgPyB0aGlzLl9tb250aHNTaG9ydCA6XG4gICAgICAgICAgICAgICAgdGhpcy5fbW9udGhzU2hvcnRbJ3N0YW5kYWxvbmUnXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaXNBcnJheSh0aGlzLl9tb250aHNTaG9ydCkgPyB0aGlzLl9tb250aHNTaG9ydFttLm1vbnRoKCldIDpcbiAgICAgICAgICAgIHRoaXMuX21vbnRoc1Nob3J0W01PTlRIU19JTl9GT1JNQVQudGVzdChmb3JtYXQpID8gJ2Zvcm1hdCcgOiAnc3RhbmRhbG9uZSddW20ubW9udGgoKV07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaGFuZGxlU3RyaWN0UGFyc2UobW9udGhOYW1lLCBmb3JtYXQsIHN0cmljdCkge1xuICAgICAgICB2YXIgaSwgaWksIG1vbSwgbGxjID0gbW9udGhOYW1lLnRvTG9jYWxlTG93ZXJDYXNlKCk7XG4gICAgICAgIGlmICghdGhpcy5fbW9udGhzUGFyc2UpIHtcbiAgICAgICAgICAgIC8vIHRoaXMgaXMgbm90IHVzZWRcbiAgICAgICAgICAgIHRoaXMuX21vbnRoc1BhcnNlID0gW107XG4gICAgICAgICAgICB0aGlzLl9sb25nTW9udGhzUGFyc2UgPSBbXTtcbiAgICAgICAgICAgIHRoaXMuX3Nob3J0TW9udGhzUGFyc2UgPSBbXTtcbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCAxMjsgKytpKSB7XG4gICAgICAgICAgICAgICAgbW9tID0gY3JlYXRlVVRDKFsyMDAwLCBpXSk7XG4gICAgICAgICAgICAgICAgdGhpcy5fc2hvcnRNb250aHNQYXJzZVtpXSA9IHRoaXMubW9udGhzU2hvcnQobW9tLCAnJykudG9Mb2NhbGVMb3dlckNhc2UoKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9sb25nTW9udGhzUGFyc2VbaV0gPSB0aGlzLm1vbnRocyhtb20sICcnKS50b0xvY2FsZUxvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHN0cmljdCkge1xuICAgICAgICAgICAgaWYgKGZvcm1hdCA9PT0gJ01NTScpIHtcbiAgICAgICAgICAgICAgICBpaSA9IGluZGV4T2YuY2FsbCh0aGlzLl9zaG9ydE1vbnRoc1BhcnNlLCBsbGMpO1xuICAgICAgICAgICAgICAgIHJldHVybiBpaSAhPT0gLTEgPyBpaSA6IG51bGw7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlpID0gaW5kZXhPZi5jYWxsKHRoaXMuX2xvbmdNb250aHNQYXJzZSwgbGxjKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gaWkgIT09IC0xID8gaWkgOiBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGZvcm1hdCA9PT0gJ01NTScpIHtcbiAgICAgICAgICAgICAgICBpaSA9IGluZGV4T2YuY2FsbCh0aGlzLl9zaG9ydE1vbnRoc1BhcnNlLCBsbGMpO1xuICAgICAgICAgICAgICAgIGlmIChpaSAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGlpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpaSA9IGluZGV4T2YuY2FsbCh0aGlzLl9sb25nTW9udGhzUGFyc2UsIGxsYyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGlpICE9PSAtMSA/IGlpIDogbnVsbDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWkgPSBpbmRleE9mLmNhbGwodGhpcy5fbG9uZ01vbnRoc1BhcnNlLCBsbGMpO1xuICAgICAgICAgICAgICAgIGlmIChpaSAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGlpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpaSA9IGluZGV4T2YuY2FsbCh0aGlzLl9zaG9ydE1vbnRoc1BhcnNlLCBsbGMpO1xuICAgICAgICAgICAgICAgIHJldHVybiBpaSAhPT0gLTEgPyBpaSA6IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsb2NhbGVNb250aHNQYXJzZSAobW9udGhOYW1lLCBmb3JtYXQsIHN0cmljdCkge1xuICAgICAgICB2YXIgaSwgbW9tLCByZWdleDtcblxuICAgICAgICBpZiAodGhpcy5fbW9udGhzUGFyc2VFeGFjdCkge1xuICAgICAgICAgICAgcmV0dXJuIGhhbmRsZVN0cmljdFBhcnNlLmNhbGwodGhpcywgbW9udGhOYW1lLCBmb3JtYXQsIHN0cmljdCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMuX21vbnRoc1BhcnNlKSB7XG4gICAgICAgICAgICB0aGlzLl9tb250aHNQYXJzZSA9IFtdO1xuICAgICAgICAgICAgdGhpcy5fbG9uZ01vbnRoc1BhcnNlID0gW107XG4gICAgICAgICAgICB0aGlzLl9zaG9ydE1vbnRoc1BhcnNlID0gW107XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUT0RPOiBhZGQgc29ydGluZ1xuICAgICAgICAvLyBTb3J0aW5nIG1ha2VzIHN1cmUgaWYgb25lIG1vbnRoIChvciBhYmJyKSBpcyBhIHByZWZpeCBvZiBhbm90aGVyXG4gICAgICAgIC8vIHNlZSBzb3J0aW5nIGluIGNvbXB1dGVNb250aHNQYXJzZVxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgMTI7IGkrKykge1xuICAgICAgICAgICAgLy8gbWFrZSB0aGUgcmVnZXggaWYgd2UgZG9uJ3QgaGF2ZSBpdCBhbHJlYWR5XG4gICAgICAgICAgICBtb20gPSBjcmVhdGVVVEMoWzIwMDAsIGldKTtcbiAgICAgICAgICAgIGlmIChzdHJpY3QgJiYgIXRoaXMuX2xvbmdNb250aHNQYXJzZVtpXSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2xvbmdNb250aHNQYXJzZVtpXSA9IG5ldyBSZWdFeHAoJ14nICsgdGhpcy5tb250aHMobW9tLCAnJykucmVwbGFjZSgnLicsICcnKSArICckJywgJ2knKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9zaG9ydE1vbnRoc1BhcnNlW2ldID0gbmV3IFJlZ0V4cCgnXicgKyB0aGlzLm1vbnRoc1Nob3J0KG1vbSwgJycpLnJlcGxhY2UoJy4nLCAnJykgKyAnJCcsICdpJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIXN0cmljdCAmJiAhdGhpcy5fbW9udGhzUGFyc2VbaV0pIHtcbiAgICAgICAgICAgICAgICByZWdleCA9ICdeJyArIHRoaXMubW9udGhzKG1vbSwgJycpICsgJ3xeJyArIHRoaXMubW9udGhzU2hvcnQobW9tLCAnJyk7XG4gICAgICAgICAgICAgICAgdGhpcy5fbW9udGhzUGFyc2VbaV0gPSBuZXcgUmVnRXhwKHJlZ2V4LnJlcGxhY2UoJy4nLCAnJyksICdpJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyB0ZXN0IHRoZSByZWdleFxuICAgICAgICAgICAgaWYgKHN0cmljdCAmJiBmb3JtYXQgPT09ICdNTU1NJyAmJiB0aGlzLl9sb25nTW9udGhzUGFyc2VbaV0udGVzdChtb250aE5hbWUpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHN0cmljdCAmJiBmb3JtYXQgPT09ICdNTU0nICYmIHRoaXMuX3Nob3J0TW9udGhzUGFyc2VbaV0udGVzdChtb250aE5hbWUpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCFzdHJpY3QgJiYgdGhpcy5fbW9udGhzUGFyc2VbaV0udGVzdChtb250aE5hbWUpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBNT01FTlRTXG5cbiAgICBmdW5jdGlvbiBzZXRNb250aCAobW9tLCB2YWx1ZSkge1xuICAgICAgICB2YXIgZGF5T2ZNb250aDtcblxuICAgICAgICBpZiAoIW1vbS5pc1ZhbGlkKCkpIHtcbiAgICAgICAgICAgIC8vIE5vIG9wXG4gICAgICAgICAgICByZXR1cm4gbW9tO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIGlmICgvXlxcZCskLy50ZXN0KHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIHZhbHVlID0gdG9JbnQodmFsdWUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IG1vbS5sb2NhbGVEYXRhKCkubW9udGhzUGFyc2UodmFsdWUpO1xuICAgICAgICAgICAgICAgIC8vIFRPRE86IEFub3RoZXIgc2lsZW50IGZhaWx1cmU/XG4gICAgICAgICAgICAgICAgaWYgKCFpc051bWJlcih2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1vbTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBkYXlPZk1vbnRoID0gTWF0aC5taW4obW9tLmRhdGUoKSwgZGF5c0luTW9udGgobW9tLnllYXIoKSwgdmFsdWUpKTtcbiAgICAgICAgbW9tLl9kWydzZXQnICsgKG1vbS5faXNVVEMgPyAnVVRDJyA6ICcnKSArICdNb250aCddKHZhbHVlLCBkYXlPZk1vbnRoKTtcbiAgICAgICAgcmV0dXJuIG1vbTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRTZXRNb250aCAodmFsdWUpIHtcbiAgICAgICAgaWYgKHZhbHVlICE9IG51bGwpIHtcbiAgICAgICAgICAgIHNldE1vbnRoKHRoaXMsIHZhbHVlKTtcbiAgICAgICAgICAgIGhvb2tzLnVwZGF0ZU9mZnNldCh0aGlzLCB0cnVlKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGdldCh0aGlzLCAnTW9udGgnKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldERheXNJbk1vbnRoICgpIHtcbiAgICAgICAgcmV0dXJuIGRheXNJbk1vbnRoKHRoaXMueWVhcigpLCB0aGlzLm1vbnRoKCkpO1xuICAgIH1cblxuICAgIHZhciBkZWZhdWx0TW9udGhzU2hvcnRSZWdleCA9IG1hdGNoV29yZDtcbiAgICBmdW5jdGlvbiBtb250aHNTaG9ydFJlZ2V4IChpc1N0cmljdCkge1xuICAgICAgICBpZiAodGhpcy5fbW9udGhzUGFyc2VFeGFjdCkge1xuICAgICAgICAgICAgaWYgKCFoYXNPd25Qcm9wKHRoaXMsICdfbW9udGhzUmVnZXgnKSkge1xuICAgICAgICAgICAgICAgIGNvbXB1dGVNb250aHNQYXJzZS5jYWxsKHRoaXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGlzU3RyaWN0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX21vbnRoc1Nob3J0U3RyaWN0UmVnZXg7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9tb250aHNTaG9ydFJlZ2V4O1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKCFoYXNPd25Qcm9wKHRoaXMsICdfbW9udGhzU2hvcnRSZWdleCcpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fbW9udGhzU2hvcnRSZWdleCA9IGRlZmF1bHRNb250aHNTaG9ydFJlZ2V4O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX21vbnRoc1Nob3J0U3RyaWN0UmVnZXggJiYgaXNTdHJpY3QgP1xuICAgICAgICAgICAgICAgIHRoaXMuX21vbnRoc1Nob3J0U3RyaWN0UmVnZXggOiB0aGlzLl9tb250aHNTaG9ydFJlZ2V4O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdmFyIGRlZmF1bHRNb250aHNSZWdleCA9IG1hdGNoV29yZDtcbiAgICBmdW5jdGlvbiBtb250aHNSZWdleCAoaXNTdHJpY3QpIHtcbiAgICAgICAgaWYgKHRoaXMuX21vbnRoc1BhcnNlRXhhY3QpIHtcbiAgICAgICAgICAgIGlmICghaGFzT3duUHJvcCh0aGlzLCAnX21vbnRoc1JlZ2V4JykpIHtcbiAgICAgICAgICAgICAgICBjb21wdXRlTW9udGhzUGFyc2UuY2FsbCh0aGlzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpc1N0cmljdCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9tb250aHNTdHJpY3RSZWdleDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX21vbnRoc1JlZ2V4O1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKCFoYXNPd25Qcm9wKHRoaXMsICdfbW9udGhzUmVnZXgnKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX21vbnRoc1JlZ2V4ID0gZGVmYXVsdE1vbnRoc1JlZ2V4O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX21vbnRoc1N0cmljdFJlZ2V4ICYmIGlzU3RyaWN0ID9cbiAgICAgICAgICAgICAgICB0aGlzLl9tb250aHNTdHJpY3RSZWdleCA6IHRoaXMuX21vbnRoc1JlZ2V4O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY29tcHV0ZU1vbnRoc1BhcnNlICgpIHtcbiAgICAgICAgZnVuY3Rpb24gY21wTGVuUmV2KGEsIGIpIHtcbiAgICAgICAgICAgIHJldHVybiBiLmxlbmd0aCAtIGEubGVuZ3RoO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHNob3J0UGllY2VzID0gW10sIGxvbmdQaWVjZXMgPSBbXSwgbWl4ZWRQaWVjZXMgPSBbXSxcbiAgICAgICAgICAgIGksIG1vbTtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IDEyOyBpKyspIHtcbiAgICAgICAgICAgIC8vIG1ha2UgdGhlIHJlZ2V4IGlmIHdlIGRvbid0IGhhdmUgaXQgYWxyZWFkeVxuICAgICAgICAgICAgbW9tID0gY3JlYXRlVVRDKFsyMDAwLCBpXSk7XG4gICAgICAgICAgICBzaG9ydFBpZWNlcy5wdXNoKHRoaXMubW9udGhzU2hvcnQobW9tLCAnJykpO1xuICAgICAgICAgICAgbG9uZ1BpZWNlcy5wdXNoKHRoaXMubW9udGhzKG1vbSwgJycpKTtcbiAgICAgICAgICAgIG1peGVkUGllY2VzLnB1c2godGhpcy5tb250aHMobW9tLCAnJykpO1xuICAgICAgICAgICAgbWl4ZWRQaWVjZXMucHVzaCh0aGlzLm1vbnRoc1Nob3J0KG1vbSwgJycpKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBTb3J0aW5nIG1ha2VzIHN1cmUgaWYgb25lIG1vbnRoIChvciBhYmJyKSBpcyBhIHByZWZpeCBvZiBhbm90aGVyIGl0XG4gICAgICAgIC8vIHdpbGwgbWF0Y2ggdGhlIGxvbmdlciBwaWVjZS5cbiAgICAgICAgc2hvcnRQaWVjZXMuc29ydChjbXBMZW5SZXYpO1xuICAgICAgICBsb25nUGllY2VzLnNvcnQoY21wTGVuUmV2KTtcbiAgICAgICAgbWl4ZWRQaWVjZXMuc29ydChjbXBMZW5SZXYpO1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgMTI7IGkrKykge1xuICAgICAgICAgICAgc2hvcnRQaWVjZXNbaV0gPSByZWdleEVzY2FwZShzaG9ydFBpZWNlc1tpXSk7XG4gICAgICAgICAgICBsb25nUGllY2VzW2ldID0gcmVnZXhFc2NhcGUobG9uZ1BpZWNlc1tpXSk7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChpID0gMDsgaSA8IDI0OyBpKyspIHtcbiAgICAgICAgICAgIG1peGVkUGllY2VzW2ldID0gcmVnZXhFc2NhcGUobWl4ZWRQaWVjZXNbaV0pO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fbW9udGhzUmVnZXggPSBuZXcgUmVnRXhwKCdeKCcgKyBtaXhlZFBpZWNlcy5qb2luKCd8JykgKyAnKScsICdpJyk7XG4gICAgICAgIHRoaXMuX21vbnRoc1Nob3J0UmVnZXggPSB0aGlzLl9tb250aHNSZWdleDtcbiAgICAgICAgdGhpcy5fbW9udGhzU3RyaWN0UmVnZXggPSBuZXcgUmVnRXhwKCdeKCcgKyBsb25nUGllY2VzLmpvaW4oJ3wnKSArICcpJywgJ2knKTtcbiAgICAgICAgdGhpcy5fbW9udGhzU2hvcnRTdHJpY3RSZWdleCA9IG5ldyBSZWdFeHAoJ14oJyArIHNob3J0UGllY2VzLmpvaW4oJ3wnKSArICcpJywgJ2knKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjcmVhdGVEYXRlICh5LCBtLCBkLCBoLCBNLCBzLCBtcykge1xuICAgICAgICAvLyBjYW4ndCBqdXN0IGFwcGx5KCkgdG8gY3JlYXRlIGEgZGF0ZTpcbiAgICAgICAgLy8gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xLzE4MTM0OFxuICAgICAgICB2YXIgZGF0ZSA9IG5ldyBEYXRlKHksIG0sIGQsIGgsIE0sIHMsIG1zKTtcblxuICAgICAgICAvLyB0aGUgZGF0ZSBjb25zdHJ1Y3RvciByZW1hcHMgeWVhcnMgMC05OSB0byAxOTAwLTE5OTlcbiAgICAgICAgaWYgKHkgPCAxMDAgJiYgeSA+PSAwICYmIGlzRmluaXRlKGRhdGUuZ2V0RnVsbFllYXIoKSkpIHtcbiAgICAgICAgICAgIGRhdGUuc2V0RnVsbFllYXIoeSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGRhdGU7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY3JlYXRlVVRDRGF0ZSAoeSkge1xuICAgICAgICB2YXIgZGF0ZSA9IG5ldyBEYXRlKERhdGUuVVRDLmFwcGx5KG51bGwsIGFyZ3VtZW50cykpO1xuXG4gICAgICAgIC8vIHRoZSBEYXRlLlVUQyBmdW5jdGlvbiByZW1hcHMgeWVhcnMgMC05OSB0byAxOTAwLTE5OTlcbiAgICAgICAgaWYgKHkgPCAxMDAgJiYgeSA+PSAwICYmIGlzRmluaXRlKGRhdGUuZ2V0VVRDRnVsbFllYXIoKSkpIHtcbiAgICAgICAgICAgIGRhdGUuc2V0VVRDRnVsbFllYXIoeSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGRhdGU7XG4gICAgfVxuXG4gICAgLy8gc3RhcnQtb2YtZmlyc3Qtd2VlayAtIHN0YXJ0LW9mLXllYXJcbiAgICBmdW5jdGlvbiBmaXJzdFdlZWtPZmZzZXQoeWVhciwgZG93LCBkb3kpIHtcbiAgICAgICAgdmFyIC8vIGZpcnN0LXdlZWsgZGF5IC0tIHdoaWNoIGphbnVhcnkgaXMgYWx3YXlzIGluIHRoZSBmaXJzdCB3ZWVrICg0IGZvciBpc28sIDEgZm9yIG90aGVyKVxuICAgICAgICAgICAgZndkID0gNyArIGRvdyAtIGRveSxcbiAgICAgICAgICAgIC8vIGZpcnN0LXdlZWsgZGF5IGxvY2FsIHdlZWtkYXkgLS0gd2hpY2ggbG9jYWwgd2Vla2RheSBpcyBmd2RcbiAgICAgICAgICAgIGZ3ZGx3ID0gKDcgKyBjcmVhdGVVVENEYXRlKHllYXIsIDAsIGZ3ZCkuZ2V0VVRDRGF5KCkgLSBkb3cpICUgNztcblxuICAgICAgICByZXR1cm4gLWZ3ZGx3ICsgZndkIC0gMTtcbiAgICB9XG5cbiAgICAvLyBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9JU09fd2Vla19kYXRlI0NhbGN1bGF0aW5nX2FfZGF0ZV9naXZlbl90aGVfeWVhci4yQ193ZWVrX251bWJlcl9hbmRfd2Vla2RheVxuICAgIGZ1bmN0aW9uIGRheU9mWWVhckZyb21XZWVrcyh5ZWFyLCB3ZWVrLCB3ZWVrZGF5LCBkb3csIGRveSkge1xuICAgICAgICB2YXIgbG9jYWxXZWVrZGF5ID0gKDcgKyB3ZWVrZGF5IC0gZG93KSAlIDcsXG4gICAgICAgICAgICB3ZWVrT2Zmc2V0ID0gZmlyc3RXZWVrT2Zmc2V0KHllYXIsIGRvdywgZG95KSxcbiAgICAgICAgICAgIGRheU9mWWVhciA9IDEgKyA3ICogKHdlZWsgLSAxKSArIGxvY2FsV2Vla2RheSArIHdlZWtPZmZzZXQsXG4gICAgICAgICAgICByZXNZZWFyLCByZXNEYXlPZlllYXI7XG5cbiAgICAgICAgaWYgKGRheU9mWWVhciA8PSAwKSB7XG4gICAgICAgICAgICByZXNZZWFyID0geWVhciAtIDE7XG4gICAgICAgICAgICByZXNEYXlPZlllYXIgPSBkYXlzSW5ZZWFyKHJlc1llYXIpICsgZGF5T2ZZZWFyO1xuICAgICAgICB9IGVsc2UgaWYgKGRheU9mWWVhciA+IGRheXNJblllYXIoeWVhcikpIHtcbiAgICAgICAgICAgIHJlc1llYXIgPSB5ZWFyICsgMTtcbiAgICAgICAgICAgIHJlc0RheU9mWWVhciA9IGRheU9mWWVhciAtIGRheXNJblllYXIoeWVhcik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXNZZWFyID0geWVhcjtcbiAgICAgICAgICAgIHJlc0RheU9mWWVhciA9IGRheU9mWWVhcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB5ZWFyOiByZXNZZWFyLFxuICAgICAgICAgICAgZGF5T2ZZZWFyOiByZXNEYXlPZlllYXJcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB3ZWVrT2ZZZWFyKG1vbSwgZG93LCBkb3kpIHtcbiAgICAgICAgdmFyIHdlZWtPZmZzZXQgPSBmaXJzdFdlZWtPZmZzZXQobW9tLnllYXIoKSwgZG93LCBkb3kpLFxuICAgICAgICAgICAgd2VlayA9IE1hdGguZmxvb3IoKG1vbS5kYXlPZlllYXIoKSAtIHdlZWtPZmZzZXQgLSAxKSAvIDcpICsgMSxcbiAgICAgICAgICAgIHJlc1dlZWssIHJlc1llYXI7XG5cbiAgICAgICAgaWYgKHdlZWsgPCAxKSB7XG4gICAgICAgICAgICByZXNZZWFyID0gbW9tLnllYXIoKSAtIDE7XG4gICAgICAgICAgICByZXNXZWVrID0gd2VlayArIHdlZWtzSW5ZZWFyKHJlc1llYXIsIGRvdywgZG95KTtcbiAgICAgICAgfSBlbHNlIGlmICh3ZWVrID4gd2Vla3NJblllYXIobW9tLnllYXIoKSwgZG93LCBkb3kpKSB7XG4gICAgICAgICAgICByZXNXZWVrID0gd2VlayAtIHdlZWtzSW5ZZWFyKG1vbS55ZWFyKCksIGRvdywgZG95KTtcbiAgICAgICAgICAgIHJlc1llYXIgPSBtb20ueWVhcigpICsgMTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc1llYXIgPSBtb20ueWVhcigpO1xuICAgICAgICAgICAgcmVzV2VlayA9IHdlZWs7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgd2VlazogcmVzV2VlayxcbiAgICAgICAgICAgIHllYXI6IHJlc1llYXJcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB3ZWVrc0luWWVhcih5ZWFyLCBkb3csIGRveSkge1xuICAgICAgICB2YXIgd2Vla09mZnNldCA9IGZpcnN0V2Vla09mZnNldCh5ZWFyLCBkb3csIGRveSksXG4gICAgICAgICAgICB3ZWVrT2Zmc2V0TmV4dCA9IGZpcnN0V2Vla09mZnNldCh5ZWFyICsgMSwgZG93LCBkb3kpO1xuICAgICAgICByZXR1cm4gKGRheXNJblllYXIoeWVhcikgLSB3ZWVrT2Zmc2V0ICsgd2Vla09mZnNldE5leHQpIC8gNztcbiAgICB9XG5cbiAgICAvLyBGT1JNQVRUSU5HXG5cbiAgICBhZGRGb3JtYXRUb2tlbigndycsIFsnd3cnLCAyXSwgJ3dvJywgJ3dlZWsnKTtcbiAgICBhZGRGb3JtYXRUb2tlbignVycsIFsnV1cnLCAyXSwgJ1dvJywgJ2lzb1dlZWsnKTtcblxuICAgIC8vIEFMSUFTRVNcblxuICAgIGFkZFVuaXRBbGlhcygnd2VlaycsICd3Jyk7XG4gICAgYWRkVW5pdEFsaWFzKCdpc29XZWVrJywgJ1cnKTtcblxuICAgIC8vIFBSSU9SSVRJRVNcblxuICAgIGFkZFVuaXRQcmlvcml0eSgnd2VlaycsIDUpO1xuICAgIGFkZFVuaXRQcmlvcml0eSgnaXNvV2VlaycsIDUpO1xuXG4gICAgLy8gUEFSU0lOR1xuXG4gICAgYWRkUmVnZXhUb2tlbigndycsICBtYXRjaDF0bzIpO1xuICAgIGFkZFJlZ2V4VG9rZW4oJ3d3JywgbWF0Y2gxdG8yLCBtYXRjaDIpO1xuICAgIGFkZFJlZ2V4VG9rZW4oJ1cnLCAgbWF0Y2gxdG8yKTtcbiAgICBhZGRSZWdleFRva2VuKCdXVycsIG1hdGNoMXRvMiwgbWF0Y2gyKTtcblxuICAgIGFkZFdlZWtQYXJzZVRva2VuKFsndycsICd3dycsICdXJywgJ1dXJ10sIGZ1bmN0aW9uIChpbnB1dCwgd2VlaywgY29uZmlnLCB0b2tlbikge1xuICAgICAgICB3ZWVrW3Rva2VuLnN1YnN0cigwLCAxKV0gPSB0b0ludChpbnB1dCk7XG4gICAgfSk7XG5cbiAgICAvLyBIRUxQRVJTXG5cbiAgICAvLyBMT0NBTEVTXG5cbiAgICBmdW5jdGlvbiBsb2NhbGVXZWVrIChtb20pIHtcbiAgICAgICAgcmV0dXJuIHdlZWtPZlllYXIobW9tLCB0aGlzLl93ZWVrLmRvdywgdGhpcy5fd2Vlay5kb3kpLndlZWs7XG4gICAgfVxuXG4gICAgdmFyIGRlZmF1bHRMb2NhbGVXZWVrID0ge1xuICAgICAgICBkb3cgOiAwLCAvLyBTdW5kYXkgaXMgdGhlIGZpcnN0IGRheSBvZiB0aGUgd2Vlay5cbiAgICAgICAgZG95IDogNiAgLy8gVGhlIHdlZWsgdGhhdCBjb250YWlucyBKYW4gMXN0IGlzIHRoZSBmaXJzdCB3ZWVrIG9mIHRoZSB5ZWFyLlxuICAgIH07XG5cbiAgICBmdW5jdGlvbiBsb2NhbGVGaXJzdERheU9mV2VlayAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl93ZWVrLmRvdztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsb2NhbGVGaXJzdERheU9mWWVhciAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl93ZWVrLmRveTtcbiAgICB9XG5cbiAgICAvLyBNT01FTlRTXG5cbiAgICBmdW5jdGlvbiBnZXRTZXRXZWVrIChpbnB1dCkge1xuICAgICAgICB2YXIgd2VlayA9IHRoaXMubG9jYWxlRGF0YSgpLndlZWsodGhpcyk7XG4gICAgICAgIHJldHVybiBpbnB1dCA9PSBudWxsID8gd2VlayA6IHRoaXMuYWRkKChpbnB1dCAtIHdlZWspICogNywgJ2QnKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRTZXRJU09XZWVrIChpbnB1dCkge1xuICAgICAgICB2YXIgd2VlayA9IHdlZWtPZlllYXIodGhpcywgMSwgNCkud2VlaztcbiAgICAgICAgcmV0dXJuIGlucHV0ID09IG51bGwgPyB3ZWVrIDogdGhpcy5hZGQoKGlucHV0IC0gd2VlaykgKiA3LCAnZCcpO1xuICAgIH1cblxuICAgIC8vIEZPUk1BVFRJTkdcblxuICAgIGFkZEZvcm1hdFRva2VuKCdkJywgMCwgJ2RvJywgJ2RheScpO1xuXG4gICAgYWRkRm9ybWF0VG9rZW4oJ2RkJywgMCwgMCwgZnVuY3Rpb24gKGZvcm1hdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5sb2NhbGVEYXRhKCkud2Vla2RheXNNaW4odGhpcywgZm9ybWF0KTtcbiAgICB9KTtcblxuICAgIGFkZEZvcm1hdFRva2VuKCdkZGQnLCAwLCAwLCBmdW5jdGlvbiAoZm9ybWF0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLmxvY2FsZURhdGEoKS53ZWVrZGF5c1Nob3J0KHRoaXMsIGZvcm1hdCk7XG4gICAgfSk7XG5cbiAgICBhZGRGb3JtYXRUb2tlbignZGRkZCcsIDAsIDAsIGZ1bmN0aW9uIChmb3JtYXQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubG9jYWxlRGF0YSgpLndlZWtkYXlzKHRoaXMsIGZvcm1hdCk7XG4gICAgfSk7XG5cbiAgICBhZGRGb3JtYXRUb2tlbignZScsIDAsIDAsICd3ZWVrZGF5Jyk7XG4gICAgYWRkRm9ybWF0VG9rZW4oJ0UnLCAwLCAwLCAnaXNvV2Vla2RheScpO1xuXG4gICAgLy8gQUxJQVNFU1xuXG4gICAgYWRkVW5pdEFsaWFzKCdkYXknLCAnZCcpO1xuICAgIGFkZFVuaXRBbGlhcygnd2Vla2RheScsICdlJyk7XG4gICAgYWRkVW5pdEFsaWFzKCdpc29XZWVrZGF5JywgJ0UnKTtcblxuICAgIC8vIFBSSU9SSVRZXG4gICAgYWRkVW5pdFByaW9yaXR5KCdkYXknLCAxMSk7XG4gICAgYWRkVW5pdFByaW9yaXR5KCd3ZWVrZGF5JywgMTEpO1xuICAgIGFkZFVuaXRQcmlvcml0eSgnaXNvV2Vla2RheScsIDExKTtcblxuICAgIC8vIFBBUlNJTkdcblxuICAgIGFkZFJlZ2V4VG9rZW4oJ2QnLCAgICBtYXRjaDF0bzIpO1xuICAgIGFkZFJlZ2V4VG9rZW4oJ2UnLCAgICBtYXRjaDF0bzIpO1xuICAgIGFkZFJlZ2V4VG9rZW4oJ0UnLCAgICBtYXRjaDF0bzIpO1xuICAgIGFkZFJlZ2V4VG9rZW4oJ2RkJywgICBmdW5jdGlvbiAoaXNTdHJpY3QsIGxvY2FsZSkge1xuICAgICAgICByZXR1cm4gbG9jYWxlLndlZWtkYXlzTWluUmVnZXgoaXNTdHJpY3QpO1xuICAgIH0pO1xuICAgIGFkZFJlZ2V4VG9rZW4oJ2RkZCcsICAgZnVuY3Rpb24gKGlzU3RyaWN0LCBsb2NhbGUpIHtcbiAgICAgICAgcmV0dXJuIGxvY2FsZS53ZWVrZGF5c1Nob3J0UmVnZXgoaXNTdHJpY3QpO1xuICAgIH0pO1xuICAgIGFkZFJlZ2V4VG9rZW4oJ2RkZGQnLCAgIGZ1bmN0aW9uIChpc1N0cmljdCwgbG9jYWxlKSB7XG4gICAgICAgIHJldHVybiBsb2NhbGUud2Vla2RheXNSZWdleChpc1N0cmljdCk7XG4gICAgfSk7XG5cbiAgICBhZGRXZWVrUGFyc2VUb2tlbihbJ2RkJywgJ2RkZCcsICdkZGRkJ10sIGZ1bmN0aW9uIChpbnB1dCwgd2VlaywgY29uZmlnLCB0b2tlbikge1xuICAgICAgICB2YXIgd2Vla2RheSA9IGNvbmZpZy5fbG9jYWxlLndlZWtkYXlzUGFyc2UoaW5wdXQsIHRva2VuLCBjb25maWcuX3N0cmljdCk7XG4gICAgICAgIC8vIGlmIHdlIGRpZG4ndCBnZXQgYSB3ZWVrZGF5IG5hbWUsIG1hcmsgdGhlIGRhdGUgYXMgaW52YWxpZFxuICAgICAgICBpZiAod2Vla2RheSAhPSBudWxsKSB7XG4gICAgICAgICAgICB3ZWVrLmQgPSB3ZWVrZGF5O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZ2V0UGFyc2luZ0ZsYWdzKGNvbmZpZykuaW52YWxpZFdlZWtkYXkgPSBpbnB1dDtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgYWRkV2Vla1BhcnNlVG9rZW4oWydkJywgJ2UnLCAnRSddLCBmdW5jdGlvbiAoaW5wdXQsIHdlZWssIGNvbmZpZywgdG9rZW4pIHtcbiAgICAgICAgd2Vla1t0b2tlbl0gPSB0b0ludChpbnB1dCk7XG4gICAgfSk7XG5cbiAgICAvLyBIRUxQRVJTXG5cbiAgICBmdW5jdGlvbiBwYXJzZVdlZWtkYXkoaW5wdXQsIGxvY2FsZSkge1xuICAgICAgICBpZiAodHlwZW9mIGlucHV0ICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgcmV0dXJuIGlucHV0O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFpc05hTihpbnB1dCkpIHtcbiAgICAgICAgICAgIHJldHVybiBwYXJzZUludChpbnB1dCwgMTApO1xuICAgICAgICB9XG5cbiAgICAgICAgaW5wdXQgPSBsb2NhbGUud2Vla2RheXNQYXJzZShpbnB1dCk7XG4gICAgICAgIGlmICh0eXBlb2YgaW5wdXQgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICByZXR1cm4gaW5wdXQ7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwYXJzZUlzb1dlZWtkYXkoaW5wdXQsIGxvY2FsZSkge1xuICAgICAgICBpZiAodHlwZW9mIGlucHV0ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgcmV0dXJuIGxvY2FsZS53ZWVrZGF5c1BhcnNlKGlucHV0KSAlIDcgfHwgNztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaXNOYU4oaW5wdXQpID8gbnVsbCA6IGlucHV0O1xuICAgIH1cblxuICAgIC8vIExPQ0FMRVNcblxuICAgIHZhciBkZWZhdWx0TG9jYWxlV2Vla2RheXMgPSAnU3VuZGF5X01vbmRheV9UdWVzZGF5X1dlZG5lc2RheV9UaHVyc2RheV9GcmlkYXlfU2F0dXJkYXknLnNwbGl0KCdfJyk7XG4gICAgZnVuY3Rpb24gbG9jYWxlV2Vla2RheXMgKG0sIGZvcm1hdCkge1xuICAgICAgICBpZiAoIW0pIHtcbiAgICAgICAgICAgIHJldHVybiBpc0FycmF5KHRoaXMuX3dlZWtkYXlzKSA/IHRoaXMuX3dlZWtkYXlzIDpcbiAgICAgICAgICAgICAgICB0aGlzLl93ZWVrZGF5c1snc3RhbmRhbG9uZSddO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpc0FycmF5KHRoaXMuX3dlZWtkYXlzKSA/IHRoaXMuX3dlZWtkYXlzW20uZGF5KCldIDpcbiAgICAgICAgICAgIHRoaXMuX3dlZWtkYXlzW3RoaXMuX3dlZWtkYXlzLmlzRm9ybWF0LnRlc3QoZm9ybWF0KSA/ICdmb3JtYXQnIDogJ3N0YW5kYWxvbmUnXVttLmRheSgpXTtcbiAgICB9XG5cbiAgICB2YXIgZGVmYXVsdExvY2FsZVdlZWtkYXlzU2hvcnQgPSAnU3VuX01vbl9UdWVfV2VkX1RodV9GcmlfU2F0Jy5zcGxpdCgnXycpO1xuICAgIGZ1bmN0aW9uIGxvY2FsZVdlZWtkYXlzU2hvcnQgKG0pIHtcbiAgICAgICAgcmV0dXJuIChtKSA/IHRoaXMuX3dlZWtkYXlzU2hvcnRbbS5kYXkoKV0gOiB0aGlzLl93ZWVrZGF5c1Nob3J0O1xuICAgIH1cblxuICAgIHZhciBkZWZhdWx0TG9jYWxlV2Vla2RheXNNaW4gPSAnU3VfTW9fVHVfV2VfVGhfRnJfU2EnLnNwbGl0KCdfJyk7XG4gICAgZnVuY3Rpb24gbG9jYWxlV2Vla2RheXNNaW4gKG0pIHtcbiAgICAgICAgcmV0dXJuIChtKSA/IHRoaXMuX3dlZWtkYXlzTWluW20uZGF5KCldIDogdGhpcy5fd2Vla2RheXNNaW47XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaGFuZGxlU3RyaWN0UGFyc2UkMSh3ZWVrZGF5TmFtZSwgZm9ybWF0LCBzdHJpY3QpIHtcbiAgICAgICAgdmFyIGksIGlpLCBtb20sIGxsYyA9IHdlZWtkYXlOYW1lLnRvTG9jYWxlTG93ZXJDYXNlKCk7XG4gICAgICAgIGlmICghdGhpcy5fd2Vla2RheXNQYXJzZSkge1xuICAgICAgICAgICAgdGhpcy5fd2Vla2RheXNQYXJzZSA9IFtdO1xuICAgICAgICAgICAgdGhpcy5fc2hvcnRXZWVrZGF5c1BhcnNlID0gW107XG4gICAgICAgICAgICB0aGlzLl9taW5XZWVrZGF5c1BhcnNlID0gW107XG5cbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCA3OyArK2kpIHtcbiAgICAgICAgICAgICAgICBtb20gPSBjcmVhdGVVVEMoWzIwMDAsIDFdKS5kYXkoaSk7XG4gICAgICAgICAgICAgICAgdGhpcy5fbWluV2Vla2RheXNQYXJzZVtpXSA9IHRoaXMud2Vla2RheXNNaW4obW9tLCAnJykudG9Mb2NhbGVMb3dlckNhc2UoKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9zaG9ydFdlZWtkYXlzUGFyc2VbaV0gPSB0aGlzLndlZWtkYXlzU2hvcnQobW9tLCAnJykudG9Mb2NhbGVMb3dlckNhc2UoKTtcbiAgICAgICAgICAgICAgICB0aGlzLl93ZWVrZGF5c1BhcnNlW2ldID0gdGhpcy53ZWVrZGF5cyhtb20sICcnKS50b0xvY2FsZUxvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHN0cmljdCkge1xuICAgICAgICAgICAgaWYgKGZvcm1hdCA9PT0gJ2RkZGQnKSB7XG4gICAgICAgICAgICAgICAgaWkgPSBpbmRleE9mLmNhbGwodGhpcy5fd2Vla2RheXNQYXJzZSwgbGxjKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gaWkgIT09IC0xID8gaWkgOiBudWxsO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChmb3JtYXQgPT09ICdkZGQnKSB7XG4gICAgICAgICAgICAgICAgaWkgPSBpbmRleE9mLmNhbGwodGhpcy5fc2hvcnRXZWVrZGF5c1BhcnNlLCBsbGMpO1xuICAgICAgICAgICAgICAgIHJldHVybiBpaSAhPT0gLTEgPyBpaSA6IG51bGw7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlpID0gaW5kZXhPZi5jYWxsKHRoaXMuX21pbldlZWtkYXlzUGFyc2UsIGxsYyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGlpICE9PSAtMSA/IGlpIDogbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChmb3JtYXQgPT09ICdkZGRkJykge1xuICAgICAgICAgICAgICAgIGlpID0gaW5kZXhPZi5jYWxsKHRoaXMuX3dlZWtkYXlzUGFyc2UsIGxsYyk7XG4gICAgICAgICAgICAgICAgaWYgKGlpICE9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaWk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlpID0gaW5kZXhPZi5jYWxsKHRoaXMuX3Nob3J0V2Vla2RheXNQYXJzZSwgbGxjKTtcbiAgICAgICAgICAgICAgICBpZiAoaWkgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBpaTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWkgPSBpbmRleE9mLmNhbGwodGhpcy5fbWluV2Vla2RheXNQYXJzZSwgbGxjKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gaWkgIT09IC0xID8gaWkgOiBudWxsO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChmb3JtYXQgPT09ICdkZGQnKSB7XG4gICAgICAgICAgICAgICAgaWkgPSBpbmRleE9mLmNhbGwodGhpcy5fc2hvcnRXZWVrZGF5c1BhcnNlLCBsbGMpO1xuICAgICAgICAgICAgICAgIGlmIChpaSAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGlpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpaSA9IGluZGV4T2YuY2FsbCh0aGlzLl93ZWVrZGF5c1BhcnNlLCBsbGMpO1xuICAgICAgICAgICAgICAgIGlmIChpaSAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGlpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpaSA9IGluZGV4T2YuY2FsbCh0aGlzLl9taW5XZWVrZGF5c1BhcnNlLCBsbGMpO1xuICAgICAgICAgICAgICAgIHJldHVybiBpaSAhPT0gLTEgPyBpaSA6IG51bGw7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlpID0gaW5kZXhPZi5jYWxsKHRoaXMuX21pbldlZWtkYXlzUGFyc2UsIGxsYyk7XG4gICAgICAgICAgICAgICAgaWYgKGlpICE9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaWk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlpID0gaW5kZXhPZi5jYWxsKHRoaXMuX3dlZWtkYXlzUGFyc2UsIGxsYyk7XG4gICAgICAgICAgICAgICAgaWYgKGlpICE9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaWk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlpID0gaW5kZXhPZi5jYWxsKHRoaXMuX3Nob3J0V2Vla2RheXNQYXJzZSwgbGxjKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gaWkgIT09IC0xID8gaWkgOiBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbG9jYWxlV2Vla2RheXNQYXJzZSAod2Vla2RheU5hbWUsIGZvcm1hdCwgc3RyaWN0KSB7XG4gICAgICAgIHZhciBpLCBtb20sIHJlZ2V4O1xuXG4gICAgICAgIGlmICh0aGlzLl93ZWVrZGF5c1BhcnNlRXhhY3QpIHtcbiAgICAgICAgICAgIHJldHVybiBoYW5kbGVTdHJpY3RQYXJzZSQxLmNhbGwodGhpcywgd2Vla2RheU5hbWUsIGZvcm1hdCwgc3RyaWN0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdGhpcy5fd2Vla2RheXNQYXJzZSkge1xuICAgICAgICAgICAgdGhpcy5fd2Vla2RheXNQYXJzZSA9IFtdO1xuICAgICAgICAgICAgdGhpcy5fbWluV2Vla2RheXNQYXJzZSA9IFtdO1xuICAgICAgICAgICAgdGhpcy5fc2hvcnRXZWVrZGF5c1BhcnNlID0gW107XG4gICAgICAgICAgICB0aGlzLl9mdWxsV2Vla2RheXNQYXJzZSA9IFtdO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChpID0gMDsgaSA8IDc7IGkrKykge1xuICAgICAgICAgICAgLy8gbWFrZSB0aGUgcmVnZXggaWYgd2UgZG9uJ3QgaGF2ZSBpdCBhbHJlYWR5XG5cbiAgICAgICAgICAgIG1vbSA9IGNyZWF0ZVVUQyhbMjAwMCwgMV0pLmRheShpKTtcbiAgICAgICAgICAgIGlmIChzdHJpY3QgJiYgIXRoaXMuX2Z1bGxXZWVrZGF5c1BhcnNlW2ldKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fZnVsbFdlZWtkYXlzUGFyc2VbaV0gPSBuZXcgUmVnRXhwKCdeJyArIHRoaXMud2Vla2RheXMobW9tLCAnJykucmVwbGFjZSgnLicsICdcXFxcLj8nKSArICckJywgJ2knKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9zaG9ydFdlZWtkYXlzUGFyc2VbaV0gPSBuZXcgUmVnRXhwKCdeJyArIHRoaXMud2Vla2RheXNTaG9ydChtb20sICcnKS5yZXBsYWNlKCcuJywgJ1xcXFwuPycpICsgJyQnLCAnaScpO1xuICAgICAgICAgICAgICAgIHRoaXMuX21pbldlZWtkYXlzUGFyc2VbaV0gPSBuZXcgUmVnRXhwKCdeJyArIHRoaXMud2Vla2RheXNNaW4obW9tLCAnJykucmVwbGFjZSgnLicsICdcXFxcLj8nKSArICckJywgJ2knKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghdGhpcy5fd2Vla2RheXNQYXJzZVtpXSkge1xuICAgICAgICAgICAgICAgIHJlZ2V4ID0gJ14nICsgdGhpcy53ZWVrZGF5cyhtb20sICcnKSArICd8XicgKyB0aGlzLndlZWtkYXlzU2hvcnQobW9tLCAnJykgKyAnfF4nICsgdGhpcy53ZWVrZGF5c01pbihtb20sICcnKTtcbiAgICAgICAgICAgICAgICB0aGlzLl93ZWVrZGF5c1BhcnNlW2ldID0gbmV3IFJlZ0V4cChyZWdleC5yZXBsYWNlKCcuJywgJycpLCAnaScpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gdGVzdCB0aGUgcmVnZXhcbiAgICAgICAgICAgIGlmIChzdHJpY3QgJiYgZm9ybWF0ID09PSAnZGRkZCcgJiYgdGhpcy5fZnVsbFdlZWtkYXlzUGFyc2VbaV0udGVzdCh3ZWVrZGF5TmFtZSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoc3RyaWN0ICYmIGZvcm1hdCA9PT0gJ2RkZCcgJiYgdGhpcy5fc2hvcnRXZWVrZGF5c1BhcnNlW2ldLnRlc3Qod2Vla2RheU5hbWUpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHN0cmljdCAmJiBmb3JtYXQgPT09ICdkZCcgJiYgdGhpcy5fbWluV2Vla2RheXNQYXJzZVtpXS50ZXN0KHdlZWtkYXlOYW1lKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICghc3RyaWN0ICYmIHRoaXMuX3dlZWtkYXlzUGFyc2VbaV0udGVzdCh3ZWVrZGF5TmFtZSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIE1PTUVOVFNcblxuICAgIGZ1bmN0aW9uIGdldFNldERheU9mV2VlayAoaW5wdXQpIHtcbiAgICAgICAgaWYgKCF0aGlzLmlzVmFsaWQoKSkge1xuICAgICAgICAgICAgcmV0dXJuIGlucHV0ICE9IG51bGwgPyB0aGlzIDogTmFOO1xuICAgICAgICB9XG4gICAgICAgIHZhciBkYXkgPSB0aGlzLl9pc1VUQyA/IHRoaXMuX2QuZ2V0VVRDRGF5KCkgOiB0aGlzLl9kLmdldERheSgpO1xuICAgICAgICBpZiAoaW5wdXQgIT0gbnVsbCkge1xuICAgICAgICAgICAgaW5wdXQgPSBwYXJzZVdlZWtkYXkoaW5wdXQsIHRoaXMubG9jYWxlRGF0YSgpKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmFkZChpbnB1dCAtIGRheSwgJ2QnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBkYXk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRTZXRMb2NhbGVEYXlPZldlZWsgKGlucHV0KSB7XG4gICAgICAgIGlmICghdGhpcy5pc1ZhbGlkKCkpIHtcbiAgICAgICAgICAgIHJldHVybiBpbnB1dCAhPSBudWxsID8gdGhpcyA6IE5hTjtcbiAgICAgICAgfVxuICAgICAgICB2YXIgd2Vla2RheSA9ICh0aGlzLmRheSgpICsgNyAtIHRoaXMubG9jYWxlRGF0YSgpLl93ZWVrLmRvdykgJSA3O1xuICAgICAgICByZXR1cm4gaW5wdXQgPT0gbnVsbCA/IHdlZWtkYXkgOiB0aGlzLmFkZChpbnB1dCAtIHdlZWtkYXksICdkJyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0U2V0SVNPRGF5T2ZXZWVrIChpbnB1dCkge1xuICAgICAgICBpZiAoIXRoaXMuaXNWYWxpZCgpKSB7XG4gICAgICAgICAgICByZXR1cm4gaW5wdXQgIT0gbnVsbCA/IHRoaXMgOiBOYU47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBiZWhhdmVzIHRoZSBzYW1lIGFzIG1vbWVudCNkYXkgZXhjZXB0XG4gICAgICAgIC8vIGFzIGEgZ2V0dGVyLCByZXR1cm5zIDcgaW5zdGVhZCBvZiAwICgxLTcgcmFuZ2UgaW5zdGVhZCBvZiAwLTYpXG4gICAgICAgIC8vIGFzIGEgc2V0dGVyLCBzdW5kYXkgc2hvdWxkIGJlbG9uZyB0byB0aGUgcHJldmlvdXMgd2Vlay5cblxuICAgICAgICBpZiAoaW5wdXQgIT0gbnVsbCkge1xuICAgICAgICAgICAgdmFyIHdlZWtkYXkgPSBwYXJzZUlzb1dlZWtkYXkoaW5wdXQsIHRoaXMubG9jYWxlRGF0YSgpKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRheSh0aGlzLmRheSgpICUgNyA/IHdlZWtkYXkgOiB3ZWVrZGF5IC0gNyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kYXkoKSB8fCA3O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdmFyIGRlZmF1bHRXZWVrZGF5c1JlZ2V4ID0gbWF0Y2hXb3JkO1xuICAgIGZ1bmN0aW9uIHdlZWtkYXlzUmVnZXggKGlzU3RyaWN0KSB7XG4gICAgICAgIGlmICh0aGlzLl93ZWVrZGF5c1BhcnNlRXhhY3QpIHtcbiAgICAgICAgICAgIGlmICghaGFzT3duUHJvcCh0aGlzLCAnX3dlZWtkYXlzUmVnZXgnKSkge1xuICAgICAgICAgICAgICAgIGNvbXB1dGVXZWVrZGF5c1BhcnNlLmNhbGwodGhpcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaXNTdHJpY3QpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fd2Vla2RheXNTdHJpY3RSZWdleDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3dlZWtkYXlzUmVnZXg7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoIWhhc093blByb3AodGhpcywgJ193ZWVrZGF5c1JlZ2V4JykpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl93ZWVrZGF5c1JlZ2V4ID0gZGVmYXVsdFdlZWtkYXlzUmVnZXg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fd2Vla2RheXNTdHJpY3RSZWdleCAmJiBpc1N0cmljdCA/XG4gICAgICAgICAgICAgICAgdGhpcy5fd2Vla2RheXNTdHJpY3RSZWdleCA6IHRoaXMuX3dlZWtkYXlzUmVnZXg7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgZGVmYXVsdFdlZWtkYXlzU2hvcnRSZWdleCA9IG1hdGNoV29yZDtcbiAgICBmdW5jdGlvbiB3ZWVrZGF5c1Nob3J0UmVnZXggKGlzU3RyaWN0KSB7XG4gICAgICAgIGlmICh0aGlzLl93ZWVrZGF5c1BhcnNlRXhhY3QpIHtcbiAgICAgICAgICAgIGlmICghaGFzT3duUHJvcCh0aGlzLCAnX3dlZWtkYXlzUmVnZXgnKSkge1xuICAgICAgICAgICAgICAgIGNvbXB1dGVXZWVrZGF5c1BhcnNlLmNhbGwodGhpcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaXNTdHJpY3QpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fd2Vla2RheXNTaG9ydFN0cmljdFJlZ2V4O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fd2Vla2RheXNTaG9ydFJlZ2V4O1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKCFoYXNPd25Qcm9wKHRoaXMsICdfd2Vla2RheXNTaG9ydFJlZ2V4JykpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl93ZWVrZGF5c1Nob3J0UmVnZXggPSBkZWZhdWx0V2Vla2RheXNTaG9ydFJlZ2V4O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3dlZWtkYXlzU2hvcnRTdHJpY3RSZWdleCAmJiBpc1N0cmljdCA/XG4gICAgICAgICAgICAgICAgdGhpcy5fd2Vla2RheXNTaG9ydFN0cmljdFJlZ2V4IDogdGhpcy5fd2Vla2RheXNTaG9ydFJlZ2V4O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdmFyIGRlZmF1bHRXZWVrZGF5c01pblJlZ2V4ID0gbWF0Y2hXb3JkO1xuICAgIGZ1bmN0aW9uIHdlZWtkYXlzTWluUmVnZXggKGlzU3RyaWN0KSB7XG4gICAgICAgIGlmICh0aGlzLl93ZWVrZGF5c1BhcnNlRXhhY3QpIHtcbiAgICAgICAgICAgIGlmICghaGFzT3duUHJvcCh0aGlzLCAnX3dlZWtkYXlzUmVnZXgnKSkge1xuICAgICAgICAgICAgICAgIGNvbXB1dGVXZWVrZGF5c1BhcnNlLmNhbGwodGhpcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaXNTdHJpY3QpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fd2Vla2RheXNNaW5TdHJpY3RSZWdleDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3dlZWtkYXlzTWluUmVnZXg7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoIWhhc093blByb3AodGhpcywgJ193ZWVrZGF5c01pblJlZ2V4JykpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl93ZWVrZGF5c01pblJlZ2V4ID0gZGVmYXVsdFdlZWtkYXlzTWluUmVnZXg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fd2Vla2RheXNNaW5TdHJpY3RSZWdleCAmJiBpc1N0cmljdCA/XG4gICAgICAgICAgICAgICAgdGhpcy5fd2Vla2RheXNNaW5TdHJpY3RSZWdleCA6IHRoaXMuX3dlZWtkYXlzTWluUmVnZXg7XG4gICAgICAgIH1cbiAgICB9XG5cblxuICAgIGZ1bmN0aW9uIGNvbXB1dGVXZWVrZGF5c1BhcnNlICgpIHtcbiAgICAgICAgZnVuY3Rpb24gY21wTGVuUmV2KGEsIGIpIHtcbiAgICAgICAgICAgIHJldHVybiBiLmxlbmd0aCAtIGEubGVuZ3RoO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIG1pblBpZWNlcyA9IFtdLCBzaG9ydFBpZWNlcyA9IFtdLCBsb25nUGllY2VzID0gW10sIG1peGVkUGllY2VzID0gW10sXG4gICAgICAgICAgICBpLCBtb20sIG1pbnAsIHNob3J0cCwgbG9uZ3A7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCA3OyBpKyspIHtcbiAgICAgICAgICAgIC8vIG1ha2UgdGhlIHJlZ2V4IGlmIHdlIGRvbid0IGhhdmUgaXQgYWxyZWFkeVxuICAgICAgICAgICAgbW9tID0gY3JlYXRlVVRDKFsyMDAwLCAxXSkuZGF5KGkpO1xuICAgICAgICAgICAgbWlucCA9IHRoaXMud2Vla2RheXNNaW4obW9tLCAnJyk7XG4gICAgICAgICAgICBzaG9ydHAgPSB0aGlzLndlZWtkYXlzU2hvcnQobW9tLCAnJyk7XG4gICAgICAgICAgICBsb25ncCA9IHRoaXMud2Vla2RheXMobW9tLCAnJyk7XG4gICAgICAgICAgICBtaW5QaWVjZXMucHVzaChtaW5wKTtcbiAgICAgICAgICAgIHNob3J0UGllY2VzLnB1c2goc2hvcnRwKTtcbiAgICAgICAgICAgIGxvbmdQaWVjZXMucHVzaChsb25ncCk7XG4gICAgICAgICAgICBtaXhlZFBpZWNlcy5wdXNoKG1pbnApO1xuICAgICAgICAgICAgbWl4ZWRQaWVjZXMucHVzaChzaG9ydHApO1xuICAgICAgICAgICAgbWl4ZWRQaWVjZXMucHVzaChsb25ncCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gU29ydGluZyBtYWtlcyBzdXJlIGlmIG9uZSB3ZWVrZGF5IChvciBhYmJyKSBpcyBhIHByZWZpeCBvZiBhbm90aGVyIGl0XG4gICAgICAgIC8vIHdpbGwgbWF0Y2ggdGhlIGxvbmdlciBwaWVjZS5cbiAgICAgICAgbWluUGllY2VzLnNvcnQoY21wTGVuUmV2KTtcbiAgICAgICAgc2hvcnRQaWVjZXMuc29ydChjbXBMZW5SZXYpO1xuICAgICAgICBsb25nUGllY2VzLnNvcnQoY21wTGVuUmV2KTtcbiAgICAgICAgbWl4ZWRQaWVjZXMuc29ydChjbXBMZW5SZXYpO1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgNzsgaSsrKSB7XG4gICAgICAgICAgICBzaG9ydFBpZWNlc1tpXSA9IHJlZ2V4RXNjYXBlKHNob3J0UGllY2VzW2ldKTtcbiAgICAgICAgICAgIGxvbmdQaWVjZXNbaV0gPSByZWdleEVzY2FwZShsb25nUGllY2VzW2ldKTtcbiAgICAgICAgICAgIG1peGVkUGllY2VzW2ldID0gcmVnZXhFc2NhcGUobWl4ZWRQaWVjZXNbaV0pO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fd2Vla2RheXNSZWdleCA9IG5ldyBSZWdFeHAoJ14oJyArIG1peGVkUGllY2VzLmpvaW4oJ3wnKSArICcpJywgJ2knKTtcbiAgICAgICAgdGhpcy5fd2Vla2RheXNTaG9ydFJlZ2V4ID0gdGhpcy5fd2Vla2RheXNSZWdleDtcbiAgICAgICAgdGhpcy5fd2Vla2RheXNNaW5SZWdleCA9IHRoaXMuX3dlZWtkYXlzUmVnZXg7XG5cbiAgICAgICAgdGhpcy5fd2Vla2RheXNTdHJpY3RSZWdleCA9IG5ldyBSZWdFeHAoJ14oJyArIGxvbmdQaWVjZXMuam9pbignfCcpICsgJyknLCAnaScpO1xuICAgICAgICB0aGlzLl93ZWVrZGF5c1Nob3J0U3RyaWN0UmVnZXggPSBuZXcgUmVnRXhwKCdeKCcgKyBzaG9ydFBpZWNlcy5qb2luKCd8JykgKyAnKScsICdpJyk7XG4gICAgICAgIHRoaXMuX3dlZWtkYXlzTWluU3RyaWN0UmVnZXggPSBuZXcgUmVnRXhwKCdeKCcgKyBtaW5QaWVjZXMuam9pbignfCcpICsgJyknLCAnaScpO1xuICAgIH1cblxuICAgIC8vIEZPUk1BVFRJTkdcblxuICAgIGZ1bmN0aW9uIGhGb3JtYXQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmhvdXJzKCkgJSAxMiB8fCAxMjtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBrRm9ybWF0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5ob3VycygpIHx8IDI0O1xuICAgIH1cblxuICAgIGFkZEZvcm1hdFRva2VuKCdIJywgWydISCcsIDJdLCAwLCAnaG91cicpO1xuICAgIGFkZEZvcm1hdFRva2VuKCdoJywgWydoaCcsIDJdLCAwLCBoRm9ybWF0KTtcbiAgICBhZGRGb3JtYXRUb2tlbignaycsIFsna2snLCAyXSwgMCwga0Zvcm1hdCk7XG5cbiAgICBhZGRGb3JtYXRUb2tlbignaG1tJywgMCwgMCwgZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gJycgKyBoRm9ybWF0LmFwcGx5KHRoaXMpICsgemVyb0ZpbGwodGhpcy5taW51dGVzKCksIDIpO1xuICAgIH0pO1xuXG4gICAgYWRkRm9ybWF0VG9rZW4oJ2htbXNzJywgMCwgMCwgZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gJycgKyBoRm9ybWF0LmFwcGx5KHRoaXMpICsgemVyb0ZpbGwodGhpcy5taW51dGVzKCksIDIpICtcbiAgICAgICAgICAgIHplcm9GaWxsKHRoaXMuc2Vjb25kcygpLCAyKTtcbiAgICB9KTtcblxuICAgIGFkZEZvcm1hdFRva2VuKCdIbW0nLCAwLCAwLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiAnJyArIHRoaXMuaG91cnMoKSArIHplcm9GaWxsKHRoaXMubWludXRlcygpLCAyKTtcbiAgICB9KTtcblxuICAgIGFkZEZvcm1hdFRva2VuKCdIbW1zcycsIDAsIDAsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuICcnICsgdGhpcy5ob3VycygpICsgemVyb0ZpbGwodGhpcy5taW51dGVzKCksIDIpICtcbiAgICAgICAgICAgIHplcm9GaWxsKHRoaXMuc2Vjb25kcygpLCAyKTtcbiAgICB9KTtcblxuICAgIGZ1bmN0aW9uIG1lcmlkaWVtICh0b2tlbiwgbG93ZXJjYXNlKSB7XG4gICAgICAgIGFkZEZvcm1hdFRva2VuKHRva2VuLCAwLCAwLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5sb2NhbGVEYXRhKCkubWVyaWRpZW0odGhpcy5ob3VycygpLCB0aGlzLm1pbnV0ZXMoKSwgbG93ZXJjYXNlKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgbWVyaWRpZW0oJ2EnLCB0cnVlKTtcbiAgICBtZXJpZGllbSgnQScsIGZhbHNlKTtcblxuICAgIC8vIEFMSUFTRVNcblxuICAgIGFkZFVuaXRBbGlhcygnaG91cicsICdoJyk7XG5cbiAgICAvLyBQUklPUklUWVxuICAgIGFkZFVuaXRQcmlvcml0eSgnaG91cicsIDEzKTtcblxuICAgIC8vIFBBUlNJTkdcblxuICAgIGZ1bmN0aW9uIG1hdGNoTWVyaWRpZW0gKGlzU3RyaWN0LCBsb2NhbGUpIHtcbiAgICAgICAgcmV0dXJuIGxvY2FsZS5fbWVyaWRpZW1QYXJzZTtcbiAgICB9XG5cbiAgICBhZGRSZWdleFRva2VuKCdhJywgIG1hdGNoTWVyaWRpZW0pO1xuICAgIGFkZFJlZ2V4VG9rZW4oJ0EnLCAgbWF0Y2hNZXJpZGllbSk7XG4gICAgYWRkUmVnZXhUb2tlbignSCcsICBtYXRjaDF0bzIpO1xuICAgIGFkZFJlZ2V4VG9rZW4oJ2gnLCAgbWF0Y2gxdG8yKTtcbiAgICBhZGRSZWdleFRva2VuKCdrJywgIG1hdGNoMXRvMik7XG4gICAgYWRkUmVnZXhUb2tlbignSEgnLCBtYXRjaDF0bzIsIG1hdGNoMik7XG4gICAgYWRkUmVnZXhUb2tlbignaGgnLCBtYXRjaDF0bzIsIG1hdGNoMik7XG4gICAgYWRkUmVnZXhUb2tlbigna2snLCBtYXRjaDF0bzIsIG1hdGNoMik7XG5cbiAgICBhZGRSZWdleFRva2VuKCdobW0nLCBtYXRjaDN0bzQpO1xuICAgIGFkZFJlZ2V4VG9rZW4oJ2htbXNzJywgbWF0Y2g1dG82KTtcbiAgICBhZGRSZWdleFRva2VuKCdIbW0nLCBtYXRjaDN0bzQpO1xuICAgIGFkZFJlZ2V4VG9rZW4oJ0htbXNzJywgbWF0Y2g1dG82KTtcblxuICAgIGFkZFBhcnNlVG9rZW4oWydIJywgJ0hIJ10sIEhPVVIpO1xuICAgIGFkZFBhcnNlVG9rZW4oWydrJywgJ2trJ10sIGZ1bmN0aW9uIChpbnB1dCwgYXJyYXksIGNvbmZpZykge1xuICAgICAgICB2YXIga0lucHV0ID0gdG9JbnQoaW5wdXQpO1xuICAgICAgICBhcnJheVtIT1VSXSA9IGtJbnB1dCA9PT0gMjQgPyAwIDoga0lucHV0O1xuICAgIH0pO1xuICAgIGFkZFBhcnNlVG9rZW4oWydhJywgJ0EnXSwgZnVuY3Rpb24gKGlucHV0LCBhcnJheSwgY29uZmlnKSB7XG4gICAgICAgIGNvbmZpZy5faXNQbSA9IGNvbmZpZy5fbG9jYWxlLmlzUE0oaW5wdXQpO1xuICAgICAgICBjb25maWcuX21lcmlkaWVtID0gaW5wdXQ7XG4gICAgfSk7XG4gICAgYWRkUGFyc2VUb2tlbihbJ2gnLCAnaGgnXSwgZnVuY3Rpb24gKGlucHV0LCBhcnJheSwgY29uZmlnKSB7XG4gICAgICAgIGFycmF5W0hPVVJdID0gdG9JbnQoaW5wdXQpO1xuICAgICAgICBnZXRQYXJzaW5nRmxhZ3MoY29uZmlnKS5iaWdIb3VyID0gdHJ1ZTtcbiAgICB9KTtcbiAgICBhZGRQYXJzZVRva2VuKCdobW0nLCBmdW5jdGlvbiAoaW5wdXQsIGFycmF5LCBjb25maWcpIHtcbiAgICAgICAgdmFyIHBvcyA9IGlucHV0Lmxlbmd0aCAtIDI7XG4gICAgICAgIGFycmF5W0hPVVJdID0gdG9JbnQoaW5wdXQuc3Vic3RyKDAsIHBvcykpO1xuICAgICAgICBhcnJheVtNSU5VVEVdID0gdG9JbnQoaW5wdXQuc3Vic3RyKHBvcykpO1xuICAgICAgICBnZXRQYXJzaW5nRmxhZ3MoY29uZmlnKS5iaWdIb3VyID0gdHJ1ZTtcbiAgICB9KTtcbiAgICBhZGRQYXJzZVRva2VuKCdobW1zcycsIGZ1bmN0aW9uIChpbnB1dCwgYXJyYXksIGNvbmZpZykge1xuICAgICAgICB2YXIgcG9zMSA9IGlucHV0Lmxlbmd0aCAtIDQ7XG4gICAgICAgIHZhciBwb3MyID0gaW5wdXQubGVuZ3RoIC0gMjtcbiAgICAgICAgYXJyYXlbSE9VUl0gPSB0b0ludChpbnB1dC5zdWJzdHIoMCwgcG9zMSkpO1xuICAgICAgICBhcnJheVtNSU5VVEVdID0gdG9JbnQoaW5wdXQuc3Vic3RyKHBvczEsIDIpKTtcbiAgICAgICAgYXJyYXlbU0VDT05EXSA9IHRvSW50KGlucHV0LnN1YnN0cihwb3MyKSk7XG4gICAgICAgIGdldFBhcnNpbmdGbGFncyhjb25maWcpLmJpZ0hvdXIgPSB0cnVlO1xuICAgIH0pO1xuICAgIGFkZFBhcnNlVG9rZW4oJ0htbScsIGZ1bmN0aW9uIChpbnB1dCwgYXJyYXksIGNvbmZpZykge1xuICAgICAgICB2YXIgcG9zID0gaW5wdXQubGVuZ3RoIC0gMjtcbiAgICAgICAgYXJyYXlbSE9VUl0gPSB0b0ludChpbnB1dC5zdWJzdHIoMCwgcG9zKSk7XG4gICAgICAgIGFycmF5W01JTlVURV0gPSB0b0ludChpbnB1dC5zdWJzdHIocG9zKSk7XG4gICAgfSk7XG4gICAgYWRkUGFyc2VUb2tlbignSG1tc3MnLCBmdW5jdGlvbiAoaW5wdXQsIGFycmF5LCBjb25maWcpIHtcbiAgICAgICAgdmFyIHBvczEgPSBpbnB1dC5sZW5ndGggLSA0O1xuICAgICAgICB2YXIgcG9zMiA9IGlucHV0Lmxlbmd0aCAtIDI7XG4gICAgICAgIGFycmF5W0hPVVJdID0gdG9JbnQoaW5wdXQuc3Vic3RyKDAsIHBvczEpKTtcbiAgICAgICAgYXJyYXlbTUlOVVRFXSA9IHRvSW50KGlucHV0LnN1YnN0cihwb3MxLCAyKSk7XG4gICAgICAgIGFycmF5W1NFQ09ORF0gPSB0b0ludChpbnB1dC5zdWJzdHIocG9zMikpO1xuICAgIH0pO1xuXG4gICAgLy8gTE9DQUxFU1xuXG4gICAgZnVuY3Rpb24gbG9jYWxlSXNQTSAoaW5wdXQpIHtcbiAgICAgICAgLy8gSUU4IFF1aXJrcyBNb2RlICYgSUU3IFN0YW5kYXJkcyBNb2RlIGRvIG5vdCBhbGxvdyBhY2Nlc3Npbmcgc3RyaW5ncyBsaWtlIGFycmF5c1xuICAgICAgICAvLyBVc2luZyBjaGFyQXQgc2hvdWxkIGJlIG1vcmUgY29tcGF0aWJsZS5cbiAgICAgICAgcmV0dXJuICgoaW5wdXQgKyAnJykudG9Mb3dlckNhc2UoKS5jaGFyQXQoMCkgPT09ICdwJyk7XG4gICAgfVxuXG4gICAgdmFyIGRlZmF1bHRMb2NhbGVNZXJpZGllbVBhcnNlID0gL1thcF1cXC4/bT9cXC4/L2k7XG4gICAgZnVuY3Rpb24gbG9jYWxlTWVyaWRpZW0gKGhvdXJzLCBtaW51dGVzLCBpc0xvd2VyKSB7XG4gICAgICAgIGlmIChob3VycyA+IDExKSB7XG4gICAgICAgICAgICByZXR1cm4gaXNMb3dlciA/ICdwbScgOiAnUE0nO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGlzTG93ZXIgPyAnYW0nIDogJ0FNJztcbiAgICAgICAgfVxuICAgIH1cblxuXG4gICAgLy8gTU9NRU5UU1xuXG4gICAgLy8gU2V0dGluZyB0aGUgaG91ciBzaG91bGQga2VlcCB0aGUgdGltZSwgYmVjYXVzZSB0aGUgdXNlciBleHBsaWNpdGx5XG4gICAgLy8gc3BlY2lmaWVkIHdoaWNoIGhvdXIgdGhleSB3YW50LiBTbyB0cnlpbmcgdG8gbWFpbnRhaW4gdGhlIHNhbWUgaG91ciAoaW5cbiAgICAvLyBhIG5ldyB0aW1lem9uZSkgbWFrZXMgc2Vuc2UuIEFkZGluZy9zdWJ0cmFjdGluZyBob3VycyBkb2VzIG5vdCBmb2xsb3dcbiAgICAvLyB0aGlzIHJ1bGUuXG4gICAgdmFyIGdldFNldEhvdXIgPSBtYWtlR2V0U2V0KCdIb3VycycsIHRydWUpO1xuXG4gICAgdmFyIGJhc2VDb25maWcgPSB7XG4gICAgICAgIGNhbGVuZGFyOiBkZWZhdWx0Q2FsZW5kYXIsXG4gICAgICAgIGxvbmdEYXRlRm9ybWF0OiBkZWZhdWx0TG9uZ0RhdGVGb3JtYXQsXG4gICAgICAgIGludmFsaWREYXRlOiBkZWZhdWx0SW52YWxpZERhdGUsXG4gICAgICAgIG9yZGluYWw6IGRlZmF1bHRPcmRpbmFsLFxuICAgICAgICBkYXlPZk1vbnRoT3JkaW5hbFBhcnNlOiBkZWZhdWx0RGF5T2ZNb250aE9yZGluYWxQYXJzZSxcbiAgICAgICAgcmVsYXRpdmVUaW1lOiBkZWZhdWx0UmVsYXRpdmVUaW1lLFxuXG4gICAgICAgIG1vbnRoczogZGVmYXVsdExvY2FsZU1vbnRocyxcbiAgICAgICAgbW9udGhzU2hvcnQ6IGRlZmF1bHRMb2NhbGVNb250aHNTaG9ydCxcblxuICAgICAgICB3ZWVrOiBkZWZhdWx0TG9jYWxlV2VlayxcblxuICAgICAgICB3ZWVrZGF5czogZGVmYXVsdExvY2FsZVdlZWtkYXlzLFxuICAgICAgICB3ZWVrZGF5c01pbjogZGVmYXVsdExvY2FsZVdlZWtkYXlzTWluLFxuICAgICAgICB3ZWVrZGF5c1Nob3J0OiBkZWZhdWx0TG9jYWxlV2Vla2RheXNTaG9ydCxcblxuICAgICAgICBtZXJpZGllbVBhcnNlOiBkZWZhdWx0TG9jYWxlTWVyaWRpZW1QYXJzZVxuICAgIH07XG5cbiAgICAvLyBpbnRlcm5hbCBzdG9yYWdlIGZvciBsb2NhbGUgY29uZmlnIGZpbGVzXG4gICAgdmFyIGxvY2FsZXMgPSB7fTtcbiAgICB2YXIgbG9jYWxlRmFtaWxpZXMgPSB7fTtcbiAgICB2YXIgZ2xvYmFsTG9jYWxlO1xuXG4gICAgZnVuY3Rpb24gbm9ybWFsaXplTG9jYWxlKGtleSkge1xuICAgICAgICByZXR1cm4ga2V5ID8ga2V5LnRvTG93ZXJDYXNlKCkucmVwbGFjZSgnXycsICctJykgOiBrZXk7XG4gICAgfVxuXG4gICAgLy8gcGljayB0aGUgbG9jYWxlIGZyb20gdGhlIGFycmF5XG4gICAgLy8gdHJ5IFsnZW4tYXUnLCAnZW4tZ2InXSBhcyAnZW4tYXUnLCAnZW4tZ2InLCAnZW4nLCBhcyBpbiBtb3ZlIHRocm91Z2ggdGhlIGxpc3QgdHJ5aW5nIGVhY2hcbiAgICAvLyBzdWJzdHJpbmcgZnJvbSBtb3N0IHNwZWNpZmljIHRvIGxlYXN0LCBidXQgbW92ZSB0byB0aGUgbmV4dCBhcnJheSBpdGVtIGlmIGl0J3MgYSBtb3JlIHNwZWNpZmljIHZhcmlhbnQgdGhhbiB0aGUgY3VycmVudCByb290XG4gICAgZnVuY3Rpb24gY2hvb3NlTG9jYWxlKG5hbWVzKSB7XG4gICAgICAgIHZhciBpID0gMCwgaiwgbmV4dCwgbG9jYWxlLCBzcGxpdDtcblxuICAgICAgICB3aGlsZSAoaSA8IG5hbWVzLmxlbmd0aCkge1xuICAgICAgICAgICAgc3BsaXQgPSBub3JtYWxpemVMb2NhbGUobmFtZXNbaV0pLnNwbGl0KCctJyk7XG4gICAgICAgICAgICBqID0gc3BsaXQubGVuZ3RoO1xuICAgICAgICAgICAgbmV4dCA9IG5vcm1hbGl6ZUxvY2FsZShuYW1lc1tpICsgMV0pO1xuICAgICAgICAgICAgbmV4dCA9IG5leHQgPyBuZXh0LnNwbGl0KCctJykgOiBudWxsO1xuICAgICAgICAgICAgd2hpbGUgKGogPiAwKSB7XG4gICAgICAgICAgICAgICAgbG9jYWxlID0gbG9hZExvY2FsZShzcGxpdC5zbGljZSgwLCBqKS5qb2luKCctJykpO1xuICAgICAgICAgICAgICAgIGlmIChsb2NhbGUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxvY2FsZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG5leHQgJiYgbmV4dC5sZW5ndGggPj0gaiAmJiBjb21wYXJlQXJyYXlzKHNwbGl0LCBuZXh0LCB0cnVlKSA+PSBqIC0gMSkge1xuICAgICAgICAgICAgICAgICAgICAvL3RoZSBuZXh0IGFycmF5IGl0ZW0gaXMgYmV0dGVyIHRoYW4gYSBzaGFsbG93ZXIgc3Vic3RyaW5nIG9mIHRoaXMgb25lXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBqLS07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpKys7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGdsb2JhbExvY2FsZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsb2FkTG9jYWxlKG5hbWUpIHtcbiAgICAgICAgdmFyIG9sZExvY2FsZSA9IG51bGw7XG4gICAgICAgIC8vIFRPRE86IEZpbmQgYSBiZXR0ZXIgd2F5IHRvIHJlZ2lzdGVyIGFuZCBsb2FkIGFsbCB0aGUgbG9jYWxlcyBpbiBOb2RlXG4gICAgICAgIGlmICghbG9jYWxlc1tuYW1lXSAmJiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpICYmXG4gICAgICAgICAgICAgICAgbW9kdWxlICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIG9sZExvY2FsZSA9IGdsb2JhbExvY2FsZS5fYWJicjtcbiAgICAgICAgICAgICAgICB2YXIgYWxpYXNlZFJlcXVpcmUgPSByZXF1aXJlO1xuICAgICAgICAgICAgICAgIGFsaWFzZWRSZXF1aXJlKCcuL2xvY2FsZS8nICsgbmFtZSk7XG4gICAgICAgICAgICAgICAgZ2V0U2V0R2xvYmFsTG9jYWxlKG9sZExvY2FsZSk7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7fVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBsb2NhbGVzW25hbWVdO1xuICAgIH1cblxuICAgIC8vIFRoaXMgZnVuY3Rpb24gd2lsbCBsb2FkIGxvY2FsZSBhbmQgdGhlbiBzZXQgdGhlIGdsb2JhbCBsb2NhbGUuICBJZlxuICAgIC8vIG5vIGFyZ3VtZW50cyBhcmUgcGFzc2VkIGluLCBpdCB3aWxsIHNpbXBseSByZXR1cm4gdGhlIGN1cnJlbnQgZ2xvYmFsXG4gICAgLy8gbG9jYWxlIGtleS5cbiAgICBmdW5jdGlvbiBnZXRTZXRHbG9iYWxMb2NhbGUgKGtleSwgdmFsdWVzKSB7XG4gICAgICAgIHZhciBkYXRhO1xuICAgICAgICBpZiAoa2V5KSB7XG4gICAgICAgICAgICBpZiAoaXNVbmRlZmluZWQodmFsdWVzKSkge1xuICAgICAgICAgICAgICAgIGRhdGEgPSBnZXRMb2NhbGUoa2V5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGRhdGEgPSBkZWZpbmVMb2NhbGUoa2V5LCB2YWx1ZXMpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZGF0YSkge1xuICAgICAgICAgICAgICAgIC8vIG1vbWVudC5kdXJhdGlvbi5fbG9jYWxlID0gbW9tZW50Ll9sb2NhbGUgPSBkYXRhO1xuICAgICAgICAgICAgICAgIGdsb2JhbExvY2FsZSA9IGRhdGE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoKHR5cGVvZiBjb25zb2xlICE9PSAgJ3VuZGVmaW5lZCcpICYmIGNvbnNvbGUud2Fybikge1xuICAgICAgICAgICAgICAgICAgICAvL3dhcm4gdXNlciBpZiBhcmd1bWVudHMgYXJlIHBhc3NlZCBidXQgdGhlIGxvY2FsZSBjb3VsZCBub3QgYmUgc2V0XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignTG9jYWxlICcgKyBrZXkgKyAgJyBub3QgZm91bmQuIERpZCB5b3UgZm9yZ2V0IHRvIGxvYWQgaXQ/Jyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGdsb2JhbExvY2FsZS5fYWJicjtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBkZWZpbmVMb2NhbGUgKG5hbWUsIGNvbmZpZykge1xuICAgICAgICBpZiAoY29uZmlnICE9PSBudWxsKSB7XG4gICAgICAgICAgICB2YXIgbG9jYWxlLCBwYXJlbnRDb25maWcgPSBiYXNlQ29uZmlnO1xuICAgICAgICAgICAgY29uZmlnLmFiYnIgPSBuYW1lO1xuICAgICAgICAgICAgaWYgKGxvY2FsZXNbbmFtZV0gIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGRlcHJlY2F0ZVNpbXBsZSgnZGVmaW5lTG9jYWxlT3ZlcnJpZGUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ3VzZSBtb21lbnQudXBkYXRlTG9jYWxlKGxvY2FsZU5hbWUsIGNvbmZpZykgdG8gY2hhbmdlICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJ2FuIGV4aXN0aW5nIGxvY2FsZS4gbW9tZW50LmRlZmluZUxvY2FsZShsb2NhbGVOYW1lLCAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICdjb25maWcpIHNob3VsZCBvbmx5IGJlIHVzZWQgZm9yIGNyZWF0aW5nIGEgbmV3IGxvY2FsZSAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICdTZWUgaHR0cDovL21vbWVudGpzLmNvbS9ndWlkZXMvIy93YXJuaW5ncy9kZWZpbmUtbG9jYWxlLyBmb3IgbW9yZSBpbmZvLicpO1xuICAgICAgICAgICAgICAgIHBhcmVudENvbmZpZyA9IGxvY2FsZXNbbmFtZV0uX2NvbmZpZztcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoY29uZmlnLnBhcmVudExvY2FsZSAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgaWYgKGxvY2FsZXNbY29uZmlnLnBhcmVudExvY2FsZV0gIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBwYXJlbnRDb25maWcgPSBsb2NhbGVzW2NvbmZpZy5wYXJlbnRMb2NhbGVdLl9jb25maWc7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbG9jYWxlID0gbG9hZExvY2FsZShjb25maWcucGFyZW50TG9jYWxlKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxvY2FsZSAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnRDb25maWcgPSBsb2NhbGUuX2NvbmZpZztcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghbG9jYWxlRmFtaWxpZXNbY29uZmlnLnBhcmVudExvY2FsZV0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2NhbGVGYW1pbGllc1tjb25maWcucGFyZW50TG9jYWxlXSA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgbG9jYWxlRmFtaWxpZXNbY29uZmlnLnBhcmVudExvY2FsZV0ucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWc6IGNvbmZpZ1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxvY2FsZXNbbmFtZV0gPSBuZXcgTG9jYWxlKG1lcmdlQ29uZmlncyhwYXJlbnRDb25maWcsIGNvbmZpZykpO1xuXG4gICAgICAgICAgICBpZiAobG9jYWxlRmFtaWxpZXNbbmFtZV0pIHtcbiAgICAgICAgICAgICAgICBsb2NhbGVGYW1pbGllc1tuYW1lXS5mb3JFYWNoKGZ1bmN0aW9uICh4KSB7XG4gICAgICAgICAgICAgICAgICAgIGRlZmluZUxvY2FsZSh4Lm5hbWUsIHguY29uZmlnKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gYmFja3dhcmRzIGNvbXBhdCBmb3Igbm93OiBhbHNvIHNldCB0aGUgbG9jYWxlXG4gICAgICAgICAgICAvLyBtYWtlIHN1cmUgd2Ugc2V0IHRoZSBsb2NhbGUgQUZURVIgYWxsIGNoaWxkIGxvY2FsZXMgaGF2ZSBiZWVuXG4gICAgICAgICAgICAvLyBjcmVhdGVkLCBzbyB3ZSB3b24ndCBlbmQgdXAgd2l0aCB0aGUgY2hpbGQgbG9jYWxlIHNldC5cbiAgICAgICAgICAgIGdldFNldEdsb2JhbExvY2FsZShuYW1lKTtcblxuXG4gICAgICAgICAgICByZXR1cm4gbG9jYWxlc1tuYW1lXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIHVzZWZ1bCBmb3IgdGVzdGluZ1xuICAgICAgICAgICAgZGVsZXRlIGxvY2FsZXNbbmFtZV07XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHVwZGF0ZUxvY2FsZShuYW1lLCBjb25maWcpIHtcbiAgICAgICAgaWYgKGNvbmZpZyAhPSBudWxsKSB7XG4gICAgICAgICAgICB2YXIgbG9jYWxlLCB0bXBMb2NhbGUsIHBhcmVudENvbmZpZyA9IGJhc2VDb25maWc7XG4gICAgICAgICAgICAvLyBNRVJHRVxuICAgICAgICAgICAgdG1wTG9jYWxlID0gbG9hZExvY2FsZShuYW1lKTtcbiAgICAgICAgICAgIGlmICh0bXBMb2NhbGUgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHBhcmVudENvbmZpZyA9IHRtcExvY2FsZS5fY29uZmlnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uZmlnID0gbWVyZ2VDb25maWdzKHBhcmVudENvbmZpZywgY29uZmlnKTtcbiAgICAgICAgICAgIGxvY2FsZSA9IG5ldyBMb2NhbGUoY29uZmlnKTtcbiAgICAgICAgICAgIGxvY2FsZS5wYXJlbnRMb2NhbGUgPSBsb2NhbGVzW25hbWVdO1xuICAgICAgICAgICAgbG9jYWxlc1tuYW1lXSA9IGxvY2FsZTtcblxuICAgICAgICAgICAgLy8gYmFja3dhcmRzIGNvbXBhdCBmb3Igbm93OiBhbHNvIHNldCB0aGUgbG9jYWxlXG4gICAgICAgICAgICBnZXRTZXRHbG9iYWxMb2NhbGUobmFtZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBwYXNzIG51bGwgZm9yIGNvbmZpZyB0byB1bnVwZGF0ZSwgdXNlZnVsIGZvciB0ZXN0c1xuICAgICAgICAgICAgaWYgKGxvY2FsZXNbbmFtZV0gIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGlmIChsb2NhbGVzW25hbWVdLnBhcmVudExvY2FsZSAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIGxvY2FsZXNbbmFtZV0gPSBsb2NhbGVzW25hbWVdLnBhcmVudExvY2FsZTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGxvY2FsZXNbbmFtZV0gIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBkZWxldGUgbG9jYWxlc1tuYW1lXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGxvY2FsZXNbbmFtZV07XG4gICAgfVxuXG4gICAgLy8gcmV0dXJucyBsb2NhbGUgZGF0YVxuICAgIGZ1bmN0aW9uIGdldExvY2FsZSAoa2V5KSB7XG4gICAgICAgIHZhciBsb2NhbGU7XG5cbiAgICAgICAgaWYgKGtleSAmJiBrZXkuX2xvY2FsZSAmJiBrZXkuX2xvY2FsZS5fYWJicikge1xuICAgICAgICAgICAga2V5ID0ga2V5Ll9sb2NhbGUuX2FiYnI7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWtleSkge1xuICAgICAgICAgICAgcmV0dXJuIGdsb2JhbExvY2FsZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghaXNBcnJheShrZXkpKSB7XG4gICAgICAgICAgICAvL3Nob3J0LWNpcmN1aXQgZXZlcnl0aGluZyBlbHNlXG4gICAgICAgICAgICBsb2NhbGUgPSBsb2FkTG9jYWxlKGtleSk7XG4gICAgICAgICAgICBpZiAobG9jYWxlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGxvY2FsZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGtleSA9IFtrZXldO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGNob29zZUxvY2FsZShrZXkpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpc3RMb2NhbGVzKCkge1xuICAgICAgICByZXR1cm4ga2V5cyhsb2NhbGVzKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjaGVja092ZXJmbG93IChtKSB7XG4gICAgICAgIHZhciBvdmVyZmxvdztcbiAgICAgICAgdmFyIGEgPSBtLl9hO1xuXG4gICAgICAgIGlmIChhICYmIGdldFBhcnNpbmdGbGFncyhtKS5vdmVyZmxvdyA9PT0gLTIpIHtcbiAgICAgICAgICAgIG92ZXJmbG93ID1cbiAgICAgICAgICAgICAgICBhW01PTlRIXSAgICAgICA8IDAgfHwgYVtNT05USF0gICAgICAgPiAxMSAgPyBNT05USCA6XG4gICAgICAgICAgICAgICAgYVtEQVRFXSAgICAgICAgPCAxIHx8IGFbREFURV0gICAgICAgID4gZGF5c0luTW9udGgoYVtZRUFSXSwgYVtNT05USF0pID8gREFURSA6XG4gICAgICAgICAgICAgICAgYVtIT1VSXSAgICAgICAgPCAwIHx8IGFbSE9VUl0gICAgICAgID4gMjQgfHwgKGFbSE9VUl0gPT09IDI0ICYmIChhW01JTlVURV0gIT09IDAgfHwgYVtTRUNPTkRdICE9PSAwIHx8IGFbTUlMTElTRUNPTkRdICE9PSAwKSkgPyBIT1VSIDpcbiAgICAgICAgICAgICAgICBhW01JTlVURV0gICAgICA8IDAgfHwgYVtNSU5VVEVdICAgICAgPiA1OSAgPyBNSU5VVEUgOlxuICAgICAgICAgICAgICAgIGFbU0VDT05EXSAgICAgIDwgMCB8fCBhW1NFQ09ORF0gICAgICA+IDU5ICA/IFNFQ09ORCA6XG4gICAgICAgICAgICAgICAgYVtNSUxMSVNFQ09ORF0gPCAwIHx8IGFbTUlMTElTRUNPTkRdID4gOTk5ID8gTUlMTElTRUNPTkQgOlxuICAgICAgICAgICAgICAgIC0xO1xuXG4gICAgICAgICAgICBpZiAoZ2V0UGFyc2luZ0ZsYWdzKG0pLl9vdmVyZmxvd0RheU9mWWVhciAmJiAob3ZlcmZsb3cgPCBZRUFSIHx8IG92ZXJmbG93ID4gREFURSkpIHtcbiAgICAgICAgICAgICAgICBvdmVyZmxvdyA9IERBVEU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZ2V0UGFyc2luZ0ZsYWdzKG0pLl9vdmVyZmxvd1dlZWtzICYmIG92ZXJmbG93ID09PSAtMSkge1xuICAgICAgICAgICAgICAgIG92ZXJmbG93ID0gV0VFSztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChnZXRQYXJzaW5nRmxhZ3MobSkuX292ZXJmbG93V2Vla2RheSAmJiBvdmVyZmxvdyA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICBvdmVyZmxvdyA9IFdFRUtEQVk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGdldFBhcnNpbmdGbGFncyhtKS5vdmVyZmxvdyA9IG92ZXJmbG93O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG07XG4gICAgfVxuXG4gICAgLy8gUGljayB0aGUgZmlyc3QgZGVmaW5lZCBvZiB0d28gb3IgdGhyZWUgYXJndW1lbnRzLlxuICAgIGZ1bmN0aW9uIGRlZmF1bHRzKGEsIGIsIGMpIHtcbiAgICAgICAgaWYgKGEgIT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIGE7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGIgIT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIGI7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGM7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY3VycmVudERhdGVBcnJheShjb25maWcpIHtcbiAgICAgICAgLy8gaG9va3MgaXMgYWN0dWFsbHkgdGhlIGV4cG9ydGVkIG1vbWVudCBvYmplY3RcbiAgICAgICAgdmFyIG5vd1ZhbHVlID0gbmV3IERhdGUoaG9va3Mubm93KCkpO1xuICAgICAgICBpZiAoY29uZmlnLl91c2VVVEMpIHtcbiAgICAgICAgICAgIHJldHVybiBbbm93VmFsdWUuZ2V0VVRDRnVsbFllYXIoKSwgbm93VmFsdWUuZ2V0VVRDTW9udGgoKSwgbm93VmFsdWUuZ2V0VVRDRGF0ZSgpXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gW25vd1ZhbHVlLmdldEZ1bGxZZWFyKCksIG5vd1ZhbHVlLmdldE1vbnRoKCksIG5vd1ZhbHVlLmdldERhdGUoKV07XG4gICAgfVxuXG4gICAgLy8gY29udmVydCBhbiBhcnJheSB0byBhIGRhdGUuXG4gICAgLy8gdGhlIGFycmF5IHNob3VsZCBtaXJyb3IgdGhlIHBhcmFtZXRlcnMgYmVsb3dcbiAgICAvLyBub3RlOiBhbGwgdmFsdWVzIHBhc3QgdGhlIHllYXIgYXJlIG9wdGlvbmFsIGFuZCB3aWxsIGRlZmF1bHQgdG8gdGhlIGxvd2VzdCBwb3NzaWJsZSB2YWx1ZS5cbiAgICAvLyBbeWVhciwgbW9udGgsIGRheSAsIGhvdXIsIG1pbnV0ZSwgc2Vjb25kLCBtaWxsaXNlY29uZF1cbiAgICBmdW5jdGlvbiBjb25maWdGcm9tQXJyYXkgKGNvbmZpZykge1xuICAgICAgICB2YXIgaSwgZGF0ZSwgaW5wdXQgPSBbXSwgY3VycmVudERhdGUsIGV4cGVjdGVkV2Vla2RheSwgeWVhclRvVXNlO1xuXG4gICAgICAgIGlmIChjb25maWcuX2QpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGN1cnJlbnREYXRlID0gY3VycmVudERhdGVBcnJheShjb25maWcpO1xuXG4gICAgICAgIC8vY29tcHV0ZSBkYXkgb2YgdGhlIHllYXIgZnJvbSB3ZWVrcyBhbmQgd2Vla2RheXNcbiAgICAgICAgaWYgKGNvbmZpZy5fdyAmJiBjb25maWcuX2FbREFURV0gPT0gbnVsbCAmJiBjb25maWcuX2FbTU9OVEhdID09IG51bGwpIHtcbiAgICAgICAgICAgIGRheU9mWWVhckZyb21XZWVrSW5mbyhjb25maWcpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9pZiB0aGUgZGF5IG9mIHRoZSB5ZWFyIGlzIHNldCwgZmlndXJlIG91dCB3aGF0IGl0IGlzXG4gICAgICAgIGlmIChjb25maWcuX2RheU9mWWVhciAhPSBudWxsKSB7XG4gICAgICAgICAgICB5ZWFyVG9Vc2UgPSBkZWZhdWx0cyhjb25maWcuX2FbWUVBUl0sIGN1cnJlbnREYXRlW1lFQVJdKTtcblxuICAgICAgICAgICAgaWYgKGNvbmZpZy5fZGF5T2ZZZWFyID4gZGF5c0luWWVhcih5ZWFyVG9Vc2UpIHx8IGNvbmZpZy5fZGF5T2ZZZWFyID09PSAwKSB7XG4gICAgICAgICAgICAgICAgZ2V0UGFyc2luZ0ZsYWdzKGNvbmZpZykuX292ZXJmbG93RGF5T2ZZZWFyID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZGF0ZSA9IGNyZWF0ZVVUQ0RhdGUoeWVhclRvVXNlLCAwLCBjb25maWcuX2RheU9mWWVhcik7XG4gICAgICAgICAgICBjb25maWcuX2FbTU9OVEhdID0gZGF0ZS5nZXRVVENNb250aCgpO1xuICAgICAgICAgICAgY29uZmlnLl9hW0RBVEVdID0gZGF0ZS5nZXRVVENEYXRlKCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBEZWZhdWx0IHRvIGN1cnJlbnQgZGF0ZS5cbiAgICAgICAgLy8gKiBpZiBubyB5ZWFyLCBtb250aCwgZGF5IG9mIG1vbnRoIGFyZSBnaXZlbiwgZGVmYXVsdCB0byB0b2RheVxuICAgICAgICAvLyAqIGlmIGRheSBvZiBtb250aCBpcyBnaXZlbiwgZGVmYXVsdCBtb250aCBhbmQgeWVhclxuICAgICAgICAvLyAqIGlmIG1vbnRoIGlzIGdpdmVuLCBkZWZhdWx0IG9ubHkgeWVhclxuICAgICAgICAvLyAqIGlmIHllYXIgaXMgZ2l2ZW4sIGRvbid0IGRlZmF1bHQgYW55dGhpbmdcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IDMgJiYgY29uZmlnLl9hW2ldID09IG51bGw7ICsraSkge1xuICAgICAgICAgICAgY29uZmlnLl9hW2ldID0gaW5wdXRbaV0gPSBjdXJyZW50RGF0ZVtpXTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFplcm8gb3V0IHdoYXRldmVyIHdhcyBub3QgZGVmYXVsdGVkLCBpbmNsdWRpbmcgdGltZVxuICAgICAgICBmb3IgKDsgaSA8IDc7IGkrKykge1xuICAgICAgICAgICAgY29uZmlnLl9hW2ldID0gaW5wdXRbaV0gPSAoY29uZmlnLl9hW2ldID09IG51bGwpID8gKGkgPT09IDIgPyAxIDogMCkgOiBjb25maWcuX2FbaV07XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDaGVjayBmb3IgMjQ6MDA6MDAuMDAwXG4gICAgICAgIGlmIChjb25maWcuX2FbSE9VUl0gPT09IDI0ICYmXG4gICAgICAgICAgICAgICAgY29uZmlnLl9hW01JTlVURV0gPT09IDAgJiZcbiAgICAgICAgICAgICAgICBjb25maWcuX2FbU0VDT05EXSA9PT0gMCAmJlxuICAgICAgICAgICAgICAgIGNvbmZpZy5fYVtNSUxMSVNFQ09ORF0gPT09IDApIHtcbiAgICAgICAgICAgIGNvbmZpZy5fbmV4dERheSA9IHRydWU7XG4gICAgICAgICAgICBjb25maWcuX2FbSE9VUl0gPSAwO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uZmlnLl9kID0gKGNvbmZpZy5fdXNlVVRDID8gY3JlYXRlVVRDRGF0ZSA6IGNyZWF0ZURhdGUpLmFwcGx5KG51bGwsIGlucHV0KTtcbiAgICAgICAgZXhwZWN0ZWRXZWVrZGF5ID0gY29uZmlnLl91c2VVVEMgPyBjb25maWcuX2QuZ2V0VVRDRGF5KCkgOiBjb25maWcuX2QuZ2V0RGF5KCk7XG5cbiAgICAgICAgLy8gQXBwbHkgdGltZXpvbmUgb2Zmc2V0IGZyb20gaW5wdXQuIFRoZSBhY3R1YWwgdXRjT2Zmc2V0IGNhbiBiZSBjaGFuZ2VkXG4gICAgICAgIC8vIHdpdGggcGFyc2Vab25lLlxuICAgICAgICBpZiAoY29uZmlnLl90em0gIT0gbnVsbCkge1xuICAgICAgICAgICAgY29uZmlnLl9kLnNldFVUQ01pbnV0ZXMoY29uZmlnLl9kLmdldFVUQ01pbnV0ZXMoKSAtIGNvbmZpZy5fdHptKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjb25maWcuX25leHREYXkpIHtcbiAgICAgICAgICAgIGNvbmZpZy5fYVtIT1VSXSA9IDI0O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gY2hlY2sgZm9yIG1pc21hdGNoaW5nIGRheSBvZiB3ZWVrXG4gICAgICAgIGlmIChjb25maWcuX3cgJiYgdHlwZW9mIGNvbmZpZy5fdy5kICE9PSAndW5kZWZpbmVkJyAmJiBjb25maWcuX3cuZCAhPT0gZXhwZWN0ZWRXZWVrZGF5KSB7XG4gICAgICAgICAgICBnZXRQYXJzaW5nRmxhZ3MoY29uZmlnKS53ZWVrZGF5TWlzbWF0Y2ggPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZGF5T2ZZZWFyRnJvbVdlZWtJbmZvKGNvbmZpZykge1xuICAgICAgICB2YXIgdywgd2Vla1llYXIsIHdlZWssIHdlZWtkYXksIGRvdywgZG95LCB0ZW1wLCB3ZWVrZGF5T3ZlcmZsb3c7XG5cbiAgICAgICAgdyA9IGNvbmZpZy5fdztcbiAgICAgICAgaWYgKHcuR0cgIT0gbnVsbCB8fCB3LlcgIT0gbnVsbCB8fCB3LkUgIT0gbnVsbCkge1xuICAgICAgICAgICAgZG93ID0gMTtcbiAgICAgICAgICAgIGRveSA9IDQ7XG5cbiAgICAgICAgICAgIC8vIFRPRE86IFdlIG5lZWQgdG8gdGFrZSB0aGUgY3VycmVudCBpc29XZWVrWWVhciwgYnV0IHRoYXQgZGVwZW5kcyBvblxuICAgICAgICAgICAgLy8gaG93IHdlIGludGVycHJldCBub3cgKGxvY2FsLCB1dGMsIGZpeGVkIG9mZnNldCkuIFNvIGNyZWF0ZVxuICAgICAgICAgICAgLy8gYSBub3cgdmVyc2lvbiBvZiBjdXJyZW50IGNvbmZpZyAodGFrZSBsb2NhbC91dGMvb2Zmc2V0IGZsYWdzLCBhbmRcbiAgICAgICAgICAgIC8vIGNyZWF0ZSBub3cpLlxuICAgICAgICAgICAgd2Vla1llYXIgPSBkZWZhdWx0cyh3LkdHLCBjb25maWcuX2FbWUVBUl0sIHdlZWtPZlllYXIoY3JlYXRlTG9jYWwoKSwgMSwgNCkueWVhcik7XG4gICAgICAgICAgICB3ZWVrID0gZGVmYXVsdHMody5XLCAxKTtcbiAgICAgICAgICAgIHdlZWtkYXkgPSBkZWZhdWx0cyh3LkUsIDEpO1xuICAgICAgICAgICAgaWYgKHdlZWtkYXkgPCAxIHx8IHdlZWtkYXkgPiA3KSB7XG4gICAgICAgICAgICAgICAgd2Vla2RheU92ZXJmbG93ID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRvdyA9IGNvbmZpZy5fbG9jYWxlLl93ZWVrLmRvdztcbiAgICAgICAgICAgIGRveSA9IGNvbmZpZy5fbG9jYWxlLl93ZWVrLmRveTtcblxuICAgICAgICAgICAgdmFyIGN1cldlZWsgPSB3ZWVrT2ZZZWFyKGNyZWF0ZUxvY2FsKCksIGRvdywgZG95KTtcblxuICAgICAgICAgICAgd2Vla1llYXIgPSBkZWZhdWx0cyh3LmdnLCBjb25maWcuX2FbWUVBUl0sIGN1cldlZWsueWVhcik7XG5cbiAgICAgICAgICAgIC8vIERlZmF1bHQgdG8gY3VycmVudCB3ZWVrLlxuICAgICAgICAgICAgd2VlayA9IGRlZmF1bHRzKHcudywgY3VyV2Vlay53ZWVrKTtcblxuICAgICAgICAgICAgaWYgKHcuZCAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgLy8gd2Vla2RheSAtLSBsb3cgZGF5IG51bWJlcnMgYXJlIGNvbnNpZGVyZWQgbmV4dCB3ZWVrXG4gICAgICAgICAgICAgICAgd2Vla2RheSA9IHcuZDtcbiAgICAgICAgICAgICAgICBpZiAod2Vla2RheSA8IDAgfHwgd2Vla2RheSA+IDYpIHtcbiAgICAgICAgICAgICAgICAgICAgd2Vla2RheU92ZXJmbG93ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHcuZSAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgLy8gbG9jYWwgd2Vla2RheSAtLSBjb3VudGluZyBzdGFydHMgZnJvbSBiZWdpbmluZyBvZiB3ZWVrXG4gICAgICAgICAgICAgICAgd2Vla2RheSA9IHcuZSArIGRvdztcbiAgICAgICAgICAgICAgICBpZiAody5lIDwgMCB8fCB3LmUgPiA2KSB7XG4gICAgICAgICAgICAgICAgICAgIHdlZWtkYXlPdmVyZmxvdyA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBkZWZhdWx0IHRvIGJlZ2luaW5nIG9mIHdlZWtcbiAgICAgICAgICAgICAgICB3ZWVrZGF5ID0gZG93O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICh3ZWVrIDwgMSB8fCB3ZWVrID4gd2Vla3NJblllYXIod2Vla1llYXIsIGRvdywgZG95KSkge1xuICAgICAgICAgICAgZ2V0UGFyc2luZ0ZsYWdzKGNvbmZpZykuX292ZXJmbG93V2Vla3MgPSB0cnVlO1xuICAgICAgICB9IGVsc2UgaWYgKHdlZWtkYXlPdmVyZmxvdyAhPSBudWxsKSB7XG4gICAgICAgICAgICBnZXRQYXJzaW5nRmxhZ3MoY29uZmlnKS5fb3ZlcmZsb3dXZWVrZGF5ID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRlbXAgPSBkYXlPZlllYXJGcm9tV2Vla3Mod2Vla1llYXIsIHdlZWssIHdlZWtkYXksIGRvdywgZG95KTtcbiAgICAgICAgICAgIGNvbmZpZy5fYVtZRUFSXSA9IHRlbXAueWVhcjtcbiAgICAgICAgICAgIGNvbmZpZy5fZGF5T2ZZZWFyID0gdGVtcC5kYXlPZlllYXI7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBpc28gODYwMSByZWdleFxuICAgIC8vIDAwMDAtMDAtMDAgMDAwMC1XMDAgb3IgMDAwMC1XMDAtMCArIFQgKyAwMCBvciAwMDowMCBvciAwMDowMDowMCBvciAwMDowMDowMC4wMDAgKyArMDA6MDAgb3IgKzAwMDAgb3IgKzAwKVxuICAgIHZhciBleHRlbmRlZElzb1JlZ2V4ID0gL15cXHMqKCg/OlsrLV1cXGR7Nn18XFxkezR9KS0oPzpcXGRcXGQtXFxkXFxkfFdcXGRcXGQtXFxkfFdcXGRcXGR8XFxkXFxkXFxkfFxcZFxcZCkpKD86KFR8ICkoXFxkXFxkKD86OlxcZFxcZCg/OjpcXGRcXGQoPzpbLixdXFxkKyk/KT8pPykoW1xcK1xcLV1cXGRcXGQoPzo6P1xcZFxcZCk/fFxccypaKT8pPyQvO1xuICAgIHZhciBiYXNpY0lzb1JlZ2V4ID0gL15cXHMqKCg/OlsrLV1cXGR7Nn18XFxkezR9KSg/OlxcZFxcZFxcZFxcZHxXXFxkXFxkXFxkfFdcXGRcXGR8XFxkXFxkXFxkfFxcZFxcZCkpKD86KFR8ICkoXFxkXFxkKD86XFxkXFxkKD86XFxkXFxkKD86Wy4sXVxcZCspPyk/KT8pKFtcXCtcXC1dXFxkXFxkKD86Oj9cXGRcXGQpP3xcXHMqWik/KT8kLztcblxuICAgIHZhciB0elJlZ2V4ID0gL1p8WystXVxcZFxcZCg/Ojo/XFxkXFxkKT8vO1xuXG4gICAgdmFyIGlzb0RhdGVzID0gW1xuICAgICAgICBbJ1lZWVlZWS1NTS1ERCcsIC9bKy1dXFxkezZ9LVxcZFxcZC1cXGRcXGQvXSxcbiAgICAgICAgWydZWVlZLU1NLUREJywgL1xcZHs0fS1cXGRcXGQtXFxkXFxkL10sXG4gICAgICAgIFsnR0dHRy1bV11XVy1FJywgL1xcZHs0fS1XXFxkXFxkLVxcZC9dLFxuICAgICAgICBbJ0dHR0ctW1ddV1cnLCAvXFxkezR9LVdcXGRcXGQvLCBmYWxzZV0sXG4gICAgICAgIFsnWVlZWS1EREQnLCAvXFxkezR9LVxcZHszfS9dLFxuICAgICAgICBbJ1lZWVktTU0nLCAvXFxkezR9LVxcZFxcZC8sIGZhbHNlXSxcbiAgICAgICAgWydZWVlZWVlNTUREJywgL1srLV1cXGR7MTB9L10sXG4gICAgICAgIFsnWVlZWU1NREQnLCAvXFxkezh9L10sXG4gICAgICAgIC8vIFlZWVlNTSBpcyBOT1QgYWxsb3dlZCBieSB0aGUgc3RhbmRhcmRcbiAgICAgICAgWydHR0dHW1ddV1dFJywgL1xcZHs0fVdcXGR7M30vXSxcbiAgICAgICAgWydHR0dHW1ddV1cnLCAvXFxkezR9V1xcZHsyfS8sIGZhbHNlXSxcbiAgICAgICAgWydZWVlZREREJywgL1xcZHs3fS9dXG4gICAgXTtcblxuICAgIC8vIGlzbyB0aW1lIGZvcm1hdHMgYW5kIHJlZ2V4ZXNcbiAgICB2YXIgaXNvVGltZXMgPSBbXG4gICAgICAgIFsnSEg6bW06c3MuU1NTUycsIC9cXGRcXGQ6XFxkXFxkOlxcZFxcZFxcLlxcZCsvXSxcbiAgICAgICAgWydISDptbTpzcyxTU1NTJywgL1xcZFxcZDpcXGRcXGQ6XFxkXFxkLFxcZCsvXSxcbiAgICAgICAgWydISDptbTpzcycsIC9cXGRcXGQ6XFxkXFxkOlxcZFxcZC9dLFxuICAgICAgICBbJ0hIOm1tJywgL1xcZFxcZDpcXGRcXGQvXSxcbiAgICAgICAgWydISG1tc3MuU1NTUycsIC9cXGRcXGRcXGRcXGRcXGRcXGRcXC5cXGQrL10sXG4gICAgICAgIFsnSEhtbXNzLFNTU1MnLCAvXFxkXFxkXFxkXFxkXFxkXFxkLFxcZCsvXSxcbiAgICAgICAgWydISG1tc3MnLCAvXFxkXFxkXFxkXFxkXFxkXFxkL10sXG4gICAgICAgIFsnSEhtbScsIC9cXGRcXGRcXGRcXGQvXSxcbiAgICAgICAgWydISCcsIC9cXGRcXGQvXVxuICAgIF07XG5cbiAgICB2YXIgYXNwTmV0SnNvblJlZ2V4ID0gL15cXC8/RGF0ZVxcKChcXC0/XFxkKykvaTtcblxuICAgIC8vIGRhdGUgZnJvbSBpc28gZm9ybWF0XG4gICAgZnVuY3Rpb24gY29uZmlnRnJvbUlTTyhjb25maWcpIHtcbiAgICAgICAgdmFyIGksIGwsXG4gICAgICAgICAgICBzdHJpbmcgPSBjb25maWcuX2ksXG4gICAgICAgICAgICBtYXRjaCA9IGV4dGVuZGVkSXNvUmVnZXguZXhlYyhzdHJpbmcpIHx8IGJhc2ljSXNvUmVnZXguZXhlYyhzdHJpbmcpLFxuICAgICAgICAgICAgYWxsb3dUaW1lLCBkYXRlRm9ybWF0LCB0aW1lRm9ybWF0LCB0ekZvcm1hdDtcblxuICAgICAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgICAgIGdldFBhcnNpbmdGbGFncyhjb25maWcpLmlzbyA9IHRydWU7XG5cbiAgICAgICAgICAgIGZvciAoaSA9IDAsIGwgPSBpc29EYXRlcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoaXNvRGF0ZXNbaV1bMV0uZXhlYyhtYXRjaFsxXSkpIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0ZUZvcm1hdCA9IGlzb0RhdGVzW2ldWzBdO1xuICAgICAgICAgICAgICAgICAgICBhbGxvd1RpbWUgPSBpc29EYXRlc1tpXVsyXSAhPT0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChkYXRlRm9ybWF0ID09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBjb25maWcuX2lzVmFsaWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobWF0Y2hbM10pIHtcbiAgICAgICAgICAgICAgICBmb3IgKGkgPSAwLCBsID0gaXNvVGltZXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpc29UaW1lc1tpXVsxXS5leGVjKG1hdGNoWzNdKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gbWF0Y2hbMl0gc2hvdWxkIGJlICdUJyBvciBzcGFjZVxuICAgICAgICAgICAgICAgICAgICAgICAgdGltZUZvcm1hdCA9IChtYXRjaFsyXSB8fCAnICcpICsgaXNvVGltZXNbaV1bMF07XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodGltZUZvcm1hdCA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZy5faXNWYWxpZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFhbGxvd1RpbWUgJiYgdGltZUZvcm1hdCAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgY29uZmlnLl9pc1ZhbGlkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG1hdGNoWzRdKSB7XG4gICAgICAgICAgICAgICAgaWYgKHR6UmVnZXguZXhlYyhtYXRjaFs0XSkpIHtcbiAgICAgICAgICAgICAgICAgICAgdHpGb3JtYXQgPSAnWic7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uZmlnLl9pc1ZhbGlkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25maWcuX2YgPSBkYXRlRm9ybWF0ICsgKHRpbWVGb3JtYXQgfHwgJycpICsgKHR6Rm9ybWF0IHx8ICcnKTtcbiAgICAgICAgICAgIGNvbmZpZ0Zyb21TdHJpbmdBbmRGb3JtYXQoY29uZmlnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbmZpZy5faXNWYWxpZCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gUkZDIDI4MjIgcmVnZXg6IEZvciBkZXRhaWxzIHNlZSBodHRwczovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMjgyMiNzZWN0aW9uLTMuM1xuICAgIHZhciByZmMyODIyID0gL14oPzooTW9ufFR1ZXxXZWR8VGh1fEZyaXxTYXR8U3VuKSw/XFxzKT8oXFxkezEsMn0pXFxzKEphbnxGZWJ8TWFyfEFwcnxNYXl8SnVufEp1bHxBdWd8U2VwfE9jdHxOb3Z8RGVjKVxccyhcXGR7Miw0fSlcXHMoXFxkXFxkKTooXFxkXFxkKSg/OjooXFxkXFxkKSk/XFxzKD86KFVUfEdNVHxbRUNNUF1bU0RdVCl8KFtael0pfChbKy1dXFxkezR9KSkkLztcblxuICAgIGZ1bmN0aW9uIGV4dHJhY3RGcm9tUkZDMjgyMlN0cmluZ3MoeWVhclN0ciwgbW9udGhTdHIsIGRheVN0ciwgaG91clN0ciwgbWludXRlU3RyLCBzZWNvbmRTdHIpIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IFtcbiAgICAgICAgICAgIHVudHJ1bmNhdGVZZWFyKHllYXJTdHIpLFxuICAgICAgICAgICAgZGVmYXVsdExvY2FsZU1vbnRoc1Nob3J0LmluZGV4T2YobW9udGhTdHIpLFxuICAgICAgICAgICAgcGFyc2VJbnQoZGF5U3RyLCAxMCksXG4gICAgICAgICAgICBwYXJzZUludChob3VyU3RyLCAxMCksXG4gICAgICAgICAgICBwYXJzZUludChtaW51dGVTdHIsIDEwKVxuICAgICAgICBdO1xuXG4gICAgICAgIGlmIChzZWNvbmRTdHIpIHtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKHBhcnNlSW50KHNlY29uZFN0ciwgMTApKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdW50cnVuY2F0ZVllYXIoeWVhclN0cikge1xuICAgICAgICB2YXIgeWVhciA9IHBhcnNlSW50KHllYXJTdHIsIDEwKTtcbiAgICAgICAgaWYgKHllYXIgPD0gNDkpIHtcbiAgICAgICAgICAgIHJldHVybiAyMDAwICsgeWVhcjtcbiAgICAgICAgfSBlbHNlIGlmICh5ZWFyIDw9IDk5OSkge1xuICAgICAgICAgICAgcmV0dXJuIDE5MDAgKyB5ZWFyO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB5ZWFyO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHByZXByb2Nlc3NSRkMyODIyKHMpIHtcbiAgICAgICAgLy8gUmVtb3ZlIGNvbW1lbnRzIGFuZCBmb2xkaW5nIHdoaXRlc3BhY2UgYW5kIHJlcGxhY2UgbXVsdGlwbGUtc3BhY2VzIHdpdGggYSBzaW5nbGUgc3BhY2VcbiAgICAgICAgcmV0dXJuIHMucmVwbGFjZSgvXFwoW14pXSpcXCl8W1xcblxcdF0vZywgJyAnKS5yZXBsYWNlKC8oXFxzXFxzKykvZywgJyAnKS5yZXBsYWNlKC9eXFxzXFxzKi8sICcnKS5yZXBsYWNlKC9cXHNcXHMqJC8sICcnKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjaGVja1dlZWtkYXkod2Vla2RheVN0ciwgcGFyc2VkSW5wdXQsIGNvbmZpZykge1xuICAgICAgICBpZiAod2Vla2RheVN0cikge1xuICAgICAgICAgICAgLy8gVE9ETzogUmVwbGFjZSB0aGUgdmFuaWxsYSBKUyBEYXRlIG9iamVjdCB3aXRoIGFuIGluZGVwZW50ZW50IGRheS1vZi13ZWVrIGNoZWNrLlxuICAgICAgICAgICAgdmFyIHdlZWtkYXlQcm92aWRlZCA9IGRlZmF1bHRMb2NhbGVXZWVrZGF5c1Nob3J0LmluZGV4T2Yod2Vla2RheVN0ciksXG4gICAgICAgICAgICAgICAgd2Vla2RheUFjdHVhbCA9IG5ldyBEYXRlKHBhcnNlZElucHV0WzBdLCBwYXJzZWRJbnB1dFsxXSwgcGFyc2VkSW5wdXRbMl0pLmdldERheSgpO1xuICAgICAgICAgICAgaWYgKHdlZWtkYXlQcm92aWRlZCAhPT0gd2Vla2RheUFjdHVhbCkge1xuICAgICAgICAgICAgICAgIGdldFBhcnNpbmdGbGFncyhjb25maWcpLndlZWtkYXlNaXNtYXRjaCA9IHRydWU7XG4gICAgICAgICAgICAgICAgY29uZmlnLl9pc1ZhbGlkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHZhciBvYnNPZmZzZXRzID0ge1xuICAgICAgICBVVDogMCxcbiAgICAgICAgR01UOiAwLFxuICAgICAgICBFRFQ6IC00ICogNjAsXG4gICAgICAgIEVTVDogLTUgKiA2MCxcbiAgICAgICAgQ0RUOiAtNSAqIDYwLFxuICAgICAgICBDU1Q6IC02ICogNjAsXG4gICAgICAgIE1EVDogLTYgKiA2MCxcbiAgICAgICAgTVNUOiAtNyAqIDYwLFxuICAgICAgICBQRFQ6IC03ICogNjAsXG4gICAgICAgIFBTVDogLTggKiA2MFxuICAgIH07XG5cbiAgICBmdW5jdGlvbiBjYWxjdWxhdGVPZmZzZXQob2JzT2Zmc2V0LCBtaWxpdGFyeU9mZnNldCwgbnVtT2Zmc2V0KSB7XG4gICAgICAgIGlmIChvYnNPZmZzZXQpIHtcbiAgICAgICAgICAgIHJldHVybiBvYnNPZmZzZXRzW29ic09mZnNldF07XG4gICAgICAgIH0gZWxzZSBpZiAobWlsaXRhcnlPZmZzZXQpIHtcbiAgICAgICAgICAgIC8vIHRoZSBvbmx5IGFsbG93ZWQgbWlsaXRhcnkgdHogaXMgWlxuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YXIgaG0gPSBwYXJzZUludChudW1PZmZzZXQsIDEwKTtcbiAgICAgICAgICAgIHZhciBtID0gaG0gJSAxMDAsIGggPSAoaG0gLSBtKSAvIDEwMDtcbiAgICAgICAgICAgIHJldHVybiBoICogNjAgKyBtO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gZGF0ZSBhbmQgdGltZSBmcm9tIHJlZiAyODIyIGZvcm1hdFxuICAgIGZ1bmN0aW9uIGNvbmZpZ0Zyb21SRkMyODIyKGNvbmZpZykge1xuICAgICAgICB2YXIgbWF0Y2ggPSByZmMyODIyLmV4ZWMocHJlcHJvY2Vzc1JGQzI4MjIoY29uZmlnLl9pKSk7XG4gICAgICAgIGlmIChtYXRjaCkge1xuICAgICAgICAgICAgdmFyIHBhcnNlZEFycmF5ID0gZXh0cmFjdEZyb21SRkMyODIyU3RyaW5ncyhtYXRjaFs0XSwgbWF0Y2hbM10sIG1hdGNoWzJdLCBtYXRjaFs1XSwgbWF0Y2hbNl0sIG1hdGNoWzddKTtcbiAgICAgICAgICAgIGlmICghY2hlY2tXZWVrZGF5KG1hdGNoWzFdLCBwYXJzZWRBcnJheSwgY29uZmlnKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uZmlnLl9hID0gcGFyc2VkQXJyYXk7XG4gICAgICAgICAgICBjb25maWcuX3R6bSA9IGNhbGN1bGF0ZU9mZnNldChtYXRjaFs4XSwgbWF0Y2hbOV0sIG1hdGNoWzEwXSk7XG5cbiAgICAgICAgICAgIGNvbmZpZy5fZCA9IGNyZWF0ZVVUQ0RhdGUuYXBwbHkobnVsbCwgY29uZmlnLl9hKTtcbiAgICAgICAgICAgIGNvbmZpZy5fZC5zZXRVVENNaW51dGVzKGNvbmZpZy5fZC5nZXRVVENNaW51dGVzKCkgLSBjb25maWcuX3R6bSk7XG5cbiAgICAgICAgICAgIGdldFBhcnNpbmdGbGFncyhjb25maWcpLnJmYzI4MjIgPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uZmlnLl9pc1ZhbGlkID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBkYXRlIGZyb20gaXNvIGZvcm1hdCBvciBmYWxsYmFja1xuICAgIGZ1bmN0aW9uIGNvbmZpZ0Zyb21TdHJpbmcoY29uZmlnKSB7XG4gICAgICAgIHZhciBtYXRjaGVkID0gYXNwTmV0SnNvblJlZ2V4LmV4ZWMoY29uZmlnLl9pKTtcblxuICAgICAgICBpZiAobWF0Y2hlZCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgY29uZmlnLl9kID0gbmV3IERhdGUoK21hdGNoZWRbMV0pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uZmlnRnJvbUlTTyhjb25maWcpO1xuICAgICAgICBpZiAoY29uZmlnLl9pc1ZhbGlkID09PSBmYWxzZSkge1xuICAgICAgICAgICAgZGVsZXRlIGNvbmZpZy5faXNWYWxpZDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbmZpZ0Zyb21SRkMyODIyKGNvbmZpZyk7XG4gICAgICAgIGlmIChjb25maWcuX2lzVmFsaWQgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICBkZWxldGUgY29uZmlnLl9pc1ZhbGlkO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRmluYWwgYXR0ZW1wdCwgdXNlIElucHV0IEZhbGxiYWNrXG4gICAgICAgIGhvb2tzLmNyZWF0ZUZyb21JbnB1dEZhbGxiYWNrKGNvbmZpZyk7XG4gICAgfVxuXG4gICAgaG9va3MuY3JlYXRlRnJvbUlucHV0RmFsbGJhY2sgPSBkZXByZWNhdGUoXG4gICAgICAgICd2YWx1ZSBwcm92aWRlZCBpcyBub3QgaW4gYSByZWNvZ25pemVkIFJGQzI4MjIgb3IgSVNPIGZvcm1hdC4gbW9tZW50IGNvbnN0cnVjdGlvbiBmYWxscyBiYWNrIHRvIGpzIERhdGUoKSwgJyArXG4gICAgICAgICd3aGljaCBpcyBub3QgcmVsaWFibGUgYWNyb3NzIGFsbCBicm93c2VycyBhbmQgdmVyc2lvbnMuIE5vbiBSRkMyODIyL0lTTyBkYXRlIGZvcm1hdHMgYXJlICcgK1xuICAgICAgICAnZGlzY291cmFnZWQgYW5kIHdpbGwgYmUgcmVtb3ZlZCBpbiBhbiB1cGNvbWluZyBtYWpvciByZWxlYXNlLiBQbGVhc2UgcmVmZXIgdG8gJyArXG4gICAgICAgICdodHRwOi8vbW9tZW50anMuY29tL2d1aWRlcy8jL3dhcm5pbmdzL2pzLWRhdGUvIGZvciBtb3JlIGluZm8uJyxcbiAgICAgICAgZnVuY3Rpb24gKGNvbmZpZykge1xuICAgICAgICAgICAgY29uZmlnLl9kID0gbmV3IERhdGUoY29uZmlnLl9pICsgKGNvbmZpZy5fdXNlVVRDID8gJyBVVEMnIDogJycpKTtcbiAgICAgICAgfVxuICAgICk7XG5cbiAgICAvLyBjb25zdGFudCB0aGF0IHJlZmVycyB0byB0aGUgSVNPIHN0YW5kYXJkXG4gICAgaG9va3MuSVNPXzg2MDEgPSBmdW5jdGlvbiAoKSB7fTtcblxuICAgIC8vIGNvbnN0YW50IHRoYXQgcmVmZXJzIHRvIHRoZSBSRkMgMjgyMiBmb3JtXG4gICAgaG9va3MuUkZDXzI4MjIgPSBmdW5jdGlvbiAoKSB7fTtcblxuICAgIC8vIGRhdGUgZnJvbSBzdHJpbmcgYW5kIGZvcm1hdCBzdHJpbmdcbiAgICBmdW5jdGlvbiBjb25maWdGcm9tU3RyaW5nQW5kRm9ybWF0KGNvbmZpZykge1xuICAgICAgICAvLyBUT0RPOiBNb3ZlIHRoaXMgdG8gYW5vdGhlciBwYXJ0IG9mIHRoZSBjcmVhdGlvbiBmbG93IHRvIHByZXZlbnQgY2lyY3VsYXIgZGVwc1xuICAgICAgICBpZiAoY29uZmlnLl9mID09PSBob29rcy5JU09fODYwMSkge1xuICAgICAgICAgICAgY29uZmlnRnJvbUlTTyhjb25maWcpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjb25maWcuX2YgPT09IGhvb2tzLlJGQ18yODIyKSB7XG4gICAgICAgICAgICBjb25maWdGcm9tUkZDMjgyMihjb25maWcpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbmZpZy5fYSA9IFtdO1xuICAgICAgICBnZXRQYXJzaW5nRmxhZ3MoY29uZmlnKS5lbXB0eSA9IHRydWU7XG5cbiAgICAgICAgLy8gVGhpcyBhcnJheSBpcyB1c2VkIHRvIG1ha2UgYSBEYXRlLCBlaXRoZXIgd2l0aCBgbmV3IERhdGVgIG9yIGBEYXRlLlVUQ2BcbiAgICAgICAgdmFyIHN0cmluZyA9ICcnICsgY29uZmlnLl9pLFxuICAgICAgICAgICAgaSwgcGFyc2VkSW5wdXQsIHRva2VucywgdG9rZW4sIHNraXBwZWQsXG4gICAgICAgICAgICBzdHJpbmdMZW5ndGggPSBzdHJpbmcubGVuZ3RoLFxuICAgICAgICAgICAgdG90YWxQYXJzZWRJbnB1dExlbmd0aCA9IDA7XG5cbiAgICAgICAgdG9rZW5zID0gZXhwYW5kRm9ybWF0KGNvbmZpZy5fZiwgY29uZmlnLl9sb2NhbGUpLm1hdGNoKGZvcm1hdHRpbmdUb2tlbnMpIHx8IFtdO1xuXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCB0b2tlbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHRva2VuID0gdG9rZW5zW2ldO1xuICAgICAgICAgICAgcGFyc2VkSW5wdXQgPSAoc3RyaW5nLm1hdGNoKGdldFBhcnNlUmVnZXhGb3JUb2tlbih0b2tlbiwgY29uZmlnKSkgfHwgW10pWzBdO1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ3Rva2VuJywgdG9rZW4sICdwYXJzZWRJbnB1dCcsIHBhcnNlZElucHV0LFxuICAgICAgICAgICAgLy8gICAgICAgICAncmVnZXgnLCBnZXRQYXJzZVJlZ2V4Rm9yVG9rZW4odG9rZW4sIGNvbmZpZykpO1xuICAgICAgICAgICAgaWYgKHBhcnNlZElucHV0KSB7XG4gICAgICAgICAgICAgICAgc2tpcHBlZCA9IHN0cmluZy5zdWJzdHIoMCwgc3RyaW5nLmluZGV4T2YocGFyc2VkSW5wdXQpKTtcbiAgICAgICAgICAgICAgICBpZiAoc2tpcHBlZC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGdldFBhcnNpbmdGbGFncyhjb25maWcpLnVudXNlZElucHV0LnB1c2goc2tpcHBlZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHN0cmluZyA9IHN0cmluZy5zbGljZShzdHJpbmcuaW5kZXhPZihwYXJzZWRJbnB1dCkgKyBwYXJzZWRJbnB1dC5sZW5ndGgpO1xuICAgICAgICAgICAgICAgIHRvdGFsUGFyc2VkSW5wdXRMZW5ndGggKz0gcGFyc2VkSW5wdXQubGVuZ3RoO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gZG9uJ3QgcGFyc2UgaWYgaXQncyBub3QgYSBrbm93biB0b2tlblxuICAgICAgICAgICAgaWYgKGZvcm1hdFRva2VuRnVuY3Rpb25zW3Rva2VuXSkge1xuICAgICAgICAgICAgICAgIGlmIChwYXJzZWRJbnB1dCkge1xuICAgICAgICAgICAgICAgICAgICBnZXRQYXJzaW5nRmxhZ3MoY29uZmlnKS5lbXB0eSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZ2V0UGFyc2luZ0ZsYWdzKGNvbmZpZykudW51c2VkVG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBhZGRUaW1lVG9BcnJheUZyb21Ub2tlbih0b2tlbiwgcGFyc2VkSW5wdXQsIGNvbmZpZyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjb25maWcuX3N0cmljdCAmJiAhcGFyc2VkSW5wdXQpIHtcbiAgICAgICAgICAgICAgICBnZXRQYXJzaW5nRmxhZ3MoY29uZmlnKS51bnVzZWRUb2tlbnMucHVzaCh0b2tlbik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBhZGQgcmVtYWluaW5nIHVucGFyc2VkIGlucHV0IGxlbmd0aCB0byB0aGUgc3RyaW5nXG4gICAgICAgIGdldFBhcnNpbmdGbGFncyhjb25maWcpLmNoYXJzTGVmdE92ZXIgPSBzdHJpbmdMZW5ndGggLSB0b3RhbFBhcnNlZElucHV0TGVuZ3RoO1xuICAgICAgICBpZiAoc3RyaW5nLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGdldFBhcnNpbmdGbGFncyhjb25maWcpLnVudXNlZElucHV0LnB1c2goc3RyaW5nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGNsZWFyIF8xMmggZmxhZyBpZiBob3VyIGlzIDw9IDEyXG4gICAgICAgIGlmIChjb25maWcuX2FbSE9VUl0gPD0gMTIgJiZcbiAgICAgICAgICAgIGdldFBhcnNpbmdGbGFncyhjb25maWcpLmJpZ0hvdXIgPT09IHRydWUgJiZcbiAgICAgICAgICAgIGNvbmZpZy5fYVtIT1VSXSA+IDApIHtcbiAgICAgICAgICAgIGdldFBhcnNpbmdGbGFncyhjb25maWcpLmJpZ0hvdXIgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cblxuICAgICAgICBnZXRQYXJzaW5nRmxhZ3MoY29uZmlnKS5wYXJzZWREYXRlUGFydHMgPSBjb25maWcuX2Euc2xpY2UoMCk7XG4gICAgICAgIGdldFBhcnNpbmdGbGFncyhjb25maWcpLm1lcmlkaWVtID0gY29uZmlnLl9tZXJpZGllbTtcbiAgICAgICAgLy8gaGFuZGxlIG1lcmlkaWVtXG4gICAgICAgIGNvbmZpZy5fYVtIT1VSXSA9IG1lcmlkaWVtRml4V3JhcChjb25maWcuX2xvY2FsZSwgY29uZmlnLl9hW0hPVVJdLCBjb25maWcuX21lcmlkaWVtKTtcblxuICAgICAgICBjb25maWdGcm9tQXJyYXkoY29uZmlnKTtcbiAgICAgICAgY2hlY2tPdmVyZmxvdyhjb25maWcpO1xuICAgIH1cblxuXG4gICAgZnVuY3Rpb24gbWVyaWRpZW1GaXhXcmFwIChsb2NhbGUsIGhvdXIsIG1lcmlkaWVtKSB7XG4gICAgICAgIHZhciBpc1BtO1xuXG4gICAgICAgIGlmIChtZXJpZGllbSA9PSBudWxsKSB7XG4gICAgICAgICAgICAvLyBub3RoaW5nIHRvIGRvXG4gICAgICAgICAgICByZXR1cm4gaG91cjtcbiAgICAgICAgfVxuICAgICAgICBpZiAobG9jYWxlLm1lcmlkaWVtSG91ciAhPSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gbG9jYWxlLm1lcmlkaWVtSG91cihob3VyLCBtZXJpZGllbSk7XG4gICAgICAgIH0gZWxzZSBpZiAobG9jYWxlLmlzUE0gIT0gbnVsbCkge1xuICAgICAgICAgICAgLy8gRmFsbGJhY2tcbiAgICAgICAgICAgIGlzUG0gPSBsb2NhbGUuaXNQTShtZXJpZGllbSk7XG4gICAgICAgICAgICBpZiAoaXNQbSAmJiBob3VyIDwgMTIpIHtcbiAgICAgICAgICAgICAgICBob3VyICs9IDEyO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFpc1BtICYmIGhvdXIgPT09IDEyKSB7XG4gICAgICAgICAgICAgICAgaG91ciA9IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gaG91cjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIHRoaXMgaXMgbm90IHN1cHBvc2VkIHRvIGhhcHBlblxuICAgICAgICAgICAgcmV0dXJuIGhvdXI7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBkYXRlIGZyb20gc3RyaW5nIGFuZCBhcnJheSBvZiBmb3JtYXQgc3RyaW5nc1xuICAgIGZ1bmN0aW9uIGNvbmZpZ0Zyb21TdHJpbmdBbmRBcnJheShjb25maWcpIHtcbiAgICAgICAgdmFyIHRlbXBDb25maWcsXG4gICAgICAgICAgICBiZXN0TW9tZW50LFxuXG4gICAgICAgICAgICBzY29yZVRvQmVhdCxcbiAgICAgICAgICAgIGksXG4gICAgICAgICAgICBjdXJyZW50U2NvcmU7XG5cbiAgICAgICAgaWYgKGNvbmZpZy5fZi5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIGdldFBhcnNpbmdGbGFncyhjb25maWcpLmludmFsaWRGb3JtYXQgPSB0cnVlO1xuICAgICAgICAgICAgY29uZmlnLl9kID0gbmV3IERhdGUoTmFOKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBjb25maWcuX2YubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGN1cnJlbnRTY29yZSA9IDA7XG4gICAgICAgICAgICB0ZW1wQ29uZmlnID0gY29weUNvbmZpZyh7fSwgY29uZmlnKTtcbiAgICAgICAgICAgIGlmIChjb25maWcuX3VzZVVUQyAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgdGVtcENvbmZpZy5fdXNlVVRDID0gY29uZmlnLl91c2VVVEM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0ZW1wQ29uZmlnLl9mID0gY29uZmlnLl9mW2ldO1xuICAgICAgICAgICAgY29uZmlnRnJvbVN0cmluZ0FuZEZvcm1hdCh0ZW1wQ29uZmlnKTtcblxuICAgICAgICAgICAgaWYgKCFpc1ZhbGlkKHRlbXBDb25maWcpKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGlmIHRoZXJlIGlzIGFueSBpbnB1dCB0aGF0IHdhcyBub3QgcGFyc2VkIGFkZCBhIHBlbmFsdHkgZm9yIHRoYXQgZm9ybWF0XG4gICAgICAgICAgICBjdXJyZW50U2NvcmUgKz0gZ2V0UGFyc2luZ0ZsYWdzKHRlbXBDb25maWcpLmNoYXJzTGVmdE92ZXI7XG5cbiAgICAgICAgICAgIC8vb3IgdG9rZW5zXG4gICAgICAgICAgICBjdXJyZW50U2NvcmUgKz0gZ2V0UGFyc2luZ0ZsYWdzKHRlbXBDb25maWcpLnVudXNlZFRva2Vucy5sZW5ndGggKiAxMDtcblxuICAgICAgICAgICAgZ2V0UGFyc2luZ0ZsYWdzKHRlbXBDb25maWcpLnNjb3JlID0gY3VycmVudFNjb3JlO1xuXG4gICAgICAgICAgICBpZiAoc2NvcmVUb0JlYXQgPT0gbnVsbCB8fCBjdXJyZW50U2NvcmUgPCBzY29yZVRvQmVhdCkge1xuICAgICAgICAgICAgICAgIHNjb3JlVG9CZWF0ID0gY3VycmVudFNjb3JlO1xuICAgICAgICAgICAgICAgIGJlc3RNb21lbnQgPSB0ZW1wQ29uZmlnO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZXh0ZW5kKGNvbmZpZywgYmVzdE1vbWVudCB8fCB0ZW1wQ29uZmlnKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjb25maWdGcm9tT2JqZWN0KGNvbmZpZykge1xuICAgICAgICBpZiAoY29uZmlnLl9kKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgaSA9IG5vcm1hbGl6ZU9iamVjdFVuaXRzKGNvbmZpZy5faSk7XG4gICAgICAgIGNvbmZpZy5fYSA9IG1hcChbaS55ZWFyLCBpLm1vbnRoLCBpLmRheSB8fCBpLmRhdGUsIGkuaG91ciwgaS5taW51dGUsIGkuc2Vjb25kLCBpLm1pbGxpc2Vjb25kXSwgZnVuY3Rpb24gKG9iaikge1xuICAgICAgICAgICAgcmV0dXJuIG9iaiAmJiBwYXJzZUludChvYmosIDEwKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uZmlnRnJvbUFycmF5KGNvbmZpZyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY3JlYXRlRnJvbUNvbmZpZyAoY29uZmlnKSB7XG4gICAgICAgIHZhciByZXMgPSBuZXcgTW9tZW50KGNoZWNrT3ZlcmZsb3cocHJlcGFyZUNvbmZpZyhjb25maWcpKSk7XG4gICAgICAgIGlmIChyZXMuX25leHREYXkpIHtcbiAgICAgICAgICAgIC8vIEFkZGluZyBpcyBzbWFydCBlbm91Z2ggYXJvdW5kIERTVFxuICAgICAgICAgICAgcmVzLmFkZCgxLCAnZCcpO1xuICAgICAgICAgICAgcmVzLl9uZXh0RGF5ID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlcztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwcmVwYXJlQ29uZmlnIChjb25maWcpIHtcbiAgICAgICAgdmFyIGlucHV0ID0gY29uZmlnLl9pLFxuICAgICAgICAgICAgZm9ybWF0ID0gY29uZmlnLl9mO1xuXG4gICAgICAgIGNvbmZpZy5fbG9jYWxlID0gY29uZmlnLl9sb2NhbGUgfHwgZ2V0TG9jYWxlKGNvbmZpZy5fbCk7XG5cbiAgICAgICAgaWYgKGlucHV0ID09PSBudWxsIHx8IChmb3JtYXQgPT09IHVuZGVmaW5lZCAmJiBpbnB1dCA9PT0gJycpKSB7XG4gICAgICAgICAgICByZXR1cm4gY3JlYXRlSW52YWxpZCh7bnVsbElucHV0OiB0cnVlfSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodHlwZW9mIGlucHV0ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgY29uZmlnLl9pID0gaW5wdXQgPSBjb25maWcuX2xvY2FsZS5wcmVwYXJzZShpbnB1dCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaXNNb21lbnQoaW5wdXQpKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IE1vbWVudChjaGVja092ZXJmbG93KGlucHV0KSk7XG4gICAgICAgIH0gZWxzZSBpZiAoaXNEYXRlKGlucHV0KSkge1xuICAgICAgICAgICAgY29uZmlnLl9kID0gaW5wdXQ7XG4gICAgICAgIH0gZWxzZSBpZiAoaXNBcnJheShmb3JtYXQpKSB7XG4gICAgICAgICAgICBjb25maWdGcm9tU3RyaW5nQW5kQXJyYXkoY29uZmlnKTtcbiAgICAgICAgfSBlbHNlIGlmIChmb3JtYXQpIHtcbiAgICAgICAgICAgIGNvbmZpZ0Zyb21TdHJpbmdBbmRGb3JtYXQoY29uZmlnKTtcbiAgICAgICAgfSAgZWxzZSB7XG4gICAgICAgICAgICBjb25maWdGcm9tSW5wdXQoY29uZmlnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghaXNWYWxpZChjb25maWcpKSB7XG4gICAgICAgICAgICBjb25maWcuX2QgPSBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGNvbmZpZztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjb25maWdGcm9tSW5wdXQoY29uZmlnKSB7XG4gICAgICAgIHZhciBpbnB1dCA9IGNvbmZpZy5faTtcbiAgICAgICAgaWYgKGlzVW5kZWZpbmVkKGlucHV0KSkge1xuICAgICAgICAgICAgY29uZmlnLl9kID0gbmV3IERhdGUoaG9va3Mubm93KCkpO1xuICAgICAgICB9IGVsc2UgaWYgKGlzRGF0ZShpbnB1dCkpIHtcbiAgICAgICAgICAgIGNvbmZpZy5fZCA9IG5ldyBEYXRlKGlucHV0LnZhbHVlT2YoKSk7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGlucHV0ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgY29uZmlnRnJvbVN0cmluZyhjb25maWcpO1xuICAgICAgICB9IGVsc2UgaWYgKGlzQXJyYXkoaW5wdXQpKSB7XG4gICAgICAgICAgICBjb25maWcuX2EgPSBtYXAoaW5wdXQuc2xpY2UoMCksIGZ1bmN0aW9uIChvYmopIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcGFyc2VJbnQob2JqLCAxMCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNvbmZpZ0Zyb21BcnJheShjb25maWcpO1xuICAgICAgICB9IGVsc2UgaWYgKGlzT2JqZWN0KGlucHV0KSkge1xuICAgICAgICAgICAgY29uZmlnRnJvbU9iamVjdChjb25maWcpO1xuICAgICAgICB9IGVsc2UgaWYgKGlzTnVtYmVyKGlucHV0KSkge1xuICAgICAgICAgICAgLy8gZnJvbSBtaWxsaXNlY29uZHNcbiAgICAgICAgICAgIGNvbmZpZy5fZCA9IG5ldyBEYXRlKGlucHV0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGhvb2tzLmNyZWF0ZUZyb21JbnB1dEZhbGxiYWNrKGNvbmZpZyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjcmVhdGVMb2NhbE9yVVRDIChpbnB1dCwgZm9ybWF0LCBsb2NhbGUsIHN0cmljdCwgaXNVVEMpIHtcbiAgICAgICAgdmFyIGMgPSB7fTtcblxuICAgICAgICBpZiAobG9jYWxlID09PSB0cnVlIHx8IGxvY2FsZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHN0cmljdCA9IGxvY2FsZTtcbiAgICAgICAgICAgIGxvY2FsZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICgoaXNPYmplY3QoaW5wdXQpICYmIGlzT2JqZWN0RW1wdHkoaW5wdXQpKSB8fFxuICAgICAgICAgICAgICAgIChpc0FycmF5KGlucHV0KSAmJiBpbnB1dC5sZW5ndGggPT09IDApKSB7XG4gICAgICAgICAgICBpbnB1dCA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICAvLyBvYmplY3QgY29uc3RydWN0aW9uIG11c3QgYmUgZG9uZSB0aGlzIHdheS5cbiAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL21vbWVudC9tb21lbnQvaXNzdWVzLzE0MjNcbiAgICAgICAgYy5faXNBTW9tZW50T2JqZWN0ID0gdHJ1ZTtcbiAgICAgICAgYy5fdXNlVVRDID0gYy5faXNVVEMgPSBpc1VUQztcbiAgICAgICAgYy5fbCA9IGxvY2FsZTtcbiAgICAgICAgYy5faSA9IGlucHV0O1xuICAgICAgICBjLl9mID0gZm9ybWF0O1xuICAgICAgICBjLl9zdHJpY3QgPSBzdHJpY3Q7XG5cbiAgICAgICAgcmV0dXJuIGNyZWF0ZUZyb21Db25maWcoYyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY3JlYXRlTG9jYWwgKGlucHV0LCBmb3JtYXQsIGxvY2FsZSwgc3RyaWN0KSB7XG4gICAgICAgIHJldHVybiBjcmVhdGVMb2NhbE9yVVRDKGlucHV0LCBmb3JtYXQsIGxvY2FsZSwgc3RyaWN0LCBmYWxzZSk7XG4gICAgfVxuXG4gICAgdmFyIHByb3RvdHlwZU1pbiA9IGRlcHJlY2F0ZShcbiAgICAgICAgJ21vbWVudCgpLm1pbiBpcyBkZXByZWNhdGVkLCB1c2UgbW9tZW50Lm1heCBpbnN0ZWFkLiBodHRwOi8vbW9tZW50anMuY29tL2d1aWRlcy8jL3dhcm5pbmdzL21pbi1tYXgvJyxcbiAgICAgICAgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIG90aGVyID0gY3JlYXRlTG9jYWwuYXBwbHkobnVsbCwgYXJndW1lbnRzKTtcbiAgICAgICAgICAgIGlmICh0aGlzLmlzVmFsaWQoKSAmJiBvdGhlci5pc1ZhbGlkKCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gb3RoZXIgPCB0aGlzID8gdGhpcyA6IG90aGVyO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY3JlYXRlSW52YWxpZCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgKTtcblxuICAgIHZhciBwcm90b3R5cGVNYXggPSBkZXByZWNhdGUoXG4gICAgICAgICdtb21lbnQoKS5tYXggaXMgZGVwcmVjYXRlZCwgdXNlIG1vbWVudC5taW4gaW5zdGVhZC4gaHR0cDovL21vbWVudGpzLmNvbS9ndWlkZXMvIy93YXJuaW5ncy9taW4tbWF4LycsXG4gICAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBvdGhlciA9IGNyZWF0ZUxvY2FsLmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICBpZiAodGhpcy5pc1ZhbGlkKCkgJiYgb3RoZXIuaXNWYWxpZCgpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG90aGVyID4gdGhpcyA/IHRoaXMgOiBvdGhlcjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNyZWF0ZUludmFsaWQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICk7XG5cbiAgICAvLyBQaWNrIGEgbW9tZW50IG0gZnJvbSBtb21lbnRzIHNvIHRoYXQgbVtmbl0ob3RoZXIpIGlzIHRydWUgZm9yIGFsbFxuICAgIC8vIG90aGVyLiBUaGlzIHJlbGllcyBvbiB0aGUgZnVuY3Rpb24gZm4gdG8gYmUgdHJhbnNpdGl2ZS5cbiAgICAvL1xuICAgIC8vIG1vbWVudHMgc2hvdWxkIGVpdGhlciBiZSBhbiBhcnJheSBvZiBtb21lbnQgb2JqZWN0cyBvciBhbiBhcnJheSwgd2hvc2VcbiAgICAvLyBmaXJzdCBlbGVtZW50IGlzIGFuIGFycmF5IG9mIG1vbWVudCBvYmplY3RzLlxuICAgIGZ1bmN0aW9uIHBpY2tCeShmbiwgbW9tZW50cykge1xuICAgICAgICB2YXIgcmVzLCBpO1xuICAgICAgICBpZiAobW9tZW50cy5sZW5ndGggPT09IDEgJiYgaXNBcnJheShtb21lbnRzWzBdKSkge1xuICAgICAgICAgICAgbW9tZW50cyA9IG1vbWVudHNbMF07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFtb21lbnRzLmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuIGNyZWF0ZUxvY2FsKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmVzID0gbW9tZW50c1swXTtcbiAgICAgICAgZm9yIChpID0gMTsgaSA8IG1vbWVudHMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIGlmICghbW9tZW50c1tpXS5pc1ZhbGlkKCkgfHwgbW9tZW50c1tpXVtmbl0ocmVzKSkge1xuICAgICAgICAgICAgICAgIHJlcyA9IG1vbWVudHNbaV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlcztcbiAgICB9XG5cbiAgICAvLyBUT0RPOiBVc2UgW10uc29ydCBpbnN0ZWFkP1xuICAgIGZ1bmN0aW9uIG1pbiAoKSB7XG4gICAgICAgIHZhciBhcmdzID0gW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDApO1xuXG4gICAgICAgIHJldHVybiBwaWNrQnkoJ2lzQmVmb3JlJywgYXJncyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbWF4ICgpIHtcbiAgICAgICAgdmFyIGFyZ3MgPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMCk7XG5cbiAgICAgICAgcmV0dXJuIHBpY2tCeSgnaXNBZnRlcicsIGFyZ3MpO1xuICAgIH1cblxuICAgIHZhciBub3cgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBEYXRlLm5vdyA/IERhdGUubm93KCkgOiArKG5ldyBEYXRlKCkpO1xuICAgIH07XG5cbiAgICB2YXIgb3JkZXJpbmcgPSBbJ3llYXInLCAncXVhcnRlcicsICdtb250aCcsICd3ZWVrJywgJ2RheScsICdob3VyJywgJ21pbnV0ZScsICdzZWNvbmQnLCAnbWlsbGlzZWNvbmQnXTtcblxuICAgIGZ1bmN0aW9uIGlzRHVyYXRpb25WYWxpZChtKSB7XG4gICAgICAgIGZvciAodmFyIGtleSBpbiBtKSB7XG4gICAgICAgICAgICBpZiAoIShpbmRleE9mLmNhbGwob3JkZXJpbmcsIGtleSkgIT09IC0xICYmIChtW2tleV0gPT0gbnVsbCB8fCAhaXNOYU4obVtrZXldKSkpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHVuaXRIYXNEZWNpbWFsID0gZmFsc2U7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgb3JkZXJpbmcubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIGlmIChtW29yZGVyaW5nW2ldXSkge1xuICAgICAgICAgICAgICAgIGlmICh1bml0SGFzRGVjaW1hbCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7IC8vIG9ubHkgYWxsb3cgbm9uLWludGVnZXJzIGZvciBzbWFsbGVzdCB1bml0XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChwYXJzZUZsb2F0KG1bb3JkZXJpbmdbaV1dKSAhPT0gdG9JbnQobVtvcmRlcmluZ1tpXV0pKSB7XG4gICAgICAgICAgICAgICAgICAgIHVuaXRIYXNEZWNpbWFsID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpc1ZhbGlkJDEoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9pc1ZhbGlkO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNyZWF0ZUludmFsaWQkMSgpIHtcbiAgICAgICAgcmV0dXJuIGNyZWF0ZUR1cmF0aW9uKE5hTik7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gRHVyYXRpb24gKGR1cmF0aW9uKSB7XG4gICAgICAgIHZhciBub3JtYWxpemVkSW5wdXQgPSBub3JtYWxpemVPYmplY3RVbml0cyhkdXJhdGlvbiksXG4gICAgICAgICAgICB5ZWFycyA9IG5vcm1hbGl6ZWRJbnB1dC55ZWFyIHx8IDAsXG4gICAgICAgICAgICBxdWFydGVycyA9IG5vcm1hbGl6ZWRJbnB1dC5xdWFydGVyIHx8IDAsXG4gICAgICAgICAgICBtb250aHMgPSBub3JtYWxpemVkSW5wdXQubW9udGggfHwgMCxcbiAgICAgICAgICAgIHdlZWtzID0gbm9ybWFsaXplZElucHV0LndlZWsgfHwgMCxcbiAgICAgICAgICAgIGRheXMgPSBub3JtYWxpemVkSW5wdXQuZGF5IHx8IDAsXG4gICAgICAgICAgICBob3VycyA9IG5vcm1hbGl6ZWRJbnB1dC5ob3VyIHx8IDAsXG4gICAgICAgICAgICBtaW51dGVzID0gbm9ybWFsaXplZElucHV0Lm1pbnV0ZSB8fCAwLFxuICAgICAgICAgICAgc2Vjb25kcyA9IG5vcm1hbGl6ZWRJbnB1dC5zZWNvbmQgfHwgMCxcbiAgICAgICAgICAgIG1pbGxpc2Vjb25kcyA9IG5vcm1hbGl6ZWRJbnB1dC5taWxsaXNlY29uZCB8fCAwO1xuXG4gICAgICAgIHRoaXMuX2lzVmFsaWQgPSBpc0R1cmF0aW9uVmFsaWQobm9ybWFsaXplZElucHV0KTtcblxuICAgICAgICAvLyByZXByZXNlbnRhdGlvbiBmb3IgZGF0ZUFkZFJlbW92ZVxuICAgICAgICB0aGlzLl9taWxsaXNlY29uZHMgPSArbWlsbGlzZWNvbmRzICtcbiAgICAgICAgICAgIHNlY29uZHMgKiAxZTMgKyAvLyAxMDAwXG4gICAgICAgICAgICBtaW51dGVzICogNmU0ICsgLy8gMTAwMCAqIDYwXG4gICAgICAgICAgICBob3VycyAqIDEwMDAgKiA2MCAqIDYwOyAvL3VzaW5nIDEwMDAgKiA2MCAqIDYwIGluc3RlYWQgb2YgMzZlNSB0byBhdm9pZCBmbG9hdGluZyBwb2ludCByb3VuZGluZyBlcnJvcnMgaHR0cHM6Ly9naXRodWIuY29tL21vbWVudC9tb21lbnQvaXNzdWVzLzI5NzhcbiAgICAgICAgLy8gQmVjYXVzZSBvZiBkYXRlQWRkUmVtb3ZlIHRyZWF0cyAyNCBob3VycyBhcyBkaWZmZXJlbnQgZnJvbSBhXG4gICAgICAgIC8vIGRheSB3aGVuIHdvcmtpbmcgYXJvdW5kIERTVCwgd2UgbmVlZCB0byBzdG9yZSB0aGVtIHNlcGFyYXRlbHlcbiAgICAgICAgdGhpcy5fZGF5cyA9ICtkYXlzICtcbiAgICAgICAgICAgIHdlZWtzICogNztcbiAgICAgICAgLy8gSXQgaXMgaW1wb3NzaWJsZSB0byB0cmFuc2xhdGUgbW9udGhzIGludG8gZGF5cyB3aXRob3V0IGtub3dpbmdcbiAgICAgICAgLy8gd2hpY2ggbW9udGhzIHlvdSBhcmUgYXJlIHRhbGtpbmcgYWJvdXQsIHNvIHdlIGhhdmUgdG8gc3RvcmVcbiAgICAgICAgLy8gaXQgc2VwYXJhdGVseS5cbiAgICAgICAgdGhpcy5fbW9udGhzID0gK21vbnRocyArXG4gICAgICAgICAgICBxdWFydGVycyAqIDMgK1xuICAgICAgICAgICAgeWVhcnMgKiAxMjtcblxuICAgICAgICB0aGlzLl9kYXRhID0ge307XG5cbiAgICAgICAgdGhpcy5fbG9jYWxlID0gZ2V0TG9jYWxlKCk7XG5cbiAgICAgICAgdGhpcy5fYnViYmxlKCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaXNEdXJhdGlvbiAob2JqKSB7XG4gICAgICAgIHJldHVybiBvYmogaW5zdGFuY2VvZiBEdXJhdGlvbjtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBhYnNSb3VuZCAobnVtYmVyKSB7XG4gICAgICAgIGlmIChudW1iZXIgPCAwKSB7XG4gICAgICAgICAgICByZXR1cm4gTWF0aC5yb3VuZCgtMSAqIG51bWJlcikgKiAtMTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBNYXRoLnJvdW5kKG51bWJlcik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBGT1JNQVRUSU5HXG5cbiAgICBmdW5jdGlvbiBvZmZzZXQgKHRva2VuLCBzZXBhcmF0b3IpIHtcbiAgICAgICAgYWRkRm9ybWF0VG9rZW4odG9rZW4sIDAsIDAsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBvZmZzZXQgPSB0aGlzLnV0Y09mZnNldCgpO1xuICAgICAgICAgICAgdmFyIHNpZ24gPSAnKyc7XG4gICAgICAgICAgICBpZiAob2Zmc2V0IDwgMCkge1xuICAgICAgICAgICAgICAgIG9mZnNldCA9IC1vZmZzZXQ7XG4gICAgICAgICAgICAgICAgc2lnbiA9ICctJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBzaWduICsgemVyb0ZpbGwofn4ob2Zmc2V0IC8gNjApLCAyKSArIHNlcGFyYXRvciArIHplcm9GaWxsKH5+KG9mZnNldCkgJSA2MCwgMik7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIG9mZnNldCgnWicsICc6Jyk7XG4gICAgb2Zmc2V0KCdaWicsICcnKTtcblxuICAgIC8vIFBBUlNJTkdcblxuICAgIGFkZFJlZ2V4VG9rZW4oJ1onLCAgbWF0Y2hTaG9ydE9mZnNldCk7XG4gICAgYWRkUmVnZXhUb2tlbignWlonLCBtYXRjaFNob3J0T2Zmc2V0KTtcbiAgICBhZGRQYXJzZVRva2VuKFsnWicsICdaWiddLCBmdW5jdGlvbiAoaW5wdXQsIGFycmF5LCBjb25maWcpIHtcbiAgICAgICAgY29uZmlnLl91c2VVVEMgPSB0cnVlO1xuICAgICAgICBjb25maWcuX3R6bSA9IG9mZnNldEZyb21TdHJpbmcobWF0Y2hTaG9ydE9mZnNldCwgaW5wdXQpO1xuICAgIH0pO1xuXG4gICAgLy8gSEVMUEVSU1xuXG4gICAgLy8gdGltZXpvbmUgY2h1bmtlclxuICAgIC8vICcrMTA6MDAnID4gWycxMCcsICAnMDAnXVxuICAgIC8vICctMTUzMCcgID4gWyctMTUnLCAnMzAnXVxuICAgIHZhciBjaHVua09mZnNldCA9IC8oW1xcK1xcLV18XFxkXFxkKS9naTtcblxuICAgIGZ1bmN0aW9uIG9mZnNldEZyb21TdHJpbmcobWF0Y2hlciwgc3RyaW5nKSB7XG4gICAgICAgIHZhciBtYXRjaGVzID0gKHN0cmluZyB8fCAnJykubWF0Y2gobWF0Y2hlcik7XG5cbiAgICAgICAgaWYgKG1hdGNoZXMgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGNodW5rICAgPSBtYXRjaGVzW21hdGNoZXMubGVuZ3RoIC0gMV0gfHwgW107XG4gICAgICAgIHZhciBwYXJ0cyAgID0gKGNodW5rICsgJycpLm1hdGNoKGNodW5rT2Zmc2V0KSB8fCBbJy0nLCAwLCAwXTtcbiAgICAgICAgdmFyIG1pbnV0ZXMgPSArKHBhcnRzWzFdICogNjApICsgdG9JbnQocGFydHNbMl0pO1xuXG4gICAgICAgIHJldHVybiBtaW51dGVzID09PSAwID9cbiAgICAgICAgICAwIDpcbiAgICAgICAgICBwYXJ0c1swXSA9PT0gJysnID8gbWludXRlcyA6IC1taW51dGVzO1xuICAgIH1cblxuICAgIC8vIFJldHVybiBhIG1vbWVudCBmcm9tIGlucHV0LCB0aGF0IGlzIGxvY2FsL3V0Yy96b25lIGVxdWl2YWxlbnQgdG8gbW9kZWwuXG4gICAgZnVuY3Rpb24gY2xvbmVXaXRoT2Zmc2V0KGlucHV0LCBtb2RlbCkge1xuICAgICAgICB2YXIgcmVzLCBkaWZmO1xuICAgICAgICBpZiAobW9kZWwuX2lzVVRDKSB7XG4gICAgICAgICAgICByZXMgPSBtb2RlbC5jbG9uZSgpO1xuICAgICAgICAgICAgZGlmZiA9IChpc01vbWVudChpbnB1dCkgfHwgaXNEYXRlKGlucHV0KSA/IGlucHV0LnZhbHVlT2YoKSA6IGNyZWF0ZUxvY2FsKGlucHV0KS52YWx1ZU9mKCkpIC0gcmVzLnZhbHVlT2YoKTtcbiAgICAgICAgICAgIC8vIFVzZSBsb3ctbGV2ZWwgYXBpLCBiZWNhdXNlIHRoaXMgZm4gaXMgbG93LWxldmVsIGFwaS5cbiAgICAgICAgICAgIHJlcy5fZC5zZXRUaW1lKHJlcy5fZC52YWx1ZU9mKCkgKyBkaWZmKTtcbiAgICAgICAgICAgIGhvb2tzLnVwZGF0ZU9mZnNldChyZXMsIGZhbHNlKTtcbiAgICAgICAgICAgIHJldHVybiByZXM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gY3JlYXRlTG9jYWwoaW5wdXQpLmxvY2FsKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXREYXRlT2Zmc2V0IChtKSB7XG4gICAgICAgIC8vIE9uIEZpcmVmb3guMjQgRGF0ZSNnZXRUaW1lem9uZU9mZnNldCByZXR1cm5zIGEgZmxvYXRpbmcgcG9pbnQuXG4gICAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9tb21lbnQvbW9tZW50L3B1bGwvMTg3MVxuICAgICAgICByZXR1cm4gLU1hdGgucm91bmQobS5fZC5nZXRUaW1lem9uZU9mZnNldCgpIC8gMTUpICogMTU7XG4gICAgfVxuXG4gICAgLy8gSE9PS1NcblxuICAgIC8vIFRoaXMgZnVuY3Rpb24gd2lsbCBiZSBjYWxsZWQgd2hlbmV2ZXIgYSBtb21lbnQgaXMgbXV0YXRlZC5cbiAgICAvLyBJdCBpcyBpbnRlbmRlZCB0byBrZWVwIHRoZSBvZmZzZXQgaW4gc3luYyB3aXRoIHRoZSB0aW1lem9uZS5cbiAgICBob29rcy51cGRhdGVPZmZzZXQgPSBmdW5jdGlvbiAoKSB7fTtcblxuICAgIC8vIE1PTUVOVFNcblxuICAgIC8vIGtlZXBMb2NhbFRpbWUgPSB0cnVlIG1lYW5zIG9ubHkgY2hhbmdlIHRoZSB0aW1lem9uZSwgd2l0aG91dFxuICAgIC8vIGFmZmVjdGluZyB0aGUgbG9jYWwgaG91ci4gU28gNTozMToyNiArMDMwMCAtLVt1dGNPZmZzZXQoMiwgdHJ1ZSldLS0+XG4gICAgLy8gNTozMToyNiArMDIwMCBJdCBpcyBwb3NzaWJsZSB0aGF0IDU6MzE6MjYgZG9lc24ndCBleGlzdCB3aXRoIG9mZnNldFxuICAgIC8vICswMjAwLCBzbyB3ZSBhZGp1c3QgdGhlIHRpbWUgYXMgbmVlZGVkLCB0byBiZSB2YWxpZC5cbiAgICAvL1xuICAgIC8vIEtlZXBpbmcgdGhlIHRpbWUgYWN0dWFsbHkgYWRkcy9zdWJ0cmFjdHMgKG9uZSBob3VyKVxuICAgIC8vIGZyb20gdGhlIGFjdHVhbCByZXByZXNlbnRlZCB0aW1lLiBUaGF0IGlzIHdoeSB3ZSBjYWxsIHVwZGF0ZU9mZnNldFxuICAgIC8vIGEgc2Vjb25kIHRpbWUuIEluIGNhc2UgaXQgd2FudHMgdXMgdG8gY2hhbmdlIHRoZSBvZmZzZXQgYWdhaW5cbiAgICAvLyBfY2hhbmdlSW5Qcm9ncmVzcyA9PSB0cnVlIGNhc2UsIHRoZW4gd2UgaGF2ZSB0byBhZGp1c3QsIGJlY2F1c2VcbiAgICAvLyB0aGVyZSBpcyBubyBzdWNoIHRpbWUgaW4gdGhlIGdpdmVuIHRpbWV6b25lLlxuICAgIGZ1bmN0aW9uIGdldFNldE9mZnNldCAoaW5wdXQsIGtlZXBMb2NhbFRpbWUsIGtlZXBNaW51dGVzKSB7XG4gICAgICAgIHZhciBvZmZzZXQgPSB0aGlzLl9vZmZzZXQgfHwgMCxcbiAgICAgICAgICAgIGxvY2FsQWRqdXN0O1xuICAgICAgICBpZiAoIXRoaXMuaXNWYWxpZCgpKSB7XG4gICAgICAgICAgICByZXR1cm4gaW5wdXQgIT0gbnVsbCA/IHRoaXMgOiBOYU47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlucHV0ICE9IG51bGwpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgaW5wdXQgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgaW5wdXQgPSBvZmZzZXRGcm9tU3RyaW5nKG1hdGNoU2hvcnRPZmZzZXQsIGlucHV0KTtcbiAgICAgICAgICAgICAgICBpZiAoaW5wdXQgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChNYXRoLmFicyhpbnB1dCkgPCAxNiAmJiAha2VlcE1pbnV0ZXMpIHtcbiAgICAgICAgICAgICAgICBpbnB1dCA9IGlucHV0ICogNjA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIXRoaXMuX2lzVVRDICYmIGtlZXBMb2NhbFRpbWUpIHtcbiAgICAgICAgICAgICAgICBsb2NhbEFkanVzdCA9IGdldERhdGVPZmZzZXQodGhpcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLl9vZmZzZXQgPSBpbnB1dDtcbiAgICAgICAgICAgIHRoaXMuX2lzVVRDID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmIChsb2NhbEFkanVzdCAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hZGQobG9jYWxBZGp1c3QsICdtJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAob2Zmc2V0ICE9PSBpbnB1dCkge1xuICAgICAgICAgICAgICAgIGlmICgha2VlcExvY2FsVGltZSB8fCB0aGlzLl9jaGFuZ2VJblByb2dyZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgIGFkZFN1YnRyYWN0KHRoaXMsIGNyZWF0ZUR1cmF0aW9uKGlucHV0IC0gb2Zmc2V0LCAnbScpLCAxLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICghdGhpcy5fY2hhbmdlSW5Qcm9ncmVzcykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9jaGFuZ2VJblByb2dyZXNzID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgaG9va3MudXBkYXRlT2Zmc2V0KHRoaXMsIHRydWUpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9jaGFuZ2VJblByb2dyZXNzID0gbnVsbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9pc1VUQyA/IG9mZnNldCA6IGdldERhdGVPZmZzZXQodGhpcyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRTZXRab25lIChpbnB1dCwga2VlcExvY2FsVGltZSkge1xuICAgICAgICBpZiAoaW5wdXQgIT0gbnVsbCkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBpbnB1dCAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICBpbnB1dCA9IC1pbnB1dDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy51dGNPZmZzZXQoaW5wdXQsIGtlZXBMb2NhbFRpbWUpO1xuXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiAtdGhpcy51dGNPZmZzZXQoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNldE9mZnNldFRvVVRDIChrZWVwTG9jYWxUaW1lKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnV0Y09mZnNldCgwLCBrZWVwTG9jYWxUaW1lKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzZXRPZmZzZXRUb0xvY2FsIChrZWVwTG9jYWxUaW1lKSB7XG4gICAgICAgIGlmICh0aGlzLl9pc1VUQykge1xuICAgICAgICAgICAgdGhpcy51dGNPZmZzZXQoMCwga2VlcExvY2FsVGltZSk7XG4gICAgICAgICAgICB0aGlzLl9pc1VUQyA9IGZhbHNlO1xuXG4gICAgICAgICAgICBpZiAoa2VlcExvY2FsVGltZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc3VidHJhY3QoZ2V0RGF0ZU9mZnNldCh0aGlzKSwgJ20nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzZXRPZmZzZXRUb1BhcnNlZE9mZnNldCAoKSB7XG4gICAgICAgIGlmICh0aGlzLl90em0gIT0gbnVsbCkge1xuICAgICAgICAgICAgdGhpcy51dGNPZmZzZXQodGhpcy5fdHptLCBmYWxzZSwgdHJ1ZSk7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMuX2kgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICB2YXIgdFpvbmUgPSBvZmZzZXRGcm9tU3RyaW5nKG1hdGNoT2Zmc2V0LCB0aGlzLl9pKTtcbiAgICAgICAgICAgIGlmICh0Wm9uZSAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy51dGNPZmZzZXQodFpvbmUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy51dGNPZmZzZXQoMCwgdHJ1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaGFzQWxpZ25lZEhvdXJPZmZzZXQgKGlucHV0KSB7XG4gICAgICAgIGlmICghdGhpcy5pc1ZhbGlkKCkpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpbnB1dCA9IGlucHV0ID8gY3JlYXRlTG9jYWwoaW5wdXQpLnV0Y09mZnNldCgpIDogMDtcblxuICAgICAgICByZXR1cm4gKHRoaXMudXRjT2Zmc2V0KCkgLSBpbnB1dCkgJSA2MCA9PT0gMDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpc0RheWxpZ2h0U2F2aW5nVGltZSAoKSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICB0aGlzLnV0Y09mZnNldCgpID4gdGhpcy5jbG9uZSgpLm1vbnRoKDApLnV0Y09mZnNldCgpIHx8XG4gICAgICAgICAgICB0aGlzLnV0Y09mZnNldCgpID4gdGhpcy5jbG9uZSgpLm1vbnRoKDUpLnV0Y09mZnNldCgpXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaXNEYXlsaWdodFNhdmluZ1RpbWVTaGlmdGVkICgpIHtcbiAgICAgICAgaWYgKCFpc1VuZGVmaW5lZCh0aGlzLl9pc0RTVFNoaWZ0ZWQpKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5faXNEU1RTaGlmdGVkO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGMgPSB7fTtcblxuICAgICAgICBjb3B5Q29uZmlnKGMsIHRoaXMpO1xuICAgICAgICBjID0gcHJlcGFyZUNvbmZpZyhjKTtcblxuICAgICAgICBpZiAoYy5fYSkge1xuICAgICAgICAgICAgdmFyIG90aGVyID0gYy5faXNVVEMgPyBjcmVhdGVVVEMoYy5fYSkgOiBjcmVhdGVMb2NhbChjLl9hKTtcbiAgICAgICAgICAgIHRoaXMuX2lzRFNUU2hpZnRlZCA9IHRoaXMuaXNWYWxpZCgpICYmXG4gICAgICAgICAgICAgICAgY29tcGFyZUFycmF5cyhjLl9hLCBvdGhlci50b0FycmF5KCkpID4gMDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX2lzRFNUU2hpZnRlZCA9IGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX2lzRFNUU2hpZnRlZDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpc0xvY2FsICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaXNWYWxpZCgpID8gIXRoaXMuX2lzVVRDIDogZmFsc2U7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaXNVdGNPZmZzZXQgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pc1ZhbGlkKCkgPyB0aGlzLl9pc1VUQyA6IGZhbHNlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGlzVXRjICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaXNWYWxpZCgpID8gdGhpcy5faXNVVEMgJiYgdGhpcy5fb2Zmc2V0ID09PSAwIDogZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gQVNQLk5FVCBqc29uIGRhdGUgZm9ybWF0IHJlZ2V4XG4gICAgdmFyIGFzcE5ldFJlZ2V4ID0gL14oXFwtfFxcKyk/KD86KFxcZCopWy4gXSk/KFxcZCspXFw6KFxcZCspKD86XFw6KFxcZCspKFxcLlxcZCopPyk/JC87XG5cbiAgICAvLyBmcm9tIGh0dHA6Ly9kb2NzLmNsb3N1cmUtbGlicmFyeS5nb29nbGVjb2RlLmNvbS9naXQvY2xvc3VyZV9nb29nX2RhdGVfZGF0ZS5qcy5zb3VyY2UuaHRtbFxuICAgIC8vIHNvbWV3aGF0IG1vcmUgaW4gbGluZSB3aXRoIDQuNC4zLjIgMjAwNCBzcGVjLCBidXQgYWxsb3dzIGRlY2ltYWwgYW55d2hlcmVcbiAgICAvLyBhbmQgZnVydGhlciBtb2RpZmllZCB0byBhbGxvdyBmb3Igc3RyaW5ncyBjb250YWluaW5nIGJvdGggd2VlayBhbmQgZGF5XG4gICAgdmFyIGlzb1JlZ2V4ID0gL14oLXxcXCspP1AoPzooWy0rXT9bMC05LC5dKilZKT8oPzooWy0rXT9bMC05LC5dKilNKT8oPzooWy0rXT9bMC05LC5dKilXKT8oPzooWy0rXT9bMC05LC5dKilEKT8oPzpUKD86KFstK10/WzAtOSwuXSopSCk/KD86KFstK10/WzAtOSwuXSopTSk/KD86KFstK10/WzAtOSwuXSopUyk/KT8kLztcblxuICAgIGZ1bmN0aW9uIGNyZWF0ZUR1cmF0aW9uIChpbnB1dCwga2V5KSB7XG4gICAgICAgIHZhciBkdXJhdGlvbiA9IGlucHV0LFxuICAgICAgICAgICAgLy8gbWF0Y2hpbmcgYWdhaW5zdCByZWdleHAgaXMgZXhwZW5zaXZlLCBkbyBpdCBvbiBkZW1hbmRcbiAgICAgICAgICAgIG1hdGNoID0gbnVsbCxcbiAgICAgICAgICAgIHNpZ24sXG4gICAgICAgICAgICByZXQsXG4gICAgICAgICAgICBkaWZmUmVzO1xuXG4gICAgICAgIGlmIChpc0R1cmF0aW9uKGlucHV0KSkge1xuICAgICAgICAgICAgZHVyYXRpb24gPSB7XG4gICAgICAgICAgICAgICAgbXMgOiBpbnB1dC5fbWlsbGlzZWNvbmRzLFxuICAgICAgICAgICAgICAgIGQgIDogaW5wdXQuX2RheXMsXG4gICAgICAgICAgICAgICAgTSAgOiBpbnB1dC5fbW9udGhzXG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2UgaWYgKGlzTnVtYmVyKGlucHV0KSkge1xuICAgICAgICAgICAgZHVyYXRpb24gPSB7fTtcbiAgICAgICAgICAgIGlmIChrZXkpIHtcbiAgICAgICAgICAgICAgICBkdXJhdGlvbltrZXldID0gaW5wdXQ7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGR1cmF0aW9uLm1pbGxpc2Vjb25kcyA9IGlucHV0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKCEhKG1hdGNoID0gYXNwTmV0UmVnZXguZXhlYyhpbnB1dCkpKSB7XG4gICAgICAgICAgICBzaWduID0gKG1hdGNoWzFdID09PSAnLScpID8gLTEgOiAxO1xuICAgICAgICAgICAgZHVyYXRpb24gPSB7XG4gICAgICAgICAgICAgICAgeSAgOiAwLFxuICAgICAgICAgICAgICAgIGQgIDogdG9JbnQobWF0Y2hbREFURV0pICAgICAgICAgICAgICAgICAgICAgICAgICogc2lnbixcbiAgICAgICAgICAgICAgICBoICA6IHRvSW50KG1hdGNoW0hPVVJdKSAgICAgICAgICAgICAgICAgICAgICAgICAqIHNpZ24sXG4gICAgICAgICAgICAgICAgbSAgOiB0b0ludChtYXRjaFtNSU5VVEVdKSAgICAgICAgICAgICAgICAgICAgICAgKiBzaWduLFxuICAgICAgICAgICAgICAgIHMgIDogdG9JbnQobWF0Y2hbU0VDT05EXSkgICAgICAgICAgICAgICAgICAgICAgICogc2lnbixcbiAgICAgICAgICAgICAgICBtcyA6IHRvSW50KGFic1JvdW5kKG1hdGNoW01JTExJU0VDT05EXSAqIDEwMDApKSAqIHNpZ24gLy8gdGhlIG1pbGxpc2Vjb25kIGRlY2ltYWwgcG9pbnQgaXMgaW5jbHVkZWQgaW4gdGhlIG1hdGNoXG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2UgaWYgKCEhKG1hdGNoID0gaXNvUmVnZXguZXhlYyhpbnB1dCkpKSB7XG4gICAgICAgICAgICBzaWduID0gKG1hdGNoWzFdID09PSAnLScpID8gLTEgOiAobWF0Y2hbMV0gPT09ICcrJykgPyAxIDogMTtcbiAgICAgICAgICAgIGR1cmF0aW9uID0ge1xuICAgICAgICAgICAgICAgIHkgOiBwYXJzZUlzbyhtYXRjaFsyXSwgc2lnbiksXG4gICAgICAgICAgICAgICAgTSA6IHBhcnNlSXNvKG1hdGNoWzNdLCBzaWduKSxcbiAgICAgICAgICAgICAgICB3IDogcGFyc2VJc28obWF0Y2hbNF0sIHNpZ24pLFxuICAgICAgICAgICAgICAgIGQgOiBwYXJzZUlzbyhtYXRjaFs1XSwgc2lnbiksXG4gICAgICAgICAgICAgICAgaCA6IHBhcnNlSXNvKG1hdGNoWzZdLCBzaWduKSxcbiAgICAgICAgICAgICAgICBtIDogcGFyc2VJc28obWF0Y2hbN10sIHNpZ24pLFxuICAgICAgICAgICAgICAgIHMgOiBwYXJzZUlzbyhtYXRjaFs4XSwgc2lnbilcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSBpZiAoZHVyYXRpb24gPT0gbnVsbCkgey8vIGNoZWNrcyBmb3IgbnVsbCBvciB1bmRlZmluZWRcbiAgICAgICAgICAgIGR1cmF0aW9uID0ge307XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGR1cmF0aW9uID09PSAnb2JqZWN0JyAmJiAoJ2Zyb20nIGluIGR1cmF0aW9uIHx8ICd0bycgaW4gZHVyYXRpb24pKSB7XG4gICAgICAgICAgICBkaWZmUmVzID0gbW9tZW50c0RpZmZlcmVuY2UoY3JlYXRlTG9jYWwoZHVyYXRpb24uZnJvbSksIGNyZWF0ZUxvY2FsKGR1cmF0aW9uLnRvKSk7XG5cbiAgICAgICAgICAgIGR1cmF0aW9uID0ge307XG4gICAgICAgICAgICBkdXJhdGlvbi5tcyA9IGRpZmZSZXMubWlsbGlzZWNvbmRzO1xuICAgICAgICAgICAgZHVyYXRpb24uTSA9IGRpZmZSZXMubW9udGhzO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0ID0gbmV3IER1cmF0aW9uKGR1cmF0aW9uKTtcblxuICAgICAgICBpZiAoaXNEdXJhdGlvbihpbnB1dCkgJiYgaGFzT3duUHJvcChpbnB1dCwgJ19sb2NhbGUnKSkge1xuICAgICAgICAgICAgcmV0Ll9sb2NhbGUgPSBpbnB1dC5fbG9jYWxlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG5cbiAgICBjcmVhdGVEdXJhdGlvbi5mbiA9IER1cmF0aW9uLnByb3RvdHlwZTtcbiAgICBjcmVhdGVEdXJhdGlvbi5pbnZhbGlkID0gY3JlYXRlSW52YWxpZCQxO1xuXG4gICAgZnVuY3Rpb24gcGFyc2VJc28gKGlucCwgc2lnbikge1xuICAgICAgICAvLyBXZSdkIG5vcm1hbGx5IHVzZSB+fmlucCBmb3IgdGhpcywgYnV0IHVuZm9ydHVuYXRlbHkgaXQgYWxzb1xuICAgICAgICAvLyBjb252ZXJ0cyBmbG9hdHMgdG8gaW50cy5cbiAgICAgICAgLy8gaW5wIG1heSBiZSB1bmRlZmluZWQsIHNvIGNhcmVmdWwgY2FsbGluZyByZXBsYWNlIG9uIGl0LlxuICAgICAgICB2YXIgcmVzID0gaW5wICYmIHBhcnNlRmxvYXQoaW5wLnJlcGxhY2UoJywnLCAnLicpKTtcbiAgICAgICAgLy8gYXBwbHkgc2lnbiB3aGlsZSB3ZSdyZSBhdCBpdFxuICAgICAgICByZXR1cm4gKGlzTmFOKHJlcykgPyAwIDogcmVzKSAqIHNpZ247XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcG9zaXRpdmVNb21lbnRzRGlmZmVyZW5jZShiYXNlLCBvdGhlcikge1xuICAgICAgICB2YXIgcmVzID0ge21pbGxpc2Vjb25kczogMCwgbW9udGhzOiAwfTtcblxuICAgICAgICByZXMubW9udGhzID0gb3RoZXIubW9udGgoKSAtIGJhc2UubW9udGgoKSArXG4gICAgICAgICAgICAob3RoZXIueWVhcigpIC0gYmFzZS55ZWFyKCkpICogMTI7XG4gICAgICAgIGlmIChiYXNlLmNsb25lKCkuYWRkKHJlcy5tb250aHMsICdNJykuaXNBZnRlcihvdGhlcikpIHtcbiAgICAgICAgICAgIC0tcmVzLm1vbnRocztcbiAgICAgICAgfVxuXG4gICAgICAgIHJlcy5taWxsaXNlY29uZHMgPSArb3RoZXIgLSArKGJhc2UuY2xvbmUoKS5hZGQocmVzLm1vbnRocywgJ00nKSk7XG5cbiAgICAgICAgcmV0dXJuIHJlcztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBtb21lbnRzRGlmZmVyZW5jZShiYXNlLCBvdGhlcikge1xuICAgICAgICB2YXIgcmVzO1xuICAgICAgICBpZiAoIShiYXNlLmlzVmFsaWQoKSAmJiBvdGhlci5pc1ZhbGlkKCkpKSB7XG4gICAgICAgICAgICByZXR1cm4ge21pbGxpc2Vjb25kczogMCwgbW9udGhzOiAwfTtcbiAgICAgICAgfVxuXG4gICAgICAgIG90aGVyID0gY2xvbmVXaXRoT2Zmc2V0KG90aGVyLCBiYXNlKTtcbiAgICAgICAgaWYgKGJhc2UuaXNCZWZvcmUob3RoZXIpKSB7XG4gICAgICAgICAgICByZXMgPSBwb3NpdGl2ZU1vbWVudHNEaWZmZXJlbmNlKGJhc2UsIG90aGVyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlcyA9IHBvc2l0aXZlTW9tZW50c0RpZmZlcmVuY2Uob3RoZXIsIGJhc2UpO1xuICAgICAgICAgICAgcmVzLm1pbGxpc2Vjb25kcyA9IC1yZXMubWlsbGlzZWNvbmRzO1xuICAgICAgICAgICAgcmVzLm1vbnRocyA9IC1yZXMubW9udGhzO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlcztcbiAgICB9XG5cbiAgICAvLyBUT0RPOiByZW1vdmUgJ25hbWUnIGFyZyBhZnRlciBkZXByZWNhdGlvbiBpcyByZW1vdmVkXG4gICAgZnVuY3Rpb24gY3JlYXRlQWRkZXIoZGlyZWN0aW9uLCBuYW1lKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAodmFsLCBwZXJpb2QpIHtcbiAgICAgICAgICAgIHZhciBkdXIsIHRtcDtcbiAgICAgICAgICAgIC8vaW52ZXJ0IHRoZSBhcmd1bWVudHMsIGJ1dCBjb21wbGFpbiBhYm91dCBpdFxuICAgICAgICAgICAgaWYgKHBlcmlvZCAhPT0gbnVsbCAmJiAhaXNOYU4oK3BlcmlvZCkpIHtcbiAgICAgICAgICAgICAgICBkZXByZWNhdGVTaW1wbGUobmFtZSwgJ21vbWVudCgpLicgKyBuYW1lICArICcocGVyaW9kLCBudW1iZXIpIGlzIGRlcHJlY2F0ZWQuIFBsZWFzZSB1c2UgbW9tZW50KCkuJyArIG5hbWUgKyAnKG51bWJlciwgcGVyaW9kKS4gJyArXG4gICAgICAgICAgICAgICAgJ1NlZSBodHRwOi8vbW9tZW50anMuY29tL2d1aWRlcy8jL3dhcm5pbmdzL2FkZC1pbnZlcnRlZC1wYXJhbS8gZm9yIG1vcmUgaW5mby4nKTtcbiAgICAgICAgICAgICAgICB0bXAgPSB2YWw7IHZhbCA9IHBlcmlvZDsgcGVyaW9kID0gdG1wO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YWwgPSB0eXBlb2YgdmFsID09PSAnc3RyaW5nJyA/ICt2YWwgOiB2YWw7XG4gICAgICAgICAgICBkdXIgPSBjcmVhdGVEdXJhdGlvbih2YWwsIHBlcmlvZCk7XG4gICAgICAgICAgICBhZGRTdWJ0cmFjdCh0aGlzLCBkdXIsIGRpcmVjdGlvbik7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBhZGRTdWJ0cmFjdCAobW9tLCBkdXJhdGlvbiwgaXNBZGRpbmcsIHVwZGF0ZU9mZnNldCkge1xuICAgICAgICB2YXIgbWlsbGlzZWNvbmRzID0gZHVyYXRpb24uX21pbGxpc2Vjb25kcyxcbiAgICAgICAgICAgIGRheXMgPSBhYnNSb3VuZChkdXJhdGlvbi5fZGF5cyksXG4gICAgICAgICAgICBtb250aHMgPSBhYnNSb3VuZChkdXJhdGlvbi5fbW9udGhzKTtcblxuICAgICAgICBpZiAoIW1vbS5pc1ZhbGlkKCkpIHtcbiAgICAgICAgICAgIC8vIE5vIG9wXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB1cGRhdGVPZmZzZXQgPSB1cGRhdGVPZmZzZXQgPT0gbnVsbCA/IHRydWUgOiB1cGRhdGVPZmZzZXQ7XG5cbiAgICAgICAgaWYgKG1vbnRocykge1xuICAgICAgICAgICAgc2V0TW9udGgobW9tLCBnZXQobW9tLCAnTW9udGgnKSArIG1vbnRocyAqIGlzQWRkaW5nKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZGF5cykge1xuICAgICAgICAgICAgc2V0JDEobW9tLCAnRGF0ZScsIGdldChtb20sICdEYXRlJykgKyBkYXlzICogaXNBZGRpbmcpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChtaWxsaXNlY29uZHMpIHtcbiAgICAgICAgICAgIG1vbS5fZC5zZXRUaW1lKG1vbS5fZC52YWx1ZU9mKCkgKyBtaWxsaXNlY29uZHMgKiBpc0FkZGluZyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHVwZGF0ZU9mZnNldCkge1xuICAgICAgICAgICAgaG9va3MudXBkYXRlT2Zmc2V0KG1vbSwgZGF5cyB8fCBtb250aHMpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdmFyIGFkZCAgICAgID0gY3JlYXRlQWRkZXIoMSwgJ2FkZCcpO1xuICAgIHZhciBzdWJ0cmFjdCA9IGNyZWF0ZUFkZGVyKC0xLCAnc3VidHJhY3QnKTtcblxuICAgIGZ1bmN0aW9uIGdldENhbGVuZGFyRm9ybWF0KG15TW9tZW50LCBub3cpIHtcbiAgICAgICAgdmFyIGRpZmYgPSBteU1vbWVudC5kaWZmKG5vdywgJ2RheXMnLCB0cnVlKTtcbiAgICAgICAgcmV0dXJuIGRpZmYgPCAtNiA/ICdzYW1lRWxzZScgOlxuICAgICAgICAgICAgICAgIGRpZmYgPCAtMSA/ICdsYXN0V2VlaycgOlxuICAgICAgICAgICAgICAgIGRpZmYgPCAwID8gJ2xhc3REYXknIDpcbiAgICAgICAgICAgICAgICBkaWZmIDwgMSA/ICdzYW1lRGF5JyA6XG4gICAgICAgICAgICAgICAgZGlmZiA8IDIgPyAnbmV4dERheScgOlxuICAgICAgICAgICAgICAgIGRpZmYgPCA3ID8gJ25leHRXZWVrJyA6ICdzYW1lRWxzZSc7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY2FsZW5kYXIkMSAodGltZSwgZm9ybWF0cykge1xuICAgICAgICAvLyBXZSB3YW50IHRvIGNvbXBhcmUgdGhlIHN0YXJ0IG9mIHRvZGF5LCB2cyB0aGlzLlxuICAgICAgICAvLyBHZXR0aW5nIHN0YXJ0LW9mLXRvZGF5IGRlcGVuZHMgb24gd2hldGhlciB3ZSdyZSBsb2NhbC91dGMvb2Zmc2V0IG9yIG5vdC5cbiAgICAgICAgdmFyIG5vdyA9IHRpbWUgfHwgY3JlYXRlTG9jYWwoKSxcbiAgICAgICAgICAgIHNvZCA9IGNsb25lV2l0aE9mZnNldChub3csIHRoaXMpLnN0YXJ0T2YoJ2RheScpLFxuICAgICAgICAgICAgZm9ybWF0ID0gaG9va3MuY2FsZW5kYXJGb3JtYXQodGhpcywgc29kKSB8fCAnc2FtZUVsc2UnO1xuXG4gICAgICAgIHZhciBvdXRwdXQgPSBmb3JtYXRzICYmIChpc0Z1bmN0aW9uKGZvcm1hdHNbZm9ybWF0XSkgPyBmb3JtYXRzW2Zvcm1hdF0uY2FsbCh0aGlzLCBub3cpIDogZm9ybWF0c1tmb3JtYXRdKTtcblxuICAgICAgICByZXR1cm4gdGhpcy5mb3JtYXQob3V0cHV0IHx8IHRoaXMubG9jYWxlRGF0YSgpLmNhbGVuZGFyKGZvcm1hdCwgdGhpcywgY3JlYXRlTG9jYWwobm93KSkpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNsb25lICgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBNb21lbnQodGhpcyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaXNBZnRlciAoaW5wdXQsIHVuaXRzKSB7XG4gICAgICAgIHZhciBsb2NhbElucHV0ID0gaXNNb21lbnQoaW5wdXQpID8gaW5wdXQgOiBjcmVhdGVMb2NhbChpbnB1dCk7XG4gICAgICAgIGlmICghKHRoaXMuaXNWYWxpZCgpICYmIGxvY2FsSW5wdXQuaXNWYWxpZCgpKSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHVuaXRzID0gbm9ybWFsaXplVW5pdHMoIWlzVW5kZWZpbmVkKHVuaXRzKSA/IHVuaXRzIDogJ21pbGxpc2Vjb25kJyk7XG4gICAgICAgIGlmICh1bml0cyA9PT0gJ21pbGxpc2Vjb25kJykge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMudmFsdWVPZigpID4gbG9jYWxJbnB1dC52YWx1ZU9mKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gbG9jYWxJbnB1dC52YWx1ZU9mKCkgPCB0aGlzLmNsb25lKCkuc3RhcnRPZih1bml0cykudmFsdWVPZigpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaXNCZWZvcmUgKGlucHV0LCB1bml0cykge1xuICAgICAgICB2YXIgbG9jYWxJbnB1dCA9IGlzTW9tZW50KGlucHV0KSA/IGlucHV0IDogY3JlYXRlTG9jYWwoaW5wdXQpO1xuICAgICAgICBpZiAoISh0aGlzLmlzVmFsaWQoKSAmJiBsb2NhbElucHV0LmlzVmFsaWQoKSkpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICB1bml0cyA9IG5vcm1hbGl6ZVVuaXRzKCFpc1VuZGVmaW5lZCh1bml0cykgPyB1bml0cyA6ICdtaWxsaXNlY29uZCcpO1xuICAgICAgICBpZiAodW5pdHMgPT09ICdtaWxsaXNlY29uZCcpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnZhbHVlT2YoKSA8IGxvY2FsSW5wdXQudmFsdWVPZigpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2xvbmUoKS5lbmRPZih1bml0cykudmFsdWVPZigpIDwgbG9jYWxJbnB1dC52YWx1ZU9mKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpc0JldHdlZW4gKGZyb20sIHRvLCB1bml0cywgaW5jbHVzaXZpdHkpIHtcbiAgICAgICAgaW5jbHVzaXZpdHkgPSBpbmNsdXNpdml0eSB8fCAnKCknO1xuICAgICAgICByZXR1cm4gKGluY2x1c2l2aXR5WzBdID09PSAnKCcgPyB0aGlzLmlzQWZ0ZXIoZnJvbSwgdW5pdHMpIDogIXRoaXMuaXNCZWZvcmUoZnJvbSwgdW5pdHMpKSAmJlxuICAgICAgICAgICAgKGluY2x1c2l2aXR5WzFdID09PSAnKScgPyB0aGlzLmlzQmVmb3JlKHRvLCB1bml0cykgOiAhdGhpcy5pc0FmdGVyKHRvLCB1bml0cykpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGlzU2FtZSAoaW5wdXQsIHVuaXRzKSB7XG4gICAgICAgIHZhciBsb2NhbElucHV0ID0gaXNNb21lbnQoaW5wdXQpID8gaW5wdXQgOiBjcmVhdGVMb2NhbChpbnB1dCksXG4gICAgICAgICAgICBpbnB1dE1zO1xuICAgICAgICBpZiAoISh0aGlzLmlzVmFsaWQoKSAmJiBsb2NhbElucHV0LmlzVmFsaWQoKSkpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICB1bml0cyA9IG5vcm1hbGl6ZVVuaXRzKHVuaXRzIHx8ICdtaWxsaXNlY29uZCcpO1xuICAgICAgICBpZiAodW5pdHMgPT09ICdtaWxsaXNlY29uZCcpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnZhbHVlT2YoKSA9PT0gbG9jYWxJbnB1dC52YWx1ZU9mKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpbnB1dE1zID0gbG9jYWxJbnB1dC52YWx1ZU9mKCk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jbG9uZSgpLnN0YXJ0T2YodW5pdHMpLnZhbHVlT2YoKSA8PSBpbnB1dE1zICYmIGlucHV0TXMgPD0gdGhpcy5jbG9uZSgpLmVuZE9mKHVuaXRzKS52YWx1ZU9mKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpc1NhbWVPckFmdGVyIChpbnB1dCwgdW5pdHMpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaXNTYW1lKGlucHV0LCB1bml0cykgfHwgdGhpcy5pc0FmdGVyKGlucHV0LHVuaXRzKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpc1NhbWVPckJlZm9yZSAoaW5wdXQsIHVuaXRzKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmlzU2FtZShpbnB1dCwgdW5pdHMpIHx8IHRoaXMuaXNCZWZvcmUoaW5wdXQsdW5pdHMpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGRpZmYgKGlucHV0LCB1bml0cywgYXNGbG9hdCkge1xuICAgICAgICB2YXIgdGhhdCxcbiAgICAgICAgICAgIHpvbmVEZWx0YSxcbiAgICAgICAgICAgIG91dHB1dDtcblxuICAgICAgICBpZiAoIXRoaXMuaXNWYWxpZCgpKSB7XG4gICAgICAgICAgICByZXR1cm4gTmFOO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhhdCA9IGNsb25lV2l0aE9mZnNldChpbnB1dCwgdGhpcyk7XG5cbiAgICAgICAgaWYgKCF0aGF0LmlzVmFsaWQoKSkge1xuICAgICAgICAgICAgcmV0dXJuIE5hTjtcbiAgICAgICAgfVxuXG4gICAgICAgIHpvbmVEZWx0YSA9ICh0aGF0LnV0Y09mZnNldCgpIC0gdGhpcy51dGNPZmZzZXQoKSkgKiA2ZTQ7XG5cbiAgICAgICAgdW5pdHMgPSBub3JtYWxpemVVbml0cyh1bml0cyk7XG5cbiAgICAgICAgc3dpdGNoICh1bml0cykge1xuICAgICAgICAgICAgY2FzZSAneWVhcic6IG91dHB1dCA9IG1vbnRoRGlmZih0aGlzLCB0aGF0KSAvIDEyOyBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ21vbnRoJzogb3V0cHV0ID0gbW9udGhEaWZmKHRoaXMsIHRoYXQpOyBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3F1YXJ0ZXInOiBvdXRwdXQgPSBtb250aERpZmYodGhpcywgdGhhdCkgLyAzOyBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3NlY29uZCc6IG91dHB1dCA9ICh0aGlzIC0gdGhhdCkgLyAxZTM7IGJyZWFrOyAvLyAxMDAwXG4gICAgICAgICAgICBjYXNlICdtaW51dGUnOiBvdXRwdXQgPSAodGhpcyAtIHRoYXQpIC8gNmU0OyBicmVhazsgLy8gMTAwMCAqIDYwXG4gICAgICAgICAgICBjYXNlICdob3VyJzogb3V0cHV0ID0gKHRoaXMgLSB0aGF0KSAvIDM2ZTU7IGJyZWFrOyAvLyAxMDAwICogNjAgKiA2MFxuICAgICAgICAgICAgY2FzZSAnZGF5Jzogb3V0cHV0ID0gKHRoaXMgLSB0aGF0IC0gem9uZURlbHRhKSAvIDg2NGU1OyBicmVhazsgLy8gMTAwMCAqIDYwICogNjAgKiAyNCwgbmVnYXRlIGRzdFxuICAgICAgICAgICAgY2FzZSAnd2Vlayc6IG91dHB1dCA9ICh0aGlzIC0gdGhhdCAtIHpvbmVEZWx0YSkgLyA2MDQ4ZTU7IGJyZWFrOyAvLyAxMDAwICogNjAgKiA2MCAqIDI0ICogNywgbmVnYXRlIGRzdFxuICAgICAgICAgICAgZGVmYXVsdDogb3V0cHV0ID0gdGhpcyAtIHRoYXQ7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYXNGbG9hdCA/IG91dHB1dCA6IGFic0Zsb29yKG91dHB1dCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbW9udGhEaWZmIChhLCBiKSB7XG4gICAgICAgIC8vIGRpZmZlcmVuY2UgaW4gbW9udGhzXG4gICAgICAgIHZhciB3aG9sZU1vbnRoRGlmZiA9ICgoYi55ZWFyKCkgLSBhLnllYXIoKSkgKiAxMikgKyAoYi5tb250aCgpIC0gYS5tb250aCgpKSxcbiAgICAgICAgICAgIC8vIGIgaXMgaW4gKGFuY2hvciAtIDEgbW9udGgsIGFuY2hvciArIDEgbW9udGgpXG4gICAgICAgICAgICBhbmNob3IgPSBhLmNsb25lKCkuYWRkKHdob2xlTW9udGhEaWZmLCAnbW9udGhzJyksXG4gICAgICAgICAgICBhbmNob3IyLCBhZGp1c3Q7XG5cbiAgICAgICAgaWYgKGIgLSBhbmNob3IgPCAwKSB7XG4gICAgICAgICAgICBhbmNob3IyID0gYS5jbG9uZSgpLmFkZCh3aG9sZU1vbnRoRGlmZiAtIDEsICdtb250aHMnKTtcbiAgICAgICAgICAgIC8vIGxpbmVhciBhY3Jvc3MgdGhlIG1vbnRoXG4gICAgICAgICAgICBhZGp1c3QgPSAoYiAtIGFuY2hvcikgLyAoYW5jaG9yIC0gYW5jaG9yMik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhbmNob3IyID0gYS5jbG9uZSgpLmFkZCh3aG9sZU1vbnRoRGlmZiArIDEsICdtb250aHMnKTtcbiAgICAgICAgICAgIC8vIGxpbmVhciBhY3Jvc3MgdGhlIG1vbnRoXG4gICAgICAgICAgICBhZGp1c3QgPSAoYiAtIGFuY2hvcikgLyAoYW5jaG9yMiAtIGFuY2hvcik7XG4gICAgICAgIH1cblxuICAgICAgICAvL2NoZWNrIGZvciBuZWdhdGl2ZSB6ZXJvLCByZXR1cm4gemVybyBpZiBuZWdhdGl2ZSB6ZXJvXG4gICAgICAgIHJldHVybiAtKHdob2xlTW9udGhEaWZmICsgYWRqdXN0KSB8fCAwO1xuICAgIH1cblxuICAgIGhvb2tzLmRlZmF1bHRGb3JtYXQgPSAnWVlZWS1NTS1ERFRISDptbTpzc1onO1xuICAgIGhvb2tzLmRlZmF1bHRGb3JtYXRVdGMgPSAnWVlZWS1NTS1ERFRISDptbTpzc1taXSc7XG5cbiAgICBmdW5jdGlvbiB0b1N0cmluZyAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNsb25lKCkubG9jYWxlKCdlbicpLmZvcm1hdCgnZGRkIE1NTSBERCBZWVlZIEhIOm1tOnNzIFtHTVRdWlonKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB0b0lTT1N0cmluZyhrZWVwT2Zmc2V0KSB7XG4gICAgICAgIGlmICghdGhpcy5pc1ZhbGlkKCkpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHZhciB1dGMgPSBrZWVwT2Zmc2V0ICE9PSB0cnVlO1xuICAgICAgICB2YXIgbSA9IHV0YyA/IHRoaXMuY2xvbmUoKS51dGMoKSA6IHRoaXM7XG4gICAgICAgIGlmIChtLnllYXIoKSA8IDAgfHwgbS55ZWFyKCkgPiA5OTk5KSB7XG4gICAgICAgICAgICByZXR1cm4gZm9ybWF0TW9tZW50KG0sIHV0YyA/ICdZWVlZWVktTU0tRERbVF1ISDptbTpzcy5TU1NbWl0nIDogJ1lZWVlZWS1NTS1ERFtUXUhIOm1tOnNzLlNTU1onKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaXNGdW5jdGlvbihEYXRlLnByb3RvdHlwZS50b0lTT1N0cmluZykpIHtcbiAgICAgICAgICAgIC8vIG5hdGl2ZSBpbXBsZW1lbnRhdGlvbiBpcyB+NTB4IGZhc3RlciwgdXNlIGl0IHdoZW4gd2UgY2FuXG4gICAgICAgICAgICBpZiAodXRjKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMudG9EYXRlKCkudG9JU09TdHJpbmcoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBEYXRlKHRoaXMudmFsdWVPZigpICsgdGhpcy51dGNPZmZzZXQoKSAqIDYwICogMTAwMCkudG9JU09TdHJpbmcoKS5yZXBsYWNlKCdaJywgZm9ybWF0TW9tZW50KG0sICdaJykpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmb3JtYXRNb21lbnQobSwgdXRjID8gJ1lZWVktTU0tRERbVF1ISDptbTpzcy5TU1NbWl0nIDogJ1lZWVktTU0tRERbVF1ISDptbTpzcy5TU1NaJyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIGEgaHVtYW4gcmVhZGFibGUgcmVwcmVzZW50YXRpb24gb2YgYSBtb21lbnQgdGhhdCBjYW5cbiAgICAgKiBhbHNvIGJlIGV2YWx1YXRlZCB0byBnZXQgYSBuZXcgbW9tZW50IHdoaWNoIGlzIHRoZSBzYW1lXG4gICAgICpcbiAgICAgKiBAbGluayBodHRwczovL25vZGVqcy5vcmcvZGlzdC9sYXRlc3QvZG9jcy9hcGkvdXRpbC5odG1sI3V0aWxfY3VzdG9tX2luc3BlY3RfZnVuY3Rpb25fb25fb2JqZWN0c1xuICAgICAqL1xuICAgIGZ1bmN0aW9uIGluc3BlY3QgKCkge1xuICAgICAgICBpZiAoIXRoaXMuaXNWYWxpZCgpKSB7XG4gICAgICAgICAgICByZXR1cm4gJ21vbWVudC5pbnZhbGlkKC8qICcgKyB0aGlzLl9pICsgJyAqLyknO1xuICAgICAgICB9XG4gICAgICAgIHZhciBmdW5jID0gJ21vbWVudCc7XG4gICAgICAgIHZhciB6b25lID0gJyc7XG4gICAgICAgIGlmICghdGhpcy5pc0xvY2FsKCkpIHtcbiAgICAgICAgICAgIGZ1bmMgPSB0aGlzLnV0Y09mZnNldCgpID09PSAwID8gJ21vbWVudC51dGMnIDogJ21vbWVudC5wYXJzZVpvbmUnO1xuICAgICAgICAgICAgem9uZSA9ICdaJztcbiAgICAgICAgfVxuICAgICAgICB2YXIgcHJlZml4ID0gJ1snICsgZnVuYyArICcoXCJdJztcbiAgICAgICAgdmFyIHllYXIgPSAoMCA8PSB0aGlzLnllYXIoKSAmJiB0aGlzLnllYXIoKSA8PSA5OTk5KSA/ICdZWVlZJyA6ICdZWVlZWVknO1xuICAgICAgICB2YXIgZGF0ZXRpbWUgPSAnLU1NLUREW1RdSEg6bW06c3MuU1NTJztcbiAgICAgICAgdmFyIHN1ZmZpeCA9IHpvbmUgKyAnW1wiKV0nO1xuXG4gICAgICAgIHJldHVybiB0aGlzLmZvcm1hdChwcmVmaXggKyB5ZWFyICsgZGF0ZXRpbWUgKyBzdWZmaXgpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGZvcm1hdCAoaW5wdXRTdHJpbmcpIHtcbiAgICAgICAgaWYgKCFpbnB1dFN0cmluZykge1xuICAgICAgICAgICAgaW5wdXRTdHJpbmcgPSB0aGlzLmlzVXRjKCkgPyBob29rcy5kZWZhdWx0Rm9ybWF0VXRjIDogaG9va3MuZGVmYXVsdEZvcm1hdDtcbiAgICAgICAgfVxuICAgICAgICB2YXIgb3V0cHV0ID0gZm9ybWF0TW9tZW50KHRoaXMsIGlucHV0U3RyaW5nKTtcbiAgICAgICAgcmV0dXJuIHRoaXMubG9jYWxlRGF0YSgpLnBvc3Rmb3JtYXQob3V0cHV0KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBmcm9tICh0aW1lLCB3aXRob3V0U3VmZml4KSB7XG4gICAgICAgIGlmICh0aGlzLmlzVmFsaWQoKSAmJlxuICAgICAgICAgICAgICAgICgoaXNNb21lbnQodGltZSkgJiYgdGltZS5pc1ZhbGlkKCkpIHx8XG4gICAgICAgICAgICAgICAgIGNyZWF0ZUxvY2FsKHRpbWUpLmlzVmFsaWQoKSkpIHtcbiAgICAgICAgICAgIHJldHVybiBjcmVhdGVEdXJhdGlvbih7dG86IHRoaXMsIGZyb206IHRpbWV9KS5sb2NhbGUodGhpcy5sb2NhbGUoKSkuaHVtYW5pemUoIXdpdGhvdXRTdWZmaXgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubG9jYWxlRGF0YSgpLmludmFsaWREYXRlKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBmcm9tTm93ICh3aXRob3V0U3VmZml4KSB7XG4gICAgICAgIHJldHVybiB0aGlzLmZyb20oY3JlYXRlTG9jYWwoKSwgd2l0aG91dFN1ZmZpeCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdG8gKHRpbWUsIHdpdGhvdXRTdWZmaXgpIHtcbiAgICAgICAgaWYgKHRoaXMuaXNWYWxpZCgpICYmXG4gICAgICAgICAgICAgICAgKChpc01vbWVudCh0aW1lKSAmJiB0aW1lLmlzVmFsaWQoKSkgfHxcbiAgICAgICAgICAgICAgICAgY3JlYXRlTG9jYWwodGltZSkuaXNWYWxpZCgpKSkge1xuICAgICAgICAgICAgcmV0dXJuIGNyZWF0ZUR1cmF0aW9uKHtmcm9tOiB0aGlzLCB0bzogdGltZX0pLmxvY2FsZSh0aGlzLmxvY2FsZSgpKS5odW1hbml6ZSghd2l0aG91dFN1ZmZpeCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5sb2NhbGVEYXRhKCkuaW52YWxpZERhdGUoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHRvTm93ICh3aXRob3V0U3VmZml4KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRvKGNyZWF0ZUxvY2FsKCksIHdpdGhvdXRTdWZmaXgpO1xuICAgIH1cblxuICAgIC8vIElmIHBhc3NlZCBhIGxvY2FsZSBrZXksIGl0IHdpbGwgc2V0IHRoZSBsb2NhbGUgZm9yIHRoaXNcbiAgICAvLyBpbnN0YW5jZS4gIE90aGVyd2lzZSwgaXQgd2lsbCByZXR1cm4gdGhlIGxvY2FsZSBjb25maWd1cmF0aW9uXG4gICAgLy8gdmFyaWFibGVzIGZvciB0aGlzIGluc3RhbmNlLlxuICAgIGZ1bmN0aW9uIGxvY2FsZSAoa2V5KSB7XG4gICAgICAgIHZhciBuZXdMb2NhbGVEYXRhO1xuXG4gICAgICAgIGlmIChrZXkgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2xvY2FsZS5fYWJicjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG5ld0xvY2FsZURhdGEgPSBnZXRMb2NhbGUoa2V5KTtcbiAgICAgICAgICAgIGlmIChuZXdMb2NhbGVEYXRhICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9sb2NhbGUgPSBuZXdMb2NhbGVEYXRhO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgbGFuZyA9IGRlcHJlY2F0ZShcbiAgICAgICAgJ21vbWVudCgpLmxhbmcoKSBpcyBkZXByZWNhdGVkLiBJbnN0ZWFkLCB1c2UgbW9tZW50KCkubG9jYWxlRGF0YSgpIHRvIGdldCB0aGUgbGFuZ3VhZ2UgY29uZmlndXJhdGlvbi4gVXNlIG1vbWVudCgpLmxvY2FsZSgpIHRvIGNoYW5nZSBsYW5ndWFnZXMuJyxcbiAgICAgICAgZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgICAgaWYgKGtleSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubG9jYWxlRGF0YSgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5sb2NhbGUoa2V5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICk7XG5cbiAgICBmdW5jdGlvbiBsb2NhbGVEYXRhICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2xvY2FsZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzdGFydE9mICh1bml0cykge1xuICAgICAgICB1bml0cyA9IG5vcm1hbGl6ZVVuaXRzKHVuaXRzKTtcbiAgICAgICAgLy8gdGhlIGZvbGxvd2luZyBzd2l0Y2ggaW50ZW50aW9uYWxseSBvbWl0cyBicmVhayBrZXl3b3Jkc1xuICAgICAgICAvLyB0byB1dGlsaXplIGZhbGxpbmcgdGhyb3VnaCB0aGUgY2FzZXMuXG4gICAgICAgIHN3aXRjaCAodW5pdHMpIHtcbiAgICAgICAgICAgIGNhc2UgJ3llYXInOlxuICAgICAgICAgICAgICAgIHRoaXMubW9udGgoMCk7XG4gICAgICAgICAgICAgICAgLyogZmFsbHMgdGhyb3VnaCAqL1xuICAgICAgICAgICAgY2FzZSAncXVhcnRlcic6XG4gICAgICAgICAgICBjYXNlICdtb250aCc6XG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlKDEpO1xuICAgICAgICAgICAgICAgIC8qIGZhbGxzIHRocm91Z2ggKi9cbiAgICAgICAgICAgIGNhc2UgJ3dlZWsnOlxuICAgICAgICAgICAgY2FzZSAnaXNvV2Vlayc6XG4gICAgICAgICAgICBjYXNlICdkYXknOlxuICAgICAgICAgICAgY2FzZSAnZGF0ZSc6XG4gICAgICAgICAgICAgICAgdGhpcy5ob3VycygwKTtcbiAgICAgICAgICAgICAgICAvKiBmYWxscyB0aHJvdWdoICovXG4gICAgICAgICAgICBjYXNlICdob3VyJzpcbiAgICAgICAgICAgICAgICB0aGlzLm1pbnV0ZXMoMCk7XG4gICAgICAgICAgICAgICAgLyogZmFsbHMgdGhyb3VnaCAqL1xuICAgICAgICAgICAgY2FzZSAnbWludXRlJzpcbiAgICAgICAgICAgICAgICB0aGlzLnNlY29uZHMoMCk7XG4gICAgICAgICAgICAgICAgLyogZmFsbHMgdGhyb3VnaCAqL1xuICAgICAgICAgICAgY2FzZSAnc2Vjb25kJzpcbiAgICAgICAgICAgICAgICB0aGlzLm1pbGxpc2Vjb25kcygwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHdlZWtzIGFyZSBhIHNwZWNpYWwgY2FzZVxuICAgICAgICBpZiAodW5pdHMgPT09ICd3ZWVrJykge1xuICAgICAgICAgICAgdGhpcy53ZWVrZGF5KDApO1xuICAgICAgICB9XG4gICAgICAgIGlmICh1bml0cyA9PT0gJ2lzb1dlZWsnKSB7XG4gICAgICAgICAgICB0aGlzLmlzb1dlZWtkYXkoMSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBxdWFydGVycyBhcmUgYWxzbyBzcGVjaWFsXG4gICAgICAgIGlmICh1bml0cyA9PT0gJ3F1YXJ0ZXInKSB7XG4gICAgICAgICAgICB0aGlzLm1vbnRoKE1hdGguZmxvb3IodGhpcy5tb250aCgpIC8gMykgKiAzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGVuZE9mICh1bml0cykge1xuICAgICAgICB1bml0cyA9IG5vcm1hbGl6ZVVuaXRzKHVuaXRzKTtcbiAgICAgICAgaWYgKHVuaXRzID09PSB1bmRlZmluZWQgfHwgdW5pdHMgPT09ICdtaWxsaXNlY29uZCcpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gJ2RhdGUnIGlzIGFuIGFsaWFzIGZvciAnZGF5Jywgc28gaXQgc2hvdWxkIGJlIGNvbnNpZGVyZWQgYXMgc3VjaC5cbiAgICAgICAgaWYgKHVuaXRzID09PSAnZGF0ZScpIHtcbiAgICAgICAgICAgIHVuaXRzID0gJ2RheSc7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5zdGFydE9mKHVuaXRzKS5hZGQoMSwgKHVuaXRzID09PSAnaXNvV2VlaycgPyAnd2VlaycgOiB1bml0cykpLnN1YnRyYWN0KDEsICdtcycpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHZhbHVlT2YgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZC52YWx1ZU9mKCkgLSAoKHRoaXMuX29mZnNldCB8fCAwKSAqIDYwMDAwKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB1bml4ICgpIHtcbiAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IodGhpcy52YWx1ZU9mKCkgLyAxMDAwKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB0b0RhdGUgKCkge1xuICAgICAgICByZXR1cm4gbmV3IERhdGUodGhpcy52YWx1ZU9mKCkpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHRvQXJyYXkgKCkge1xuICAgICAgICB2YXIgbSA9IHRoaXM7XG4gICAgICAgIHJldHVybiBbbS55ZWFyKCksIG0ubW9udGgoKSwgbS5kYXRlKCksIG0uaG91cigpLCBtLm1pbnV0ZSgpLCBtLnNlY29uZCgpLCBtLm1pbGxpc2Vjb25kKCldO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHRvT2JqZWN0ICgpIHtcbiAgICAgICAgdmFyIG0gPSB0aGlzO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgeWVhcnM6IG0ueWVhcigpLFxuICAgICAgICAgICAgbW9udGhzOiBtLm1vbnRoKCksXG4gICAgICAgICAgICBkYXRlOiBtLmRhdGUoKSxcbiAgICAgICAgICAgIGhvdXJzOiBtLmhvdXJzKCksXG4gICAgICAgICAgICBtaW51dGVzOiBtLm1pbnV0ZXMoKSxcbiAgICAgICAgICAgIHNlY29uZHM6IG0uc2Vjb25kcygpLFxuICAgICAgICAgICAgbWlsbGlzZWNvbmRzOiBtLm1pbGxpc2Vjb25kcygpXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdG9KU09OICgpIHtcbiAgICAgICAgLy8gbmV3IERhdGUoTmFOKS50b0pTT04oKSA9PT0gbnVsbFxuICAgICAgICByZXR1cm4gdGhpcy5pc1ZhbGlkKCkgPyB0aGlzLnRvSVNPU3RyaW5nKCkgOiBudWxsO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGlzVmFsaWQkMiAoKSB7XG4gICAgICAgIHJldHVybiBpc1ZhbGlkKHRoaXMpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBhcnNpbmdGbGFncyAoKSB7XG4gICAgICAgIHJldHVybiBleHRlbmQoe30sIGdldFBhcnNpbmdGbGFncyh0aGlzKSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaW52YWxpZEF0ICgpIHtcbiAgICAgICAgcmV0dXJuIGdldFBhcnNpbmdGbGFncyh0aGlzKS5vdmVyZmxvdztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjcmVhdGlvbkRhdGEoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBpbnB1dDogdGhpcy5faSxcbiAgICAgICAgICAgIGZvcm1hdDogdGhpcy5fZixcbiAgICAgICAgICAgIGxvY2FsZTogdGhpcy5fbG9jYWxlLFxuICAgICAgICAgICAgaXNVVEM6IHRoaXMuX2lzVVRDLFxuICAgICAgICAgICAgc3RyaWN0OiB0aGlzLl9zdHJpY3RcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyBGT1JNQVRUSU5HXG5cbiAgICBhZGRGb3JtYXRUb2tlbigwLCBbJ2dnJywgMl0sIDAsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMud2Vla1llYXIoKSAlIDEwMDtcbiAgICB9KTtcblxuICAgIGFkZEZvcm1hdFRva2VuKDAsIFsnR0cnLCAyXSwgMCwgZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pc29XZWVrWWVhcigpICUgMTAwO1xuICAgIH0pO1xuXG4gICAgZnVuY3Rpb24gYWRkV2Vla1llYXJGb3JtYXRUb2tlbiAodG9rZW4sIGdldHRlcikge1xuICAgICAgICBhZGRGb3JtYXRUb2tlbigwLCBbdG9rZW4sIHRva2VuLmxlbmd0aF0sIDAsIGdldHRlcik7XG4gICAgfVxuXG4gICAgYWRkV2Vla1llYXJGb3JtYXRUb2tlbignZ2dnZycsICAgICAnd2Vla1llYXInKTtcbiAgICBhZGRXZWVrWWVhckZvcm1hdFRva2VuKCdnZ2dnZycsICAgICd3ZWVrWWVhcicpO1xuICAgIGFkZFdlZWtZZWFyRm9ybWF0VG9rZW4oJ0dHR0cnLCAgJ2lzb1dlZWtZZWFyJyk7XG4gICAgYWRkV2Vla1llYXJGb3JtYXRUb2tlbignR0dHR0cnLCAnaXNvV2Vla1llYXInKTtcblxuICAgIC8vIEFMSUFTRVNcblxuICAgIGFkZFVuaXRBbGlhcygnd2Vla1llYXInLCAnZ2cnKTtcbiAgICBhZGRVbml0QWxpYXMoJ2lzb1dlZWtZZWFyJywgJ0dHJyk7XG5cbiAgICAvLyBQUklPUklUWVxuXG4gICAgYWRkVW5pdFByaW9yaXR5KCd3ZWVrWWVhcicsIDEpO1xuICAgIGFkZFVuaXRQcmlvcml0eSgnaXNvV2Vla1llYXInLCAxKTtcblxuXG4gICAgLy8gUEFSU0lOR1xuXG4gICAgYWRkUmVnZXhUb2tlbignRycsICAgICAgbWF0Y2hTaWduZWQpO1xuICAgIGFkZFJlZ2V4VG9rZW4oJ2cnLCAgICAgIG1hdGNoU2lnbmVkKTtcbiAgICBhZGRSZWdleFRva2VuKCdHRycsICAgICBtYXRjaDF0bzIsIG1hdGNoMik7XG4gICAgYWRkUmVnZXhUb2tlbignZ2cnLCAgICAgbWF0Y2gxdG8yLCBtYXRjaDIpO1xuICAgIGFkZFJlZ2V4VG9rZW4oJ0dHR0cnLCAgIG1hdGNoMXRvNCwgbWF0Y2g0KTtcbiAgICBhZGRSZWdleFRva2VuKCdnZ2dnJywgICBtYXRjaDF0bzQsIG1hdGNoNCk7XG4gICAgYWRkUmVnZXhUb2tlbignR0dHR0cnLCAgbWF0Y2gxdG82LCBtYXRjaDYpO1xuICAgIGFkZFJlZ2V4VG9rZW4oJ2dnZ2dnJywgIG1hdGNoMXRvNiwgbWF0Y2g2KTtcblxuICAgIGFkZFdlZWtQYXJzZVRva2VuKFsnZ2dnZycsICdnZ2dnZycsICdHR0dHJywgJ0dHR0dHJ10sIGZ1bmN0aW9uIChpbnB1dCwgd2VlaywgY29uZmlnLCB0b2tlbikge1xuICAgICAgICB3ZWVrW3Rva2VuLnN1YnN0cigwLCAyKV0gPSB0b0ludChpbnB1dCk7XG4gICAgfSk7XG5cbiAgICBhZGRXZWVrUGFyc2VUb2tlbihbJ2dnJywgJ0dHJ10sIGZ1bmN0aW9uIChpbnB1dCwgd2VlaywgY29uZmlnLCB0b2tlbikge1xuICAgICAgICB3ZWVrW3Rva2VuXSA9IGhvb2tzLnBhcnNlVHdvRGlnaXRZZWFyKGlucHV0KTtcbiAgICB9KTtcblxuICAgIC8vIE1PTUVOVFNcblxuICAgIGZ1bmN0aW9uIGdldFNldFdlZWtZZWFyIChpbnB1dCkge1xuICAgICAgICByZXR1cm4gZ2V0U2V0V2Vla1llYXJIZWxwZXIuY2FsbCh0aGlzLFxuICAgICAgICAgICAgICAgIGlucHV0LFxuICAgICAgICAgICAgICAgIHRoaXMud2VlaygpLFxuICAgICAgICAgICAgICAgIHRoaXMud2Vla2RheSgpLFxuICAgICAgICAgICAgICAgIHRoaXMubG9jYWxlRGF0YSgpLl93ZWVrLmRvdyxcbiAgICAgICAgICAgICAgICB0aGlzLmxvY2FsZURhdGEoKS5fd2Vlay5kb3kpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldFNldElTT1dlZWtZZWFyIChpbnB1dCkge1xuICAgICAgICByZXR1cm4gZ2V0U2V0V2Vla1llYXJIZWxwZXIuY2FsbCh0aGlzLFxuICAgICAgICAgICAgICAgIGlucHV0LCB0aGlzLmlzb1dlZWsoKSwgdGhpcy5pc29XZWVrZGF5KCksIDEsIDQpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldElTT1dlZWtzSW5ZZWFyICgpIHtcbiAgICAgICAgcmV0dXJuIHdlZWtzSW5ZZWFyKHRoaXMueWVhcigpLCAxLCA0KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRXZWVrc0luWWVhciAoKSB7XG4gICAgICAgIHZhciB3ZWVrSW5mbyA9IHRoaXMubG9jYWxlRGF0YSgpLl93ZWVrO1xuICAgICAgICByZXR1cm4gd2Vla3NJblllYXIodGhpcy55ZWFyKCksIHdlZWtJbmZvLmRvdywgd2Vla0luZm8uZG95KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRTZXRXZWVrWWVhckhlbHBlcihpbnB1dCwgd2Vlaywgd2Vla2RheSwgZG93LCBkb3kpIHtcbiAgICAgICAgdmFyIHdlZWtzVGFyZ2V0O1xuICAgICAgICBpZiAoaW5wdXQgPT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIHdlZWtPZlllYXIodGhpcywgZG93LCBkb3kpLnllYXI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB3ZWVrc1RhcmdldCA9IHdlZWtzSW5ZZWFyKGlucHV0LCBkb3csIGRveSk7XG4gICAgICAgICAgICBpZiAod2VlayA+IHdlZWtzVGFyZ2V0KSB7XG4gICAgICAgICAgICAgICAgd2VlayA9IHdlZWtzVGFyZ2V0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHNldFdlZWtBbGwuY2FsbCh0aGlzLCBpbnB1dCwgd2Vlaywgd2Vla2RheSwgZG93LCBkb3kpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc2V0V2Vla0FsbCh3ZWVrWWVhciwgd2Vlaywgd2Vla2RheSwgZG93LCBkb3kpIHtcbiAgICAgICAgdmFyIGRheU9mWWVhckRhdGEgPSBkYXlPZlllYXJGcm9tV2Vla3Mod2Vla1llYXIsIHdlZWssIHdlZWtkYXksIGRvdywgZG95KSxcbiAgICAgICAgICAgIGRhdGUgPSBjcmVhdGVVVENEYXRlKGRheU9mWWVhckRhdGEueWVhciwgMCwgZGF5T2ZZZWFyRGF0YS5kYXlPZlllYXIpO1xuXG4gICAgICAgIHRoaXMueWVhcihkYXRlLmdldFVUQ0Z1bGxZZWFyKCkpO1xuICAgICAgICB0aGlzLm1vbnRoKGRhdGUuZ2V0VVRDTW9udGgoKSk7XG4gICAgICAgIHRoaXMuZGF0ZShkYXRlLmdldFVUQ0RhdGUoKSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8vIEZPUk1BVFRJTkdcblxuICAgIGFkZEZvcm1hdFRva2VuKCdRJywgMCwgJ1FvJywgJ3F1YXJ0ZXInKTtcblxuICAgIC8vIEFMSUFTRVNcblxuICAgIGFkZFVuaXRBbGlhcygncXVhcnRlcicsICdRJyk7XG5cbiAgICAvLyBQUklPUklUWVxuXG4gICAgYWRkVW5pdFByaW9yaXR5KCdxdWFydGVyJywgNyk7XG5cbiAgICAvLyBQQVJTSU5HXG5cbiAgICBhZGRSZWdleFRva2VuKCdRJywgbWF0Y2gxKTtcbiAgICBhZGRQYXJzZVRva2VuKCdRJywgZnVuY3Rpb24gKGlucHV0LCBhcnJheSkge1xuICAgICAgICBhcnJheVtNT05USF0gPSAodG9JbnQoaW5wdXQpIC0gMSkgKiAzO1xuICAgIH0pO1xuXG4gICAgLy8gTU9NRU5UU1xuXG4gICAgZnVuY3Rpb24gZ2V0U2V0UXVhcnRlciAoaW5wdXQpIHtcbiAgICAgICAgcmV0dXJuIGlucHV0ID09IG51bGwgPyBNYXRoLmNlaWwoKHRoaXMubW9udGgoKSArIDEpIC8gMykgOiB0aGlzLm1vbnRoKChpbnB1dCAtIDEpICogMyArIHRoaXMubW9udGgoKSAlIDMpO1xuICAgIH1cblxuICAgIC8vIEZPUk1BVFRJTkdcblxuICAgIGFkZEZvcm1hdFRva2VuKCdEJywgWydERCcsIDJdLCAnRG8nLCAnZGF0ZScpO1xuXG4gICAgLy8gQUxJQVNFU1xuXG4gICAgYWRkVW5pdEFsaWFzKCdkYXRlJywgJ0QnKTtcblxuICAgIC8vIFBSSU9SSVRZXG4gICAgYWRkVW5pdFByaW9yaXR5KCdkYXRlJywgOSk7XG5cbiAgICAvLyBQQVJTSU5HXG5cbiAgICBhZGRSZWdleFRva2VuKCdEJywgIG1hdGNoMXRvMik7XG4gICAgYWRkUmVnZXhUb2tlbignREQnLCBtYXRjaDF0bzIsIG1hdGNoMik7XG4gICAgYWRkUmVnZXhUb2tlbignRG8nLCBmdW5jdGlvbiAoaXNTdHJpY3QsIGxvY2FsZSkge1xuICAgICAgICAvLyBUT0RPOiBSZW1vdmUgXCJvcmRpbmFsUGFyc2VcIiBmYWxsYmFjayBpbiBuZXh0IG1ham9yIHJlbGVhc2UuXG4gICAgICAgIHJldHVybiBpc1N0cmljdCA/XG4gICAgICAgICAgKGxvY2FsZS5fZGF5T2ZNb250aE9yZGluYWxQYXJzZSB8fCBsb2NhbGUuX29yZGluYWxQYXJzZSkgOlxuICAgICAgICAgIGxvY2FsZS5fZGF5T2ZNb250aE9yZGluYWxQYXJzZUxlbmllbnQ7XG4gICAgfSk7XG5cbiAgICBhZGRQYXJzZVRva2VuKFsnRCcsICdERCddLCBEQVRFKTtcbiAgICBhZGRQYXJzZVRva2VuKCdEbycsIGZ1bmN0aW9uIChpbnB1dCwgYXJyYXkpIHtcbiAgICAgICAgYXJyYXlbREFURV0gPSB0b0ludChpbnB1dC5tYXRjaChtYXRjaDF0bzIpWzBdKTtcbiAgICB9KTtcblxuICAgIC8vIE1PTUVOVFNcblxuICAgIHZhciBnZXRTZXREYXlPZk1vbnRoID0gbWFrZUdldFNldCgnRGF0ZScsIHRydWUpO1xuXG4gICAgLy8gRk9STUFUVElOR1xuXG4gICAgYWRkRm9ybWF0VG9rZW4oJ0RERCcsIFsnRERERCcsIDNdLCAnREREbycsICdkYXlPZlllYXInKTtcblxuICAgIC8vIEFMSUFTRVNcblxuICAgIGFkZFVuaXRBbGlhcygnZGF5T2ZZZWFyJywgJ0RERCcpO1xuXG4gICAgLy8gUFJJT1JJVFlcbiAgICBhZGRVbml0UHJpb3JpdHkoJ2RheU9mWWVhcicsIDQpO1xuXG4gICAgLy8gUEFSU0lOR1xuXG4gICAgYWRkUmVnZXhUb2tlbignREREJywgIG1hdGNoMXRvMyk7XG4gICAgYWRkUmVnZXhUb2tlbignRERERCcsIG1hdGNoMyk7XG4gICAgYWRkUGFyc2VUb2tlbihbJ0RERCcsICdEREREJ10sIGZ1bmN0aW9uIChpbnB1dCwgYXJyYXksIGNvbmZpZykge1xuICAgICAgICBjb25maWcuX2RheU9mWWVhciA9IHRvSW50KGlucHV0KTtcbiAgICB9KTtcblxuICAgIC8vIEhFTFBFUlNcblxuICAgIC8vIE1PTUVOVFNcblxuICAgIGZ1bmN0aW9uIGdldFNldERheU9mWWVhciAoaW5wdXQpIHtcbiAgICAgICAgdmFyIGRheU9mWWVhciA9IE1hdGgucm91bmQoKHRoaXMuY2xvbmUoKS5zdGFydE9mKCdkYXknKSAtIHRoaXMuY2xvbmUoKS5zdGFydE9mKCd5ZWFyJykpIC8gODY0ZTUpICsgMTtcbiAgICAgICAgcmV0dXJuIGlucHV0ID09IG51bGwgPyBkYXlPZlllYXIgOiB0aGlzLmFkZCgoaW5wdXQgLSBkYXlPZlllYXIpLCAnZCcpO1xuICAgIH1cblxuICAgIC8vIEZPUk1BVFRJTkdcblxuICAgIGFkZEZvcm1hdFRva2VuKCdtJywgWydtbScsIDJdLCAwLCAnbWludXRlJyk7XG5cbiAgICAvLyBBTElBU0VTXG5cbiAgICBhZGRVbml0QWxpYXMoJ21pbnV0ZScsICdtJyk7XG5cbiAgICAvLyBQUklPUklUWVxuXG4gICAgYWRkVW5pdFByaW9yaXR5KCdtaW51dGUnLCAxNCk7XG5cbiAgICAvLyBQQVJTSU5HXG5cbiAgICBhZGRSZWdleFRva2VuKCdtJywgIG1hdGNoMXRvMik7XG4gICAgYWRkUmVnZXhUb2tlbignbW0nLCBtYXRjaDF0bzIsIG1hdGNoMik7XG4gICAgYWRkUGFyc2VUb2tlbihbJ20nLCAnbW0nXSwgTUlOVVRFKTtcblxuICAgIC8vIE1PTUVOVFNcblxuICAgIHZhciBnZXRTZXRNaW51dGUgPSBtYWtlR2V0U2V0KCdNaW51dGVzJywgZmFsc2UpO1xuXG4gICAgLy8gRk9STUFUVElOR1xuXG4gICAgYWRkRm9ybWF0VG9rZW4oJ3MnLCBbJ3NzJywgMl0sIDAsICdzZWNvbmQnKTtcblxuICAgIC8vIEFMSUFTRVNcblxuICAgIGFkZFVuaXRBbGlhcygnc2Vjb25kJywgJ3MnKTtcblxuICAgIC8vIFBSSU9SSVRZXG5cbiAgICBhZGRVbml0UHJpb3JpdHkoJ3NlY29uZCcsIDE1KTtcblxuICAgIC8vIFBBUlNJTkdcblxuICAgIGFkZFJlZ2V4VG9rZW4oJ3MnLCAgbWF0Y2gxdG8yKTtcbiAgICBhZGRSZWdleFRva2VuKCdzcycsIG1hdGNoMXRvMiwgbWF0Y2gyKTtcbiAgICBhZGRQYXJzZVRva2VuKFsncycsICdzcyddLCBTRUNPTkQpO1xuXG4gICAgLy8gTU9NRU5UU1xuXG4gICAgdmFyIGdldFNldFNlY29uZCA9IG1ha2VHZXRTZXQoJ1NlY29uZHMnLCBmYWxzZSk7XG5cbiAgICAvLyBGT1JNQVRUSU5HXG5cbiAgICBhZGRGb3JtYXRUb2tlbignUycsIDAsIDAsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIH5+KHRoaXMubWlsbGlzZWNvbmQoKSAvIDEwMCk7XG4gICAgfSk7XG5cbiAgICBhZGRGb3JtYXRUb2tlbigwLCBbJ1NTJywgMl0sIDAsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIH5+KHRoaXMubWlsbGlzZWNvbmQoKSAvIDEwKTtcbiAgICB9KTtcblxuICAgIGFkZEZvcm1hdFRva2VuKDAsIFsnU1NTJywgM10sIDAsICdtaWxsaXNlY29uZCcpO1xuICAgIGFkZEZvcm1hdFRva2VuKDAsIFsnU1NTUycsIDRdLCAwLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1pbGxpc2Vjb25kKCkgKiAxMDtcbiAgICB9KTtcbiAgICBhZGRGb3JtYXRUb2tlbigwLCBbJ1NTU1NTJywgNV0sIDAsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWlsbGlzZWNvbmQoKSAqIDEwMDtcbiAgICB9KTtcbiAgICBhZGRGb3JtYXRUb2tlbigwLCBbJ1NTU1NTUycsIDZdLCAwLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1pbGxpc2Vjb25kKCkgKiAxMDAwO1xuICAgIH0pO1xuICAgIGFkZEZvcm1hdFRva2VuKDAsIFsnU1NTU1NTUycsIDddLCAwLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1pbGxpc2Vjb25kKCkgKiAxMDAwMDtcbiAgICB9KTtcbiAgICBhZGRGb3JtYXRUb2tlbigwLCBbJ1NTU1NTU1NTJywgOF0sIDAsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWlsbGlzZWNvbmQoKSAqIDEwMDAwMDtcbiAgICB9KTtcbiAgICBhZGRGb3JtYXRUb2tlbigwLCBbJ1NTU1NTU1NTUycsIDldLCAwLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1pbGxpc2Vjb25kKCkgKiAxMDAwMDAwO1xuICAgIH0pO1xuXG5cbiAgICAvLyBBTElBU0VTXG5cbiAgICBhZGRVbml0QWxpYXMoJ21pbGxpc2Vjb25kJywgJ21zJyk7XG5cbiAgICAvLyBQUklPUklUWVxuXG4gICAgYWRkVW5pdFByaW9yaXR5KCdtaWxsaXNlY29uZCcsIDE2KTtcblxuICAgIC8vIFBBUlNJTkdcblxuICAgIGFkZFJlZ2V4VG9rZW4oJ1MnLCAgICBtYXRjaDF0bzMsIG1hdGNoMSk7XG4gICAgYWRkUmVnZXhUb2tlbignU1MnLCAgIG1hdGNoMXRvMywgbWF0Y2gyKTtcbiAgICBhZGRSZWdleFRva2VuKCdTU1MnLCAgbWF0Y2gxdG8zLCBtYXRjaDMpO1xuXG4gICAgdmFyIHRva2VuO1xuICAgIGZvciAodG9rZW4gPSAnU1NTUyc7IHRva2VuLmxlbmd0aCA8PSA5OyB0b2tlbiArPSAnUycpIHtcbiAgICAgICAgYWRkUmVnZXhUb2tlbih0b2tlbiwgbWF0Y2hVbnNpZ25lZCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcGFyc2VNcyhpbnB1dCwgYXJyYXkpIHtcbiAgICAgICAgYXJyYXlbTUlMTElTRUNPTkRdID0gdG9JbnQoKCcwLicgKyBpbnB1dCkgKiAxMDAwKTtcbiAgICB9XG5cbiAgICBmb3IgKHRva2VuID0gJ1MnOyB0b2tlbi5sZW5ndGggPD0gOTsgdG9rZW4gKz0gJ1MnKSB7XG4gICAgICAgIGFkZFBhcnNlVG9rZW4odG9rZW4sIHBhcnNlTXMpO1xuICAgIH1cbiAgICAvLyBNT01FTlRTXG5cbiAgICB2YXIgZ2V0U2V0TWlsbGlzZWNvbmQgPSBtYWtlR2V0U2V0KCdNaWxsaXNlY29uZHMnLCBmYWxzZSk7XG5cbiAgICAvLyBGT1JNQVRUSU5HXG5cbiAgICBhZGRGb3JtYXRUb2tlbigneicsICAwLCAwLCAnem9uZUFiYnInKTtcbiAgICBhZGRGb3JtYXRUb2tlbignenonLCAwLCAwLCAnem9uZU5hbWUnKTtcblxuICAgIC8vIE1PTUVOVFNcblxuICAgIGZ1bmN0aW9uIGdldFpvbmVBYmJyICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2lzVVRDID8gJ1VUQycgOiAnJztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRab25lTmFtZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9pc1VUQyA/ICdDb29yZGluYXRlZCBVbml2ZXJzYWwgVGltZScgOiAnJztcbiAgICB9XG5cbiAgICB2YXIgcHJvdG8gPSBNb21lbnQucHJvdG90eXBlO1xuXG4gICAgcHJvdG8uYWRkICAgICAgICAgICAgICAgPSBhZGQ7XG4gICAgcHJvdG8uY2FsZW5kYXIgICAgICAgICAgPSBjYWxlbmRhciQxO1xuICAgIHByb3RvLmNsb25lICAgICAgICAgICAgID0gY2xvbmU7XG4gICAgcHJvdG8uZGlmZiAgICAgICAgICAgICAgPSBkaWZmO1xuICAgIHByb3RvLmVuZE9mICAgICAgICAgICAgID0gZW5kT2Y7XG4gICAgcHJvdG8uZm9ybWF0ICAgICAgICAgICAgPSBmb3JtYXQ7XG4gICAgcHJvdG8uZnJvbSAgICAgICAgICAgICAgPSBmcm9tO1xuICAgIHByb3RvLmZyb21Ob3cgICAgICAgICAgID0gZnJvbU5vdztcbiAgICBwcm90by50byAgICAgICAgICAgICAgICA9IHRvO1xuICAgIHByb3RvLnRvTm93ICAgICAgICAgICAgID0gdG9Ob3c7XG4gICAgcHJvdG8uZ2V0ICAgICAgICAgICAgICAgPSBzdHJpbmdHZXQ7XG4gICAgcHJvdG8uaW52YWxpZEF0ICAgICAgICAgPSBpbnZhbGlkQXQ7XG4gICAgcHJvdG8uaXNBZnRlciAgICAgICAgICAgPSBpc0FmdGVyO1xuICAgIHByb3RvLmlzQmVmb3JlICAgICAgICAgID0gaXNCZWZvcmU7XG4gICAgcHJvdG8uaXNCZXR3ZWVuICAgICAgICAgPSBpc0JldHdlZW47XG4gICAgcHJvdG8uaXNTYW1lICAgICAgICAgICAgPSBpc1NhbWU7XG4gICAgcHJvdG8uaXNTYW1lT3JBZnRlciAgICAgPSBpc1NhbWVPckFmdGVyO1xuICAgIHByb3RvLmlzU2FtZU9yQmVmb3JlICAgID0gaXNTYW1lT3JCZWZvcmU7XG4gICAgcHJvdG8uaXNWYWxpZCAgICAgICAgICAgPSBpc1ZhbGlkJDI7XG4gICAgcHJvdG8ubGFuZyAgICAgICAgICAgICAgPSBsYW5nO1xuICAgIHByb3RvLmxvY2FsZSAgICAgICAgICAgID0gbG9jYWxlO1xuICAgIHByb3RvLmxvY2FsZURhdGEgICAgICAgID0gbG9jYWxlRGF0YTtcbiAgICBwcm90by5tYXggICAgICAgICAgICAgICA9IHByb3RvdHlwZU1heDtcbiAgICBwcm90by5taW4gICAgICAgICAgICAgICA9IHByb3RvdHlwZU1pbjtcbiAgICBwcm90by5wYXJzaW5nRmxhZ3MgICAgICA9IHBhcnNpbmdGbGFncztcbiAgICBwcm90by5zZXQgICAgICAgICAgICAgICA9IHN0cmluZ1NldDtcbiAgICBwcm90by5zdGFydE9mICAgICAgICAgICA9IHN0YXJ0T2Y7XG4gICAgcHJvdG8uc3VidHJhY3QgICAgICAgICAgPSBzdWJ0cmFjdDtcbiAgICBwcm90by50b0FycmF5ICAgICAgICAgICA9IHRvQXJyYXk7XG4gICAgcHJvdG8udG9PYmplY3QgICAgICAgICAgPSB0b09iamVjdDtcbiAgICBwcm90by50b0RhdGUgICAgICAgICAgICA9IHRvRGF0ZTtcbiAgICBwcm90by50b0lTT1N0cmluZyAgICAgICA9IHRvSVNPU3RyaW5nO1xuICAgIHByb3RvLmluc3BlY3QgICAgICAgICAgID0gaW5zcGVjdDtcbiAgICBwcm90by50b0pTT04gICAgICAgICAgICA9IHRvSlNPTjtcbiAgICBwcm90by50b1N0cmluZyAgICAgICAgICA9IHRvU3RyaW5nO1xuICAgIHByb3RvLnVuaXggICAgICAgICAgICAgID0gdW5peDtcbiAgICBwcm90by52YWx1ZU9mICAgICAgICAgICA9IHZhbHVlT2Y7XG4gICAgcHJvdG8uY3JlYXRpb25EYXRhICAgICAgPSBjcmVhdGlvbkRhdGE7XG4gICAgcHJvdG8ueWVhciAgICAgICA9IGdldFNldFllYXI7XG4gICAgcHJvdG8uaXNMZWFwWWVhciA9IGdldElzTGVhcFllYXI7XG4gICAgcHJvdG8ud2Vla1llYXIgICAgPSBnZXRTZXRXZWVrWWVhcjtcbiAgICBwcm90by5pc29XZWVrWWVhciA9IGdldFNldElTT1dlZWtZZWFyO1xuICAgIHByb3RvLnF1YXJ0ZXIgPSBwcm90by5xdWFydGVycyA9IGdldFNldFF1YXJ0ZXI7XG4gICAgcHJvdG8ubW9udGggICAgICAgPSBnZXRTZXRNb250aDtcbiAgICBwcm90by5kYXlzSW5Nb250aCA9IGdldERheXNJbk1vbnRoO1xuICAgIHByb3RvLndlZWsgICAgICAgICAgID0gcHJvdG8ud2Vla3MgICAgICAgID0gZ2V0U2V0V2VlaztcbiAgICBwcm90by5pc29XZWVrICAgICAgICA9IHByb3RvLmlzb1dlZWtzICAgICA9IGdldFNldElTT1dlZWs7XG4gICAgcHJvdG8ud2Vla3NJblllYXIgICAgPSBnZXRXZWVrc0luWWVhcjtcbiAgICBwcm90by5pc29XZWVrc0luWWVhciA9IGdldElTT1dlZWtzSW5ZZWFyO1xuICAgIHByb3RvLmRhdGUgICAgICAgPSBnZXRTZXREYXlPZk1vbnRoO1xuICAgIHByb3RvLmRheSAgICAgICAgPSBwcm90by5kYXlzICAgICAgICAgICAgID0gZ2V0U2V0RGF5T2ZXZWVrO1xuICAgIHByb3RvLndlZWtkYXkgICAgPSBnZXRTZXRMb2NhbGVEYXlPZldlZWs7XG4gICAgcHJvdG8uaXNvV2Vla2RheSA9IGdldFNldElTT0RheU9mV2VlaztcbiAgICBwcm90by5kYXlPZlllYXIgID0gZ2V0U2V0RGF5T2ZZZWFyO1xuICAgIHByb3RvLmhvdXIgPSBwcm90by5ob3VycyA9IGdldFNldEhvdXI7XG4gICAgcHJvdG8ubWludXRlID0gcHJvdG8ubWludXRlcyA9IGdldFNldE1pbnV0ZTtcbiAgICBwcm90by5zZWNvbmQgPSBwcm90by5zZWNvbmRzID0gZ2V0U2V0U2Vjb25kO1xuICAgIHByb3RvLm1pbGxpc2Vjb25kID0gcHJvdG8ubWlsbGlzZWNvbmRzID0gZ2V0U2V0TWlsbGlzZWNvbmQ7XG4gICAgcHJvdG8udXRjT2Zmc2V0ICAgICAgICAgICAgPSBnZXRTZXRPZmZzZXQ7XG4gICAgcHJvdG8udXRjICAgICAgICAgICAgICAgICAgPSBzZXRPZmZzZXRUb1VUQztcbiAgICBwcm90by5sb2NhbCAgICAgICAgICAgICAgICA9IHNldE9mZnNldFRvTG9jYWw7XG4gICAgcHJvdG8ucGFyc2Vab25lICAgICAgICAgICAgPSBzZXRPZmZzZXRUb1BhcnNlZE9mZnNldDtcbiAgICBwcm90by5oYXNBbGlnbmVkSG91ck9mZnNldCA9IGhhc0FsaWduZWRIb3VyT2Zmc2V0O1xuICAgIHByb3RvLmlzRFNUICAgICAgICAgICAgICAgID0gaXNEYXlsaWdodFNhdmluZ1RpbWU7XG4gICAgcHJvdG8uaXNMb2NhbCAgICAgICAgICAgICAgPSBpc0xvY2FsO1xuICAgIHByb3RvLmlzVXRjT2Zmc2V0ICAgICAgICAgID0gaXNVdGNPZmZzZXQ7XG4gICAgcHJvdG8uaXNVdGMgICAgICAgICAgICAgICAgPSBpc1V0YztcbiAgICBwcm90by5pc1VUQyAgICAgICAgICAgICAgICA9IGlzVXRjO1xuICAgIHByb3RvLnpvbmVBYmJyID0gZ2V0Wm9uZUFiYnI7XG4gICAgcHJvdG8uem9uZU5hbWUgPSBnZXRab25lTmFtZTtcbiAgICBwcm90by5kYXRlcyAgPSBkZXByZWNhdGUoJ2RhdGVzIGFjY2Vzc29yIGlzIGRlcHJlY2F0ZWQuIFVzZSBkYXRlIGluc3RlYWQuJywgZ2V0U2V0RGF5T2ZNb250aCk7XG4gICAgcHJvdG8ubW9udGhzID0gZGVwcmVjYXRlKCdtb250aHMgYWNjZXNzb3IgaXMgZGVwcmVjYXRlZC4gVXNlIG1vbnRoIGluc3RlYWQnLCBnZXRTZXRNb250aCk7XG4gICAgcHJvdG8ueWVhcnMgID0gZGVwcmVjYXRlKCd5ZWFycyBhY2Nlc3NvciBpcyBkZXByZWNhdGVkLiBVc2UgeWVhciBpbnN0ZWFkJywgZ2V0U2V0WWVhcik7XG4gICAgcHJvdG8uem9uZSAgID0gZGVwcmVjYXRlKCdtb21lbnQoKS56b25lIGlzIGRlcHJlY2F0ZWQsIHVzZSBtb21lbnQoKS51dGNPZmZzZXQgaW5zdGVhZC4gaHR0cDovL21vbWVudGpzLmNvbS9ndWlkZXMvIy93YXJuaW5ncy96b25lLycsIGdldFNldFpvbmUpO1xuICAgIHByb3RvLmlzRFNUU2hpZnRlZCA9IGRlcHJlY2F0ZSgnaXNEU1RTaGlmdGVkIGlzIGRlcHJlY2F0ZWQuIFNlZSBodHRwOi8vbW9tZW50anMuY29tL2d1aWRlcy8jL3dhcm5pbmdzL2RzdC1zaGlmdGVkLyBmb3IgbW9yZSBpbmZvcm1hdGlvbicsIGlzRGF5bGlnaHRTYXZpbmdUaW1lU2hpZnRlZCk7XG5cbiAgICBmdW5jdGlvbiBjcmVhdGVVbml4IChpbnB1dCkge1xuICAgICAgICByZXR1cm4gY3JlYXRlTG9jYWwoaW5wdXQgKiAxMDAwKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjcmVhdGVJblpvbmUgKCkge1xuICAgICAgICByZXR1cm4gY3JlYXRlTG9jYWwuYXBwbHkobnVsbCwgYXJndW1lbnRzKS5wYXJzZVpvbmUoKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwcmVQYXJzZVBvc3RGb3JtYXQgKHN0cmluZykge1xuICAgICAgICByZXR1cm4gc3RyaW5nO1xuICAgIH1cblxuICAgIHZhciBwcm90byQxID0gTG9jYWxlLnByb3RvdHlwZTtcblxuICAgIHByb3RvJDEuY2FsZW5kYXIgICAgICAgID0gY2FsZW5kYXI7XG4gICAgcHJvdG8kMS5sb25nRGF0ZUZvcm1hdCAgPSBsb25nRGF0ZUZvcm1hdDtcbiAgICBwcm90byQxLmludmFsaWREYXRlICAgICA9IGludmFsaWREYXRlO1xuICAgIHByb3RvJDEub3JkaW5hbCAgICAgICAgID0gb3JkaW5hbDtcbiAgICBwcm90byQxLnByZXBhcnNlICAgICAgICA9IHByZVBhcnNlUG9zdEZvcm1hdDtcbiAgICBwcm90byQxLnBvc3Rmb3JtYXQgICAgICA9IHByZVBhcnNlUG9zdEZvcm1hdDtcbiAgICBwcm90byQxLnJlbGF0aXZlVGltZSAgICA9IHJlbGF0aXZlVGltZTtcbiAgICBwcm90byQxLnBhc3RGdXR1cmUgICAgICA9IHBhc3RGdXR1cmU7XG4gICAgcHJvdG8kMS5zZXQgICAgICAgICAgICAgPSBzZXQ7XG5cbiAgICBwcm90byQxLm1vbnRocyAgICAgICAgICAgID0gICAgICAgIGxvY2FsZU1vbnRocztcbiAgICBwcm90byQxLm1vbnRoc1Nob3J0ICAgICAgID0gICAgICAgIGxvY2FsZU1vbnRoc1Nob3J0O1xuICAgIHByb3RvJDEubW9udGhzUGFyc2UgICAgICAgPSAgICAgICAgbG9jYWxlTW9udGhzUGFyc2U7XG4gICAgcHJvdG8kMS5tb250aHNSZWdleCAgICAgICA9IG1vbnRoc1JlZ2V4O1xuICAgIHByb3RvJDEubW9udGhzU2hvcnRSZWdleCAgPSBtb250aHNTaG9ydFJlZ2V4O1xuICAgIHByb3RvJDEud2VlayA9IGxvY2FsZVdlZWs7XG4gICAgcHJvdG8kMS5maXJzdERheU9mWWVhciA9IGxvY2FsZUZpcnN0RGF5T2ZZZWFyO1xuICAgIHByb3RvJDEuZmlyc3REYXlPZldlZWsgPSBsb2NhbGVGaXJzdERheU9mV2VlaztcblxuICAgIHByb3RvJDEud2Vla2RheXMgICAgICAgPSAgICAgICAgbG9jYWxlV2Vla2RheXM7XG4gICAgcHJvdG8kMS53ZWVrZGF5c01pbiAgICA9ICAgICAgICBsb2NhbGVXZWVrZGF5c01pbjtcbiAgICBwcm90byQxLndlZWtkYXlzU2hvcnQgID0gICAgICAgIGxvY2FsZVdlZWtkYXlzU2hvcnQ7XG4gICAgcHJvdG8kMS53ZWVrZGF5c1BhcnNlICA9ICAgICAgICBsb2NhbGVXZWVrZGF5c1BhcnNlO1xuXG4gICAgcHJvdG8kMS53ZWVrZGF5c1JlZ2V4ICAgICAgID0gICAgICAgIHdlZWtkYXlzUmVnZXg7XG4gICAgcHJvdG8kMS53ZWVrZGF5c1Nob3J0UmVnZXggID0gICAgICAgIHdlZWtkYXlzU2hvcnRSZWdleDtcbiAgICBwcm90byQxLndlZWtkYXlzTWluUmVnZXggICAgPSAgICAgICAgd2Vla2RheXNNaW5SZWdleDtcblxuICAgIHByb3RvJDEuaXNQTSA9IGxvY2FsZUlzUE07XG4gICAgcHJvdG8kMS5tZXJpZGllbSA9IGxvY2FsZU1lcmlkaWVtO1xuXG4gICAgZnVuY3Rpb24gZ2V0JDEgKGZvcm1hdCwgaW5kZXgsIGZpZWxkLCBzZXR0ZXIpIHtcbiAgICAgICAgdmFyIGxvY2FsZSA9IGdldExvY2FsZSgpO1xuICAgICAgICB2YXIgdXRjID0gY3JlYXRlVVRDKCkuc2V0KHNldHRlciwgaW5kZXgpO1xuICAgICAgICByZXR1cm4gbG9jYWxlW2ZpZWxkXSh1dGMsIGZvcm1hdCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGlzdE1vbnRoc0ltcGwgKGZvcm1hdCwgaW5kZXgsIGZpZWxkKSB7XG4gICAgICAgIGlmIChpc051bWJlcihmb3JtYXQpKSB7XG4gICAgICAgICAgICBpbmRleCA9IGZvcm1hdDtcbiAgICAgICAgICAgIGZvcm1hdCA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvcm1hdCA9IGZvcm1hdCB8fCAnJztcblxuICAgICAgICBpZiAoaW5kZXggIT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIGdldCQxKGZvcm1hdCwgaW5kZXgsIGZpZWxkLCAnbW9udGgnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBpO1xuICAgICAgICB2YXIgb3V0ID0gW107XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCAxMjsgaSsrKSB7XG4gICAgICAgICAgICBvdXRbaV0gPSBnZXQkMShmb3JtYXQsIGksIGZpZWxkLCAnbW9udGgnKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gb3V0O1xuICAgIH1cblxuICAgIC8vICgpXG4gICAgLy8gKDUpXG4gICAgLy8gKGZtdCwgNSlcbiAgICAvLyAoZm10KVxuICAgIC8vICh0cnVlKVxuICAgIC8vICh0cnVlLCA1KVxuICAgIC8vICh0cnVlLCBmbXQsIDUpXG4gICAgLy8gKHRydWUsIGZtdClcbiAgICBmdW5jdGlvbiBsaXN0V2Vla2RheXNJbXBsIChsb2NhbGVTb3J0ZWQsIGZvcm1hdCwgaW5kZXgsIGZpZWxkKSB7XG4gICAgICAgIGlmICh0eXBlb2YgbG9jYWxlU29ydGVkID09PSAnYm9vbGVhbicpIHtcbiAgICAgICAgICAgIGlmIChpc051bWJlcihmb3JtYXQpKSB7XG4gICAgICAgICAgICAgICAgaW5kZXggPSBmb3JtYXQ7XG4gICAgICAgICAgICAgICAgZm9ybWF0ID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmb3JtYXQgPSBmb3JtYXQgfHwgJyc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmb3JtYXQgPSBsb2NhbGVTb3J0ZWQ7XG4gICAgICAgICAgICBpbmRleCA9IGZvcm1hdDtcbiAgICAgICAgICAgIGxvY2FsZVNvcnRlZCA9IGZhbHNlO1xuXG4gICAgICAgICAgICBpZiAoaXNOdW1iZXIoZm9ybWF0KSkge1xuICAgICAgICAgICAgICAgIGluZGV4ID0gZm9ybWF0O1xuICAgICAgICAgICAgICAgIGZvcm1hdCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZm9ybWF0ID0gZm9ybWF0IHx8ICcnO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGxvY2FsZSA9IGdldExvY2FsZSgpLFxuICAgICAgICAgICAgc2hpZnQgPSBsb2NhbGVTb3J0ZWQgPyBsb2NhbGUuX3dlZWsuZG93IDogMDtcblxuICAgICAgICBpZiAoaW5kZXggIT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIGdldCQxKGZvcm1hdCwgKGluZGV4ICsgc2hpZnQpICUgNywgZmllbGQsICdkYXknKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBpO1xuICAgICAgICB2YXIgb3V0ID0gW107XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCA3OyBpKyspIHtcbiAgICAgICAgICAgIG91dFtpXSA9IGdldCQxKGZvcm1hdCwgKGkgKyBzaGlmdCkgJSA3LCBmaWVsZCwgJ2RheScpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBvdXQ7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGlzdE1vbnRocyAoZm9ybWF0LCBpbmRleCkge1xuICAgICAgICByZXR1cm4gbGlzdE1vbnRoc0ltcGwoZm9ybWF0LCBpbmRleCwgJ21vbnRocycpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpc3RNb250aHNTaG9ydCAoZm9ybWF0LCBpbmRleCkge1xuICAgICAgICByZXR1cm4gbGlzdE1vbnRoc0ltcGwoZm9ybWF0LCBpbmRleCwgJ21vbnRoc1Nob3J0Jyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGlzdFdlZWtkYXlzIChsb2NhbGVTb3J0ZWQsIGZvcm1hdCwgaW5kZXgpIHtcbiAgICAgICAgcmV0dXJuIGxpc3RXZWVrZGF5c0ltcGwobG9jYWxlU29ydGVkLCBmb3JtYXQsIGluZGV4LCAnd2Vla2RheXMnKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaXN0V2Vla2RheXNTaG9ydCAobG9jYWxlU29ydGVkLCBmb3JtYXQsIGluZGV4KSB7XG4gICAgICAgIHJldHVybiBsaXN0V2Vla2RheXNJbXBsKGxvY2FsZVNvcnRlZCwgZm9ybWF0LCBpbmRleCwgJ3dlZWtkYXlzU2hvcnQnKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaXN0V2Vla2RheXNNaW4gKGxvY2FsZVNvcnRlZCwgZm9ybWF0LCBpbmRleCkge1xuICAgICAgICByZXR1cm4gbGlzdFdlZWtkYXlzSW1wbChsb2NhbGVTb3J0ZWQsIGZvcm1hdCwgaW5kZXgsICd3ZWVrZGF5c01pbicpO1xuICAgIH1cblxuICAgIGdldFNldEdsb2JhbExvY2FsZSgnZW4nLCB7XG4gICAgICAgIGRheU9mTW9udGhPcmRpbmFsUGFyc2U6IC9cXGR7MSwyfSh0aHxzdHxuZHxyZCkvLFxuICAgICAgICBvcmRpbmFsIDogZnVuY3Rpb24gKG51bWJlcikge1xuICAgICAgICAgICAgdmFyIGIgPSBudW1iZXIgJSAxMCxcbiAgICAgICAgICAgICAgICBvdXRwdXQgPSAodG9JbnQobnVtYmVyICUgMTAwIC8gMTApID09PSAxKSA/ICd0aCcgOlxuICAgICAgICAgICAgICAgIChiID09PSAxKSA/ICdzdCcgOlxuICAgICAgICAgICAgICAgIChiID09PSAyKSA/ICduZCcgOlxuICAgICAgICAgICAgICAgIChiID09PSAzKSA/ICdyZCcgOiAndGgnO1xuICAgICAgICAgICAgcmV0dXJuIG51bWJlciArIG91dHB1dDtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gU2lkZSBlZmZlY3QgaW1wb3J0c1xuXG4gICAgaG9va3MubGFuZyA9IGRlcHJlY2F0ZSgnbW9tZW50LmxhbmcgaXMgZGVwcmVjYXRlZC4gVXNlIG1vbWVudC5sb2NhbGUgaW5zdGVhZC4nLCBnZXRTZXRHbG9iYWxMb2NhbGUpO1xuICAgIGhvb2tzLmxhbmdEYXRhID0gZGVwcmVjYXRlKCdtb21lbnQubGFuZ0RhdGEgaXMgZGVwcmVjYXRlZC4gVXNlIG1vbWVudC5sb2NhbGVEYXRhIGluc3RlYWQuJywgZ2V0TG9jYWxlKTtcblxuICAgIHZhciBtYXRoQWJzID0gTWF0aC5hYnM7XG5cbiAgICBmdW5jdGlvbiBhYnMgKCkge1xuICAgICAgICB2YXIgZGF0YSAgICAgICAgICAgPSB0aGlzLl9kYXRhO1xuXG4gICAgICAgIHRoaXMuX21pbGxpc2Vjb25kcyA9IG1hdGhBYnModGhpcy5fbWlsbGlzZWNvbmRzKTtcbiAgICAgICAgdGhpcy5fZGF5cyAgICAgICAgID0gbWF0aEFicyh0aGlzLl9kYXlzKTtcbiAgICAgICAgdGhpcy5fbW9udGhzICAgICAgID0gbWF0aEFicyh0aGlzLl9tb250aHMpO1xuXG4gICAgICAgIGRhdGEubWlsbGlzZWNvbmRzICA9IG1hdGhBYnMoZGF0YS5taWxsaXNlY29uZHMpO1xuICAgICAgICBkYXRhLnNlY29uZHMgICAgICAgPSBtYXRoQWJzKGRhdGEuc2Vjb25kcyk7XG4gICAgICAgIGRhdGEubWludXRlcyAgICAgICA9IG1hdGhBYnMoZGF0YS5taW51dGVzKTtcbiAgICAgICAgZGF0YS5ob3VycyAgICAgICAgID0gbWF0aEFicyhkYXRhLmhvdXJzKTtcbiAgICAgICAgZGF0YS5tb250aHMgICAgICAgID0gbWF0aEFicyhkYXRhLm1vbnRocyk7XG4gICAgICAgIGRhdGEueWVhcnMgICAgICAgICA9IG1hdGhBYnMoZGF0YS55ZWFycyk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYWRkU3VidHJhY3QkMSAoZHVyYXRpb24sIGlucHV0LCB2YWx1ZSwgZGlyZWN0aW9uKSB7XG4gICAgICAgIHZhciBvdGhlciA9IGNyZWF0ZUR1cmF0aW9uKGlucHV0LCB2YWx1ZSk7XG5cbiAgICAgICAgZHVyYXRpb24uX21pbGxpc2Vjb25kcyArPSBkaXJlY3Rpb24gKiBvdGhlci5fbWlsbGlzZWNvbmRzO1xuICAgICAgICBkdXJhdGlvbi5fZGF5cyAgICAgICAgICs9IGRpcmVjdGlvbiAqIG90aGVyLl9kYXlzO1xuICAgICAgICBkdXJhdGlvbi5fbW9udGhzICAgICAgICs9IGRpcmVjdGlvbiAqIG90aGVyLl9tb250aHM7XG5cbiAgICAgICAgcmV0dXJuIGR1cmF0aW9uLl9idWJibGUoKTtcbiAgICB9XG5cbiAgICAvLyBzdXBwb3J0cyBvbmx5IDIuMC1zdHlsZSBhZGQoMSwgJ3MnKSBvciBhZGQoZHVyYXRpb24pXG4gICAgZnVuY3Rpb24gYWRkJDEgKGlucHV0LCB2YWx1ZSkge1xuICAgICAgICByZXR1cm4gYWRkU3VidHJhY3QkMSh0aGlzLCBpbnB1dCwgdmFsdWUsIDEpO1xuICAgIH1cblxuICAgIC8vIHN1cHBvcnRzIG9ubHkgMi4wLXN0eWxlIHN1YnRyYWN0KDEsICdzJykgb3Igc3VidHJhY3QoZHVyYXRpb24pXG4gICAgZnVuY3Rpb24gc3VidHJhY3QkMSAoaW5wdXQsIHZhbHVlKSB7XG4gICAgICAgIHJldHVybiBhZGRTdWJ0cmFjdCQxKHRoaXMsIGlucHV0LCB2YWx1ZSwgLTEpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGFic0NlaWwgKG51bWJlcikge1xuICAgICAgICBpZiAobnVtYmVyIDwgMCkge1xuICAgICAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IobnVtYmVyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBNYXRoLmNlaWwobnVtYmVyKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGJ1YmJsZSAoKSB7XG4gICAgICAgIHZhciBtaWxsaXNlY29uZHMgPSB0aGlzLl9taWxsaXNlY29uZHM7XG4gICAgICAgIHZhciBkYXlzICAgICAgICAgPSB0aGlzLl9kYXlzO1xuICAgICAgICB2YXIgbW9udGhzICAgICAgID0gdGhpcy5fbW9udGhzO1xuICAgICAgICB2YXIgZGF0YSAgICAgICAgID0gdGhpcy5fZGF0YTtcbiAgICAgICAgdmFyIHNlY29uZHMsIG1pbnV0ZXMsIGhvdXJzLCB5ZWFycywgbW9udGhzRnJvbURheXM7XG5cbiAgICAgICAgLy8gaWYgd2UgaGF2ZSBhIG1peCBvZiBwb3NpdGl2ZSBhbmQgbmVnYXRpdmUgdmFsdWVzLCBidWJibGUgZG93biBmaXJzdFxuICAgICAgICAvLyBjaGVjazogaHR0cHM6Ly9naXRodWIuY29tL21vbWVudC9tb21lbnQvaXNzdWVzLzIxNjZcbiAgICAgICAgaWYgKCEoKG1pbGxpc2Vjb25kcyA+PSAwICYmIGRheXMgPj0gMCAmJiBtb250aHMgPj0gMCkgfHxcbiAgICAgICAgICAgICAgICAobWlsbGlzZWNvbmRzIDw9IDAgJiYgZGF5cyA8PSAwICYmIG1vbnRocyA8PSAwKSkpIHtcbiAgICAgICAgICAgIG1pbGxpc2Vjb25kcyArPSBhYnNDZWlsKG1vbnRoc1RvRGF5cyhtb250aHMpICsgZGF5cykgKiA4NjRlNTtcbiAgICAgICAgICAgIGRheXMgPSAwO1xuICAgICAgICAgICAgbW9udGhzID0gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRoZSBmb2xsb3dpbmcgY29kZSBidWJibGVzIHVwIHZhbHVlcywgc2VlIHRoZSB0ZXN0cyBmb3JcbiAgICAgICAgLy8gZXhhbXBsZXMgb2Ygd2hhdCB0aGF0IG1lYW5zLlxuICAgICAgICBkYXRhLm1pbGxpc2Vjb25kcyA9IG1pbGxpc2Vjb25kcyAlIDEwMDA7XG5cbiAgICAgICAgc2Vjb25kcyAgICAgICAgICAgPSBhYnNGbG9vcihtaWxsaXNlY29uZHMgLyAxMDAwKTtcbiAgICAgICAgZGF0YS5zZWNvbmRzICAgICAgPSBzZWNvbmRzICUgNjA7XG5cbiAgICAgICAgbWludXRlcyAgICAgICAgICAgPSBhYnNGbG9vcihzZWNvbmRzIC8gNjApO1xuICAgICAgICBkYXRhLm1pbnV0ZXMgICAgICA9IG1pbnV0ZXMgJSA2MDtcblxuICAgICAgICBob3VycyAgICAgICAgICAgICA9IGFic0Zsb29yKG1pbnV0ZXMgLyA2MCk7XG4gICAgICAgIGRhdGEuaG91cnMgICAgICAgID0gaG91cnMgJSAyNDtcblxuICAgICAgICBkYXlzICs9IGFic0Zsb29yKGhvdXJzIC8gMjQpO1xuXG4gICAgICAgIC8vIGNvbnZlcnQgZGF5cyB0byBtb250aHNcbiAgICAgICAgbW9udGhzRnJvbURheXMgPSBhYnNGbG9vcihkYXlzVG9Nb250aHMoZGF5cykpO1xuICAgICAgICBtb250aHMgKz0gbW9udGhzRnJvbURheXM7XG4gICAgICAgIGRheXMgLT0gYWJzQ2VpbChtb250aHNUb0RheXMobW9udGhzRnJvbURheXMpKTtcblxuICAgICAgICAvLyAxMiBtb250aHMgLT4gMSB5ZWFyXG4gICAgICAgIHllYXJzID0gYWJzRmxvb3IobW9udGhzIC8gMTIpO1xuICAgICAgICBtb250aHMgJT0gMTI7XG5cbiAgICAgICAgZGF0YS5kYXlzICAgPSBkYXlzO1xuICAgICAgICBkYXRhLm1vbnRocyA9IG1vbnRocztcbiAgICAgICAgZGF0YS55ZWFycyAgPSB5ZWFycztcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBkYXlzVG9Nb250aHMgKGRheXMpIHtcbiAgICAgICAgLy8gNDAwIHllYXJzIGhhdmUgMTQ2MDk3IGRheXMgKHRha2luZyBpbnRvIGFjY291bnQgbGVhcCB5ZWFyIHJ1bGVzKVxuICAgICAgICAvLyA0MDAgeWVhcnMgaGF2ZSAxMiBtb250aHMgPT09IDQ4MDBcbiAgICAgICAgcmV0dXJuIGRheXMgKiA0ODAwIC8gMTQ2MDk3O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG1vbnRoc1RvRGF5cyAobW9udGhzKSB7XG4gICAgICAgIC8vIHRoZSByZXZlcnNlIG9mIGRheXNUb01vbnRoc1xuICAgICAgICByZXR1cm4gbW9udGhzICogMTQ2MDk3IC8gNDgwMDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBhcyAodW5pdHMpIHtcbiAgICAgICAgaWYgKCF0aGlzLmlzVmFsaWQoKSkge1xuICAgICAgICAgICAgcmV0dXJuIE5hTjtcbiAgICAgICAgfVxuICAgICAgICB2YXIgZGF5cztcbiAgICAgICAgdmFyIG1vbnRocztcbiAgICAgICAgdmFyIG1pbGxpc2Vjb25kcyA9IHRoaXMuX21pbGxpc2Vjb25kcztcblxuICAgICAgICB1bml0cyA9IG5vcm1hbGl6ZVVuaXRzKHVuaXRzKTtcblxuICAgICAgICBpZiAodW5pdHMgPT09ICdtb250aCcgfHwgdW5pdHMgPT09ICd5ZWFyJykge1xuICAgICAgICAgICAgZGF5cyAgID0gdGhpcy5fZGF5cyAgICsgbWlsbGlzZWNvbmRzIC8gODY0ZTU7XG4gICAgICAgICAgICBtb250aHMgPSB0aGlzLl9tb250aHMgKyBkYXlzVG9Nb250aHMoZGF5cyk7XG4gICAgICAgICAgICByZXR1cm4gdW5pdHMgPT09ICdtb250aCcgPyBtb250aHMgOiBtb250aHMgLyAxMjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIGhhbmRsZSBtaWxsaXNlY29uZHMgc2VwYXJhdGVseSBiZWNhdXNlIG9mIGZsb2F0aW5nIHBvaW50IG1hdGggZXJyb3JzIChpc3N1ZSAjMTg2NylcbiAgICAgICAgICAgIGRheXMgPSB0aGlzLl9kYXlzICsgTWF0aC5yb3VuZChtb250aHNUb0RheXModGhpcy5fbW9udGhzKSk7XG4gICAgICAgICAgICBzd2l0Y2ggKHVuaXRzKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnd2VlaycgICA6IHJldHVybiBkYXlzIC8gNyAgICAgKyBtaWxsaXNlY29uZHMgLyA2MDQ4ZTU7XG4gICAgICAgICAgICAgICAgY2FzZSAnZGF5JyAgICA6IHJldHVybiBkYXlzICAgICAgICAgKyBtaWxsaXNlY29uZHMgLyA4NjRlNTtcbiAgICAgICAgICAgICAgICBjYXNlICdob3VyJyAgIDogcmV0dXJuIGRheXMgKiAyNCAgICArIG1pbGxpc2Vjb25kcyAvIDM2ZTU7XG4gICAgICAgICAgICAgICAgY2FzZSAnbWludXRlJyA6IHJldHVybiBkYXlzICogMTQ0MCAgKyBtaWxsaXNlY29uZHMgLyA2ZTQ7XG4gICAgICAgICAgICAgICAgY2FzZSAnc2Vjb25kJyA6IHJldHVybiBkYXlzICogODY0MDAgKyBtaWxsaXNlY29uZHMgLyAxMDAwO1xuICAgICAgICAgICAgICAgIC8vIE1hdGguZmxvb3IgcHJldmVudHMgZmxvYXRpbmcgcG9pbnQgbWF0aCBlcnJvcnMgaGVyZVxuICAgICAgICAgICAgICAgIGNhc2UgJ21pbGxpc2Vjb25kJzogcmV0dXJuIE1hdGguZmxvb3IoZGF5cyAqIDg2NGU1KSArIG1pbGxpc2Vjb25kcztcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gdW5pdCAnICsgdW5pdHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gVE9ETzogVXNlIHRoaXMuYXMoJ21zJyk/XG4gICAgZnVuY3Rpb24gdmFsdWVPZiQxICgpIHtcbiAgICAgICAgaWYgKCF0aGlzLmlzVmFsaWQoKSkge1xuICAgICAgICAgICAgcmV0dXJuIE5hTjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgdGhpcy5fbWlsbGlzZWNvbmRzICtcbiAgICAgICAgICAgIHRoaXMuX2RheXMgKiA4NjRlNSArXG4gICAgICAgICAgICAodGhpcy5fbW9udGhzICUgMTIpICogMjU5MmU2ICtcbiAgICAgICAgICAgIHRvSW50KHRoaXMuX21vbnRocyAvIDEyKSAqIDMxNTM2ZTZcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBtYWtlQXMgKGFsaWFzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5hcyhhbGlhcyk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgdmFyIGFzTWlsbGlzZWNvbmRzID0gbWFrZUFzKCdtcycpO1xuICAgIHZhciBhc1NlY29uZHMgICAgICA9IG1ha2VBcygncycpO1xuICAgIHZhciBhc01pbnV0ZXMgICAgICA9IG1ha2VBcygnbScpO1xuICAgIHZhciBhc0hvdXJzICAgICAgICA9IG1ha2VBcygnaCcpO1xuICAgIHZhciBhc0RheXMgICAgICAgICA9IG1ha2VBcygnZCcpO1xuICAgIHZhciBhc1dlZWtzICAgICAgICA9IG1ha2VBcygndycpO1xuICAgIHZhciBhc01vbnRocyAgICAgICA9IG1ha2VBcygnTScpO1xuICAgIHZhciBhc1llYXJzICAgICAgICA9IG1ha2VBcygneScpO1xuXG4gICAgZnVuY3Rpb24gY2xvbmUkMSAoKSB7XG4gICAgICAgIHJldHVybiBjcmVhdGVEdXJhdGlvbih0aGlzKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXQkMiAodW5pdHMpIHtcbiAgICAgICAgdW5pdHMgPSBub3JtYWxpemVVbml0cyh1bml0cyk7XG4gICAgICAgIHJldHVybiB0aGlzLmlzVmFsaWQoKSA/IHRoaXNbdW5pdHMgKyAncyddKCkgOiBOYU47XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbWFrZUdldHRlcihuYW1lKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5pc1ZhbGlkKCkgPyB0aGlzLl9kYXRhW25hbWVdIDogTmFOO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIHZhciBtaWxsaXNlY29uZHMgPSBtYWtlR2V0dGVyKCdtaWxsaXNlY29uZHMnKTtcbiAgICB2YXIgc2Vjb25kcyAgICAgID0gbWFrZUdldHRlcignc2Vjb25kcycpO1xuICAgIHZhciBtaW51dGVzICAgICAgPSBtYWtlR2V0dGVyKCdtaW51dGVzJyk7XG4gICAgdmFyIGhvdXJzICAgICAgICA9IG1ha2VHZXR0ZXIoJ2hvdXJzJyk7XG4gICAgdmFyIGRheXMgICAgICAgICA9IG1ha2VHZXR0ZXIoJ2RheXMnKTtcbiAgICB2YXIgbW9udGhzICAgICAgID0gbWFrZUdldHRlcignbW9udGhzJyk7XG4gICAgdmFyIHllYXJzICAgICAgICA9IG1ha2VHZXR0ZXIoJ3llYXJzJyk7XG5cbiAgICBmdW5jdGlvbiB3ZWVrcyAoKSB7XG4gICAgICAgIHJldHVybiBhYnNGbG9vcih0aGlzLmRheXMoKSAvIDcpO1xuICAgIH1cblxuICAgIHZhciByb3VuZCA9IE1hdGgucm91bmQ7XG4gICAgdmFyIHRocmVzaG9sZHMgPSB7XG4gICAgICAgIHNzOiA0NCwgICAgICAgICAvLyBhIGZldyBzZWNvbmRzIHRvIHNlY29uZHNcbiAgICAgICAgcyA6IDQ1LCAgICAgICAgIC8vIHNlY29uZHMgdG8gbWludXRlXG4gICAgICAgIG0gOiA0NSwgICAgICAgICAvLyBtaW51dGVzIHRvIGhvdXJcbiAgICAgICAgaCA6IDIyLCAgICAgICAgIC8vIGhvdXJzIHRvIGRheVxuICAgICAgICBkIDogMjYsICAgICAgICAgLy8gZGF5cyB0byBtb250aFxuICAgICAgICBNIDogMTEgICAgICAgICAgLy8gbW9udGhzIHRvIHllYXJcbiAgICB9O1xuXG4gICAgLy8gaGVscGVyIGZ1bmN0aW9uIGZvciBtb21lbnQuZm4uZnJvbSwgbW9tZW50LmZuLmZyb21Ob3csIGFuZCBtb21lbnQuZHVyYXRpb24uZm4uaHVtYW5pemVcbiAgICBmdW5jdGlvbiBzdWJzdGl0dXRlVGltZUFnbyhzdHJpbmcsIG51bWJlciwgd2l0aG91dFN1ZmZpeCwgaXNGdXR1cmUsIGxvY2FsZSkge1xuICAgICAgICByZXR1cm4gbG9jYWxlLnJlbGF0aXZlVGltZShudW1iZXIgfHwgMSwgISF3aXRob3V0U3VmZml4LCBzdHJpbmcsIGlzRnV0dXJlKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZWxhdGl2ZVRpbWUkMSAocG9zTmVnRHVyYXRpb24sIHdpdGhvdXRTdWZmaXgsIGxvY2FsZSkge1xuICAgICAgICB2YXIgZHVyYXRpb24gPSBjcmVhdGVEdXJhdGlvbihwb3NOZWdEdXJhdGlvbikuYWJzKCk7XG4gICAgICAgIHZhciBzZWNvbmRzICA9IHJvdW5kKGR1cmF0aW9uLmFzKCdzJykpO1xuICAgICAgICB2YXIgbWludXRlcyAgPSByb3VuZChkdXJhdGlvbi5hcygnbScpKTtcbiAgICAgICAgdmFyIGhvdXJzICAgID0gcm91bmQoZHVyYXRpb24uYXMoJ2gnKSk7XG4gICAgICAgIHZhciBkYXlzICAgICA9IHJvdW5kKGR1cmF0aW9uLmFzKCdkJykpO1xuICAgICAgICB2YXIgbW9udGhzICAgPSByb3VuZChkdXJhdGlvbi5hcygnTScpKTtcbiAgICAgICAgdmFyIHllYXJzICAgID0gcm91bmQoZHVyYXRpb24uYXMoJ3knKSk7XG5cbiAgICAgICAgdmFyIGEgPSBzZWNvbmRzIDw9IHRocmVzaG9sZHMuc3MgJiYgWydzJywgc2Vjb25kc10gIHx8XG4gICAgICAgICAgICAgICAgc2Vjb25kcyA8IHRocmVzaG9sZHMucyAgICYmIFsnc3MnLCBzZWNvbmRzXSB8fFxuICAgICAgICAgICAgICAgIG1pbnV0ZXMgPD0gMSAgICAgICAgICAgICAmJiBbJ20nXSAgICAgICAgICAgfHxcbiAgICAgICAgICAgICAgICBtaW51dGVzIDwgdGhyZXNob2xkcy5tICAgJiYgWydtbScsIG1pbnV0ZXNdIHx8XG4gICAgICAgICAgICAgICAgaG91cnMgICA8PSAxICAgICAgICAgICAgICYmIFsnaCddICAgICAgICAgICB8fFxuICAgICAgICAgICAgICAgIGhvdXJzICAgPCB0aHJlc2hvbGRzLmggICAmJiBbJ2hoJywgaG91cnNdICAgfHxcbiAgICAgICAgICAgICAgICBkYXlzICAgIDw9IDEgICAgICAgICAgICAgJiYgWydkJ10gICAgICAgICAgIHx8XG4gICAgICAgICAgICAgICAgZGF5cyAgICA8IHRocmVzaG9sZHMuZCAgICYmIFsnZGQnLCBkYXlzXSAgICB8fFxuICAgICAgICAgICAgICAgIG1vbnRocyAgPD0gMSAgICAgICAgICAgICAmJiBbJ00nXSAgICAgICAgICAgfHxcbiAgICAgICAgICAgICAgICBtb250aHMgIDwgdGhyZXNob2xkcy5NICAgJiYgWydNTScsIG1vbnRoc10gIHx8XG4gICAgICAgICAgICAgICAgeWVhcnMgICA8PSAxICAgICAgICAgICAgICYmIFsneSddICAgICAgICAgICB8fCBbJ3l5JywgeWVhcnNdO1xuXG4gICAgICAgIGFbMl0gPSB3aXRob3V0U3VmZml4O1xuICAgICAgICBhWzNdID0gK3Bvc05lZ0R1cmF0aW9uID4gMDtcbiAgICAgICAgYVs0XSA9IGxvY2FsZTtcbiAgICAgICAgcmV0dXJuIHN1YnN0aXR1dGVUaW1lQWdvLmFwcGx5KG51bGwsIGEpO1xuICAgIH1cblxuICAgIC8vIFRoaXMgZnVuY3Rpb24gYWxsb3dzIHlvdSB0byBzZXQgdGhlIHJvdW5kaW5nIGZ1bmN0aW9uIGZvciByZWxhdGl2ZSB0aW1lIHN0cmluZ3NcbiAgICBmdW5jdGlvbiBnZXRTZXRSZWxhdGl2ZVRpbWVSb3VuZGluZyAocm91bmRpbmdGdW5jdGlvbikge1xuICAgICAgICBpZiAocm91bmRpbmdGdW5jdGlvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gcm91bmQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZihyb3VuZGluZ0Z1bmN0aW9uKSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgcm91bmQgPSByb3VuZGluZ0Z1bmN0aW9uO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8vIFRoaXMgZnVuY3Rpb24gYWxsb3dzIHlvdSB0byBzZXQgYSB0aHJlc2hvbGQgZm9yIHJlbGF0aXZlIHRpbWUgc3RyaW5nc1xuICAgIGZ1bmN0aW9uIGdldFNldFJlbGF0aXZlVGltZVRocmVzaG9sZCAodGhyZXNob2xkLCBsaW1pdCkge1xuICAgICAgICBpZiAodGhyZXNob2xkc1t0aHJlc2hvbGRdID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobGltaXQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRocmVzaG9sZHNbdGhyZXNob2xkXTtcbiAgICAgICAgfVxuICAgICAgICB0aHJlc2hvbGRzW3RocmVzaG9sZF0gPSBsaW1pdDtcbiAgICAgICAgaWYgKHRocmVzaG9sZCA9PT0gJ3MnKSB7XG4gICAgICAgICAgICB0aHJlc2hvbGRzLnNzID0gbGltaXQgLSAxO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGh1bWFuaXplICh3aXRoU3VmZml4KSB7XG4gICAgICAgIGlmICghdGhpcy5pc1ZhbGlkKCkpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmxvY2FsZURhdGEoKS5pbnZhbGlkRGF0ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGxvY2FsZSA9IHRoaXMubG9jYWxlRGF0YSgpO1xuICAgICAgICB2YXIgb3V0cHV0ID0gcmVsYXRpdmVUaW1lJDEodGhpcywgIXdpdGhTdWZmaXgsIGxvY2FsZSk7XG5cbiAgICAgICAgaWYgKHdpdGhTdWZmaXgpIHtcbiAgICAgICAgICAgIG91dHB1dCA9IGxvY2FsZS5wYXN0RnV0dXJlKCt0aGlzLCBvdXRwdXQpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGxvY2FsZS5wb3N0Zm9ybWF0KG91dHB1dCk7XG4gICAgfVxuXG4gICAgdmFyIGFicyQxID0gTWF0aC5hYnM7XG5cbiAgICBmdW5jdGlvbiBzaWduKHgpIHtcbiAgICAgICAgcmV0dXJuICgoeCA+IDApIC0gKHggPCAwKSkgfHwgK3g7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdG9JU09TdHJpbmckMSgpIHtcbiAgICAgICAgLy8gZm9yIElTTyBzdHJpbmdzIHdlIGRvIG5vdCB1c2UgdGhlIG5vcm1hbCBidWJibGluZyBydWxlczpcbiAgICAgICAgLy8gICogbWlsbGlzZWNvbmRzIGJ1YmJsZSB1cCB1bnRpbCB0aGV5IGJlY29tZSBob3Vyc1xuICAgICAgICAvLyAgKiBkYXlzIGRvIG5vdCBidWJibGUgYXQgYWxsXG4gICAgICAgIC8vICAqIG1vbnRocyBidWJibGUgdXAgdW50aWwgdGhleSBiZWNvbWUgeWVhcnNcbiAgICAgICAgLy8gVGhpcyBpcyBiZWNhdXNlIHRoZXJlIGlzIG5vIGNvbnRleHQtZnJlZSBjb252ZXJzaW9uIGJldHdlZW4gaG91cnMgYW5kIGRheXNcbiAgICAgICAgLy8gKHRoaW5rIG9mIGNsb2NrIGNoYW5nZXMpXG4gICAgICAgIC8vIGFuZCBhbHNvIG5vdCBiZXR3ZWVuIGRheXMgYW5kIG1vbnRocyAoMjgtMzEgZGF5cyBwZXIgbW9udGgpXG4gICAgICAgIGlmICghdGhpcy5pc1ZhbGlkKCkpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmxvY2FsZURhdGEoKS5pbnZhbGlkRGF0ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHNlY29uZHMgPSBhYnMkMSh0aGlzLl9taWxsaXNlY29uZHMpIC8gMTAwMDtcbiAgICAgICAgdmFyIGRheXMgICAgICAgICA9IGFicyQxKHRoaXMuX2RheXMpO1xuICAgICAgICB2YXIgbW9udGhzICAgICAgID0gYWJzJDEodGhpcy5fbW9udGhzKTtcbiAgICAgICAgdmFyIG1pbnV0ZXMsIGhvdXJzLCB5ZWFycztcblxuICAgICAgICAvLyAzNjAwIHNlY29uZHMgLT4gNjAgbWludXRlcyAtPiAxIGhvdXJcbiAgICAgICAgbWludXRlcyAgICAgICAgICAgPSBhYnNGbG9vcihzZWNvbmRzIC8gNjApO1xuICAgICAgICBob3VycyAgICAgICAgICAgICA9IGFic0Zsb29yKG1pbnV0ZXMgLyA2MCk7XG4gICAgICAgIHNlY29uZHMgJT0gNjA7XG4gICAgICAgIG1pbnV0ZXMgJT0gNjA7XG5cbiAgICAgICAgLy8gMTIgbW9udGhzIC0+IDEgeWVhclxuICAgICAgICB5ZWFycyAgPSBhYnNGbG9vcihtb250aHMgLyAxMik7XG4gICAgICAgIG1vbnRocyAlPSAxMjtcblxuXG4gICAgICAgIC8vIGluc3BpcmVkIGJ5IGh0dHBzOi8vZ2l0aHViLmNvbS9kb3JkaWxsZS9tb21lbnQtaXNvZHVyYXRpb24vYmxvYi9tYXN0ZXIvbW9tZW50Lmlzb2R1cmF0aW9uLmpzXG4gICAgICAgIHZhciBZID0geWVhcnM7XG4gICAgICAgIHZhciBNID0gbW9udGhzO1xuICAgICAgICB2YXIgRCA9IGRheXM7XG4gICAgICAgIHZhciBoID0gaG91cnM7XG4gICAgICAgIHZhciBtID0gbWludXRlcztcbiAgICAgICAgdmFyIHMgPSBzZWNvbmRzID8gc2Vjb25kcy50b0ZpeGVkKDMpLnJlcGxhY2UoL1xcLj8wKyQvLCAnJykgOiAnJztcbiAgICAgICAgdmFyIHRvdGFsID0gdGhpcy5hc1NlY29uZHMoKTtcblxuICAgICAgICBpZiAoIXRvdGFsKSB7XG4gICAgICAgICAgICAvLyB0aGlzIGlzIHRoZSBzYW1lIGFzIEMjJ3MgKE5vZGEpIGFuZCBweXRob24gKGlzb2RhdGUpLi4uXG4gICAgICAgICAgICAvLyBidXQgbm90IG90aGVyIEpTIChnb29nLmRhdGUpXG4gICAgICAgICAgICByZXR1cm4gJ1AwRCc7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgdG90YWxTaWduID0gdG90YWwgPCAwID8gJy0nIDogJyc7XG4gICAgICAgIHZhciB5bVNpZ24gPSBzaWduKHRoaXMuX21vbnRocykgIT09IHNpZ24odG90YWwpID8gJy0nIDogJyc7XG4gICAgICAgIHZhciBkYXlzU2lnbiA9IHNpZ24odGhpcy5fZGF5cykgIT09IHNpZ24odG90YWwpID8gJy0nIDogJyc7XG4gICAgICAgIHZhciBobXNTaWduID0gc2lnbih0aGlzLl9taWxsaXNlY29uZHMpICE9PSBzaWduKHRvdGFsKSA/ICctJyA6ICcnO1xuXG4gICAgICAgIHJldHVybiB0b3RhbFNpZ24gKyAnUCcgK1xuICAgICAgICAgICAgKFkgPyB5bVNpZ24gKyBZICsgJ1knIDogJycpICtcbiAgICAgICAgICAgIChNID8geW1TaWduICsgTSArICdNJyA6ICcnKSArXG4gICAgICAgICAgICAoRCA/IGRheXNTaWduICsgRCArICdEJyA6ICcnKSArXG4gICAgICAgICAgICAoKGggfHwgbSB8fCBzKSA/ICdUJyA6ICcnKSArXG4gICAgICAgICAgICAoaCA/IGhtc1NpZ24gKyBoICsgJ0gnIDogJycpICtcbiAgICAgICAgICAgIChtID8gaG1zU2lnbiArIG0gKyAnTScgOiAnJykgK1xuICAgICAgICAgICAgKHMgPyBobXNTaWduICsgcyArICdTJyA6ICcnKTtcbiAgICB9XG5cbiAgICB2YXIgcHJvdG8kMiA9IER1cmF0aW9uLnByb3RvdHlwZTtcblxuICAgIHByb3RvJDIuaXNWYWxpZCAgICAgICAgPSBpc1ZhbGlkJDE7XG4gICAgcHJvdG8kMi5hYnMgICAgICAgICAgICA9IGFicztcbiAgICBwcm90byQyLmFkZCAgICAgICAgICAgID0gYWRkJDE7XG4gICAgcHJvdG8kMi5zdWJ0cmFjdCAgICAgICA9IHN1YnRyYWN0JDE7XG4gICAgcHJvdG8kMi5hcyAgICAgICAgICAgICA9IGFzO1xuICAgIHByb3RvJDIuYXNNaWxsaXNlY29uZHMgPSBhc01pbGxpc2Vjb25kcztcbiAgICBwcm90byQyLmFzU2Vjb25kcyAgICAgID0gYXNTZWNvbmRzO1xuICAgIHByb3RvJDIuYXNNaW51dGVzICAgICAgPSBhc01pbnV0ZXM7XG4gICAgcHJvdG8kMi5hc0hvdXJzICAgICAgICA9IGFzSG91cnM7XG4gICAgcHJvdG8kMi5hc0RheXMgICAgICAgICA9IGFzRGF5cztcbiAgICBwcm90byQyLmFzV2Vla3MgICAgICAgID0gYXNXZWVrcztcbiAgICBwcm90byQyLmFzTW9udGhzICAgICAgID0gYXNNb250aHM7XG4gICAgcHJvdG8kMi5hc1llYXJzICAgICAgICA9IGFzWWVhcnM7XG4gICAgcHJvdG8kMi52YWx1ZU9mICAgICAgICA9IHZhbHVlT2YkMTtcbiAgICBwcm90byQyLl9idWJibGUgICAgICAgID0gYnViYmxlO1xuICAgIHByb3RvJDIuY2xvbmUgICAgICAgICAgPSBjbG9uZSQxO1xuICAgIHByb3RvJDIuZ2V0ICAgICAgICAgICAgPSBnZXQkMjtcbiAgICBwcm90byQyLm1pbGxpc2Vjb25kcyAgID0gbWlsbGlzZWNvbmRzO1xuICAgIHByb3RvJDIuc2Vjb25kcyAgICAgICAgPSBzZWNvbmRzO1xuICAgIHByb3RvJDIubWludXRlcyAgICAgICAgPSBtaW51dGVzO1xuICAgIHByb3RvJDIuaG91cnMgICAgICAgICAgPSBob3VycztcbiAgICBwcm90byQyLmRheXMgICAgICAgICAgID0gZGF5cztcbiAgICBwcm90byQyLndlZWtzICAgICAgICAgID0gd2Vla3M7XG4gICAgcHJvdG8kMi5tb250aHMgICAgICAgICA9IG1vbnRocztcbiAgICBwcm90byQyLnllYXJzICAgICAgICAgID0geWVhcnM7XG4gICAgcHJvdG8kMi5odW1hbml6ZSAgICAgICA9IGh1bWFuaXplO1xuICAgIHByb3RvJDIudG9JU09TdHJpbmcgICAgPSB0b0lTT1N0cmluZyQxO1xuICAgIHByb3RvJDIudG9TdHJpbmcgICAgICAgPSB0b0lTT1N0cmluZyQxO1xuICAgIHByb3RvJDIudG9KU09OICAgICAgICAgPSB0b0lTT1N0cmluZyQxO1xuICAgIHByb3RvJDIubG9jYWxlICAgICAgICAgPSBsb2NhbGU7XG4gICAgcHJvdG8kMi5sb2NhbGVEYXRhICAgICA9IGxvY2FsZURhdGE7XG5cbiAgICBwcm90byQyLnRvSXNvU3RyaW5nID0gZGVwcmVjYXRlKCd0b0lzb1N0cmluZygpIGlzIGRlcHJlY2F0ZWQuIFBsZWFzZSB1c2UgdG9JU09TdHJpbmcoKSBpbnN0ZWFkIChub3RpY2UgdGhlIGNhcGl0YWxzKScsIHRvSVNPU3RyaW5nJDEpO1xuICAgIHByb3RvJDIubGFuZyA9IGxhbmc7XG5cbiAgICAvLyBTaWRlIGVmZmVjdCBpbXBvcnRzXG5cbiAgICAvLyBGT1JNQVRUSU5HXG5cbiAgICBhZGRGb3JtYXRUb2tlbignWCcsIDAsIDAsICd1bml4Jyk7XG4gICAgYWRkRm9ybWF0VG9rZW4oJ3gnLCAwLCAwLCAndmFsdWVPZicpO1xuXG4gICAgLy8gUEFSU0lOR1xuXG4gICAgYWRkUmVnZXhUb2tlbigneCcsIG1hdGNoU2lnbmVkKTtcbiAgICBhZGRSZWdleFRva2VuKCdYJywgbWF0Y2hUaW1lc3RhbXApO1xuICAgIGFkZFBhcnNlVG9rZW4oJ1gnLCBmdW5jdGlvbiAoaW5wdXQsIGFycmF5LCBjb25maWcpIHtcbiAgICAgICAgY29uZmlnLl9kID0gbmV3IERhdGUocGFyc2VGbG9hdChpbnB1dCwgMTApICogMTAwMCk7XG4gICAgfSk7XG4gICAgYWRkUGFyc2VUb2tlbigneCcsIGZ1bmN0aW9uIChpbnB1dCwgYXJyYXksIGNvbmZpZykge1xuICAgICAgICBjb25maWcuX2QgPSBuZXcgRGF0ZSh0b0ludChpbnB1dCkpO1xuICAgIH0pO1xuXG4gICAgLy8gU2lkZSBlZmZlY3QgaW1wb3J0c1xuXG5cbiAgICBob29rcy52ZXJzaW9uID0gJzIuMjIuMic7XG5cbiAgICBzZXRIb29rQ2FsbGJhY2soY3JlYXRlTG9jYWwpO1xuXG4gICAgaG9va3MuZm4gICAgICAgICAgICAgICAgICAgID0gcHJvdG87XG4gICAgaG9va3MubWluICAgICAgICAgICAgICAgICAgID0gbWluO1xuICAgIGhvb2tzLm1heCAgICAgICAgICAgICAgICAgICA9IG1heDtcbiAgICBob29rcy5ub3cgICAgICAgICAgICAgICAgICAgPSBub3c7XG4gICAgaG9va3MudXRjICAgICAgICAgICAgICAgICAgID0gY3JlYXRlVVRDO1xuICAgIGhvb2tzLnVuaXggICAgICAgICAgICAgICAgICA9IGNyZWF0ZVVuaXg7XG4gICAgaG9va3MubW9udGhzICAgICAgICAgICAgICAgID0gbGlzdE1vbnRocztcbiAgICBob29rcy5pc0RhdGUgICAgICAgICAgICAgICAgPSBpc0RhdGU7XG4gICAgaG9va3MubG9jYWxlICAgICAgICAgICAgICAgID0gZ2V0U2V0R2xvYmFsTG9jYWxlO1xuICAgIGhvb2tzLmludmFsaWQgICAgICAgICAgICAgICA9IGNyZWF0ZUludmFsaWQ7XG4gICAgaG9va3MuZHVyYXRpb24gICAgICAgICAgICAgID0gY3JlYXRlRHVyYXRpb247XG4gICAgaG9va3MuaXNNb21lbnQgICAgICAgICAgICAgID0gaXNNb21lbnQ7XG4gICAgaG9va3Mud2Vla2RheXMgICAgICAgICAgICAgID0gbGlzdFdlZWtkYXlzO1xuICAgIGhvb2tzLnBhcnNlWm9uZSAgICAgICAgICAgICA9IGNyZWF0ZUluWm9uZTtcbiAgICBob29rcy5sb2NhbGVEYXRhICAgICAgICAgICAgPSBnZXRMb2NhbGU7XG4gICAgaG9va3MuaXNEdXJhdGlvbiAgICAgICAgICAgID0gaXNEdXJhdGlvbjtcbiAgICBob29rcy5tb250aHNTaG9ydCAgICAgICAgICAgPSBsaXN0TW9udGhzU2hvcnQ7XG4gICAgaG9va3Mud2Vla2RheXNNaW4gICAgICAgICAgID0gbGlzdFdlZWtkYXlzTWluO1xuICAgIGhvb2tzLmRlZmluZUxvY2FsZSAgICAgICAgICA9IGRlZmluZUxvY2FsZTtcbiAgICBob29rcy51cGRhdGVMb2NhbGUgICAgICAgICAgPSB1cGRhdGVMb2NhbGU7XG4gICAgaG9va3MubG9jYWxlcyAgICAgICAgICAgICAgID0gbGlzdExvY2FsZXM7XG4gICAgaG9va3Mud2Vla2RheXNTaG9ydCAgICAgICAgID0gbGlzdFdlZWtkYXlzU2hvcnQ7XG4gICAgaG9va3Mubm9ybWFsaXplVW5pdHMgICAgICAgID0gbm9ybWFsaXplVW5pdHM7XG4gICAgaG9va3MucmVsYXRpdmVUaW1lUm91bmRpbmcgID0gZ2V0U2V0UmVsYXRpdmVUaW1lUm91bmRpbmc7XG4gICAgaG9va3MucmVsYXRpdmVUaW1lVGhyZXNob2xkID0gZ2V0U2V0UmVsYXRpdmVUaW1lVGhyZXNob2xkO1xuICAgIGhvb2tzLmNhbGVuZGFyRm9ybWF0ICAgICAgICA9IGdldENhbGVuZGFyRm9ybWF0O1xuICAgIGhvb2tzLnByb3RvdHlwZSAgICAgICAgICAgICA9IHByb3RvO1xuXG4gICAgLy8gY3VycmVudGx5IEhUTUw1IGlucHV0IHR5cGUgb25seSBzdXBwb3J0cyAyNC1ob3VyIGZvcm1hdHNcbiAgICBob29rcy5IVE1MNV9GTVQgPSB7XG4gICAgICAgIERBVEVUSU1FX0xPQ0FMOiAnWVlZWS1NTS1ERFRISDptbScsICAgICAgICAgICAgIC8vIDxpbnB1dCB0eXBlPVwiZGF0ZXRpbWUtbG9jYWxcIiAvPlxuICAgICAgICBEQVRFVElNRV9MT0NBTF9TRUNPTkRTOiAnWVlZWS1NTS1ERFRISDptbTpzcycsICAvLyA8aW5wdXQgdHlwZT1cImRhdGV0aW1lLWxvY2FsXCIgc3RlcD1cIjFcIiAvPlxuICAgICAgICBEQVRFVElNRV9MT0NBTF9NUzogJ1lZWVktTU0tRERUSEg6bW06c3MuU1NTJywgICAvLyA8aW5wdXQgdHlwZT1cImRhdGV0aW1lLWxvY2FsXCIgc3RlcD1cIjAuMDAxXCIgLz5cbiAgICAgICAgREFURTogJ1lZWVktTU0tREQnLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gPGlucHV0IHR5cGU9XCJkYXRlXCIgLz5cbiAgICAgICAgVElNRTogJ0hIOm1tJywgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gPGlucHV0IHR5cGU9XCJ0aW1lXCIgLz5cbiAgICAgICAgVElNRV9TRUNPTkRTOiAnSEg6bW06c3MnLCAgICAgICAgICAgICAgICAgICAgICAgLy8gPGlucHV0IHR5cGU9XCJ0aW1lXCIgc3RlcD1cIjFcIiAvPlxuICAgICAgICBUSU1FX01TOiAnSEg6bW06c3MuU1NTJywgICAgICAgICAgICAgICAgICAgICAgICAvLyA8aW5wdXQgdHlwZT1cInRpbWVcIiBzdGVwPVwiMC4wMDFcIiAvPlxuICAgICAgICBXRUVLOiAnWVlZWS1bV11XVycsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyA8aW5wdXQgdHlwZT1cIndlZWtcIiAvPlxuICAgICAgICBNT05USDogJ1lZWVktTU0nICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyA8aW5wdXQgdHlwZT1cIm1vbnRoXCIgLz5cbiAgICB9O1xuXG4gICAgcmV0dXJuIGhvb2tzO1xuXG59KSkpO1xuIiwiLyogc21vb3Roc2Nyb2xsIHYwLjQuMCAtIDIwMTggLSBEdXN0YW4gS2FzdGVuLCBKZXJlbWlhcyBNZW5pY2hlbGxpIC0gTUlUIExpY2Vuc2UgKi9cbihmdW5jdGlvbiAoKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICAvLyBwb2x5ZmlsbFxuICBmdW5jdGlvbiBwb2x5ZmlsbCgpIHtcbiAgICAvLyBhbGlhc2VzXG4gICAgdmFyIHcgPSB3aW5kb3c7XG4gICAgdmFyIGQgPSBkb2N1bWVudDtcblxuICAgIC8vIHJldHVybiBpZiBzY3JvbGwgYmVoYXZpb3IgaXMgc3VwcG9ydGVkIGFuZCBwb2x5ZmlsbCBpcyBub3QgZm9yY2VkXG4gICAgaWYgKFxuICAgICAgJ3Njcm9sbEJlaGF2aW9yJyBpbiBkLmRvY3VtZW50RWxlbWVudC5zdHlsZSAmJlxuICAgICAgdy5fX2ZvcmNlU21vb3RoU2Nyb2xsUG9seWZpbGxfXyAhPT0gdHJ1ZVxuICAgICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIGdsb2JhbHNcbiAgICB2YXIgRWxlbWVudCA9IHcuSFRNTEVsZW1lbnQgfHwgdy5FbGVtZW50O1xuICAgIHZhciBTQ1JPTExfVElNRSA9IDQ2ODtcblxuICAgIC8vIG9iamVjdCBnYXRoZXJpbmcgb3JpZ2luYWwgc2Nyb2xsIG1ldGhvZHNcbiAgICB2YXIgb3JpZ2luYWwgPSB7XG4gICAgICBzY3JvbGw6IHcuc2Nyb2xsIHx8IHcuc2Nyb2xsVG8sXG4gICAgICBzY3JvbGxCeTogdy5zY3JvbGxCeSxcbiAgICAgIGVsZW1lbnRTY3JvbGw6IEVsZW1lbnQucHJvdG90eXBlLnNjcm9sbCB8fCBzY3JvbGxFbGVtZW50LFxuICAgICAgc2Nyb2xsSW50b1ZpZXc6IEVsZW1lbnQucHJvdG90eXBlLnNjcm9sbEludG9WaWV3XG4gICAgfTtcblxuICAgIC8vIGRlZmluZSB0aW1pbmcgbWV0aG9kXG4gICAgdmFyIG5vdyA9XG4gICAgICB3LnBlcmZvcm1hbmNlICYmIHcucGVyZm9ybWFuY2Uubm93XG4gICAgICAgID8gdy5wZXJmb3JtYW5jZS5ub3cuYmluZCh3LnBlcmZvcm1hbmNlKVxuICAgICAgICA6IERhdGUubm93O1xuXG4gICAgLyoqXG4gICAgICogaW5kaWNhdGVzIGlmIGEgdGhlIGN1cnJlbnQgYnJvd3NlciBpcyBtYWRlIGJ5IE1pY3Jvc29mdFxuICAgICAqIEBtZXRob2QgaXNNaWNyb3NvZnRCcm93c2VyXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHVzZXJBZ2VudFxuICAgICAqIEByZXR1cm5zIHtCb29sZWFufVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGlzTWljcm9zb2Z0QnJvd3Nlcih1c2VyQWdlbnQpIHtcbiAgICAgIHZhciB1c2VyQWdlbnRQYXR0ZXJucyA9IFsnTVNJRSAnLCAnVHJpZGVudC8nLCAnRWRnZS8nXTtcblxuICAgICAgcmV0dXJuIG5ldyBSZWdFeHAodXNlckFnZW50UGF0dGVybnMuam9pbignfCcpKS50ZXN0KHVzZXJBZ2VudCk7XG4gICAgfVxuXG4gICAgLypcbiAgICAgKiBJRSBoYXMgcm91bmRpbmcgYnVnIHJvdW5kaW5nIGRvd24gY2xpZW50SGVpZ2h0IGFuZCBjbGllbnRXaWR0aCBhbmRcbiAgICAgKiByb3VuZGluZyB1cCBzY3JvbGxIZWlnaHQgYW5kIHNjcm9sbFdpZHRoIGNhdXNpbmcgZmFsc2UgcG9zaXRpdmVzXG4gICAgICogb24gaGFzU2Nyb2xsYWJsZVNwYWNlXG4gICAgICovXG4gICAgdmFyIFJPVU5ESU5HX1RPTEVSQU5DRSA9IGlzTWljcm9zb2Z0QnJvd3Nlcih3Lm5hdmlnYXRvci51c2VyQWdlbnQpID8gMSA6IDA7XG5cbiAgICAvKipcbiAgICAgKiBjaGFuZ2VzIHNjcm9sbCBwb3NpdGlvbiBpbnNpZGUgYW4gZWxlbWVudFxuICAgICAqIEBtZXRob2Qgc2Nyb2xsRWxlbWVudFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSB4XG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHlcbiAgICAgKiBAcmV0dXJucyB7dW5kZWZpbmVkfVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHNjcm9sbEVsZW1lbnQoeCwgeSkge1xuICAgICAgdGhpcy5zY3JvbGxMZWZ0ID0geDtcbiAgICAgIHRoaXMuc2Nyb2xsVG9wID0geTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiByZXR1cm5zIHJlc3VsdCBvZiBhcHBseWluZyBlYXNlIG1hdGggZnVuY3Rpb24gdG8gYSBudW1iZXJcbiAgICAgKiBAbWV0aG9kIGVhc2VcbiAgICAgKiBAcGFyYW0ge051bWJlcn0ga1xuICAgICAqIEByZXR1cm5zIHtOdW1iZXJ9XG4gICAgICovXG4gICAgZnVuY3Rpb24gZWFzZShrKSB7XG4gICAgICByZXR1cm4gMC41ICogKDEgLSBNYXRoLmNvcyhNYXRoLlBJICogaykpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIGluZGljYXRlcyBpZiBhIHNtb290aCBiZWhhdmlvciBzaG91bGQgYmUgYXBwbGllZFxuICAgICAqIEBtZXRob2Qgc2hvdWxkQmFpbE91dFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfE9iamVjdH0gZmlyc3RBcmdcbiAgICAgKiBAcmV0dXJucyB7Qm9vbGVhbn1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBzaG91bGRCYWlsT3V0KGZpcnN0QXJnKSB7XG4gICAgICBpZiAoXG4gICAgICAgIGZpcnN0QXJnID09PSBudWxsIHx8XG4gICAgICAgIHR5cGVvZiBmaXJzdEFyZyAhPT0gJ29iamVjdCcgfHxcbiAgICAgICAgZmlyc3RBcmcuYmVoYXZpb3IgPT09IHVuZGVmaW5lZCB8fFxuICAgICAgICBmaXJzdEFyZy5iZWhhdmlvciA9PT0gJ2F1dG8nIHx8XG4gICAgICAgIGZpcnN0QXJnLmJlaGF2aW9yID09PSAnaW5zdGFudCdcbiAgICAgICkge1xuICAgICAgICAvLyBmaXJzdCBhcmd1bWVudCBpcyBub3QgYW4gb2JqZWN0L251bGxcbiAgICAgICAgLy8gb3IgYmVoYXZpb3IgaXMgYXV0bywgaW5zdGFudCBvciB1bmRlZmluZWRcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG5cbiAgICAgIGlmICh0eXBlb2YgZmlyc3RBcmcgPT09ICdvYmplY3QnICYmIGZpcnN0QXJnLmJlaGF2aW9yID09PSAnc21vb3RoJykge1xuICAgICAgICAvLyBmaXJzdCBhcmd1bWVudCBpcyBhbiBvYmplY3QgYW5kIGJlaGF2aW9yIGlzIHNtb290aFxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIC8vIHRocm93IGVycm9yIHdoZW4gYmVoYXZpb3IgaXMgbm90IHN1cHBvcnRlZFxuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgICAgJ2JlaGF2aW9yIG1lbWJlciBvZiBTY3JvbGxPcHRpb25zICcgK1xuICAgICAgICAgIGZpcnN0QXJnLmJlaGF2aW9yICtcbiAgICAgICAgICAnIGlzIG5vdCBhIHZhbGlkIHZhbHVlIGZvciBlbnVtZXJhdGlvbiBTY3JvbGxCZWhhdmlvci4nXG4gICAgICApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIGluZGljYXRlcyBpZiBhbiBlbGVtZW50IGhhcyBzY3JvbGxhYmxlIHNwYWNlIGluIHRoZSBwcm92aWRlZCBheGlzXG4gICAgICogQG1ldGhvZCBoYXNTY3JvbGxhYmxlU3BhY2VcbiAgICAgKiBAcGFyYW0ge05vZGV9IGVsXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGF4aXNcbiAgICAgKiBAcmV0dXJucyB7Qm9vbGVhbn1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBoYXNTY3JvbGxhYmxlU3BhY2UoZWwsIGF4aXMpIHtcbiAgICAgIGlmIChheGlzID09PSAnWScpIHtcbiAgICAgICAgcmV0dXJuIGVsLmNsaWVudEhlaWdodCArIFJPVU5ESU5HX1RPTEVSQU5DRSA8IGVsLnNjcm9sbEhlaWdodDtcbiAgICAgIH1cblxuICAgICAgaWYgKGF4aXMgPT09ICdYJykge1xuICAgICAgICByZXR1cm4gZWwuY2xpZW50V2lkdGggKyBST1VORElOR19UT0xFUkFOQ0UgPCBlbC5zY3JvbGxXaWR0aDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBpbmRpY2F0ZXMgaWYgYW4gZWxlbWVudCBoYXMgYSBzY3JvbGxhYmxlIG92ZXJmbG93IHByb3BlcnR5IGluIHRoZSBheGlzXG4gICAgICogQG1ldGhvZCBjYW5PdmVyZmxvd1xuICAgICAqIEBwYXJhbSB7Tm9kZX0gZWxcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gYXhpc1xuICAgICAqIEByZXR1cm5zIHtCb29sZWFufVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGNhbk92ZXJmbG93KGVsLCBheGlzKSB7XG4gICAgICB2YXIgb3ZlcmZsb3dWYWx1ZSA9IHcuZ2V0Q29tcHV0ZWRTdHlsZShlbCwgbnVsbClbJ292ZXJmbG93JyArIGF4aXNdO1xuXG4gICAgICByZXR1cm4gb3ZlcmZsb3dWYWx1ZSA9PT0gJ2F1dG8nIHx8IG92ZXJmbG93VmFsdWUgPT09ICdzY3JvbGwnO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIGluZGljYXRlcyBpZiBhbiBlbGVtZW50IGNhbiBiZSBzY3JvbGxlZCBpbiBlaXRoZXIgYXhpc1xuICAgICAqIEBtZXRob2QgaXNTY3JvbGxhYmxlXG4gICAgICogQHBhcmFtIHtOb2RlfSBlbFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBheGlzXG4gICAgICogQHJldHVybnMge0Jvb2xlYW59XG4gICAgICovXG4gICAgZnVuY3Rpb24gaXNTY3JvbGxhYmxlKGVsKSB7XG4gICAgICB2YXIgaXNTY3JvbGxhYmxlWSA9IGhhc1Njcm9sbGFibGVTcGFjZShlbCwgJ1knKSAmJiBjYW5PdmVyZmxvdyhlbCwgJ1knKTtcbiAgICAgIHZhciBpc1Njcm9sbGFibGVYID0gaGFzU2Nyb2xsYWJsZVNwYWNlKGVsLCAnWCcpICYmIGNhbk92ZXJmbG93KGVsLCAnWCcpO1xuXG4gICAgICByZXR1cm4gaXNTY3JvbGxhYmxlWSB8fCBpc1Njcm9sbGFibGVYO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIGZpbmRzIHNjcm9sbGFibGUgcGFyZW50IG9mIGFuIGVsZW1lbnRcbiAgICAgKiBAbWV0aG9kIGZpbmRTY3JvbGxhYmxlUGFyZW50XG4gICAgICogQHBhcmFtIHtOb2RlfSBlbFxuICAgICAqIEByZXR1cm5zIHtOb2RlfSBlbFxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGZpbmRTY3JvbGxhYmxlUGFyZW50KGVsKSB7XG4gICAgICB2YXIgaXNCb2R5O1xuXG4gICAgICBkbyB7XG4gICAgICAgIGVsID0gZWwucGFyZW50Tm9kZTtcblxuICAgICAgICBpc0JvZHkgPSBlbCA9PT0gZC5ib2R5O1xuICAgICAgfSB3aGlsZSAoaXNCb2R5ID09PSBmYWxzZSAmJiBpc1Njcm9sbGFibGUoZWwpID09PSBmYWxzZSk7XG5cbiAgICAgIGlzQm9keSA9IG51bGw7XG5cbiAgICAgIHJldHVybiBlbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBzZWxmIGludm9rZWQgZnVuY3Rpb24gdGhhdCwgZ2l2ZW4gYSBjb250ZXh0LCBzdGVwcyB0aHJvdWdoIHNjcm9sbGluZ1xuICAgICAqIEBtZXRob2Qgc3RlcFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBjb250ZXh0XG4gICAgICogQHJldHVybnMge3VuZGVmaW5lZH1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBzdGVwKGNvbnRleHQpIHtcbiAgICAgIHZhciB0aW1lID0gbm93KCk7XG4gICAgICB2YXIgdmFsdWU7XG4gICAgICB2YXIgY3VycmVudFg7XG4gICAgICB2YXIgY3VycmVudFk7XG4gICAgICB2YXIgZWxhcHNlZCA9ICh0aW1lIC0gY29udGV4dC5zdGFydFRpbWUpIC8gU0NST0xMX1RJTUU7XG5cbiAgICAgIC8vIGF2b2lkIGVsYXBzZWQgdGltZXMgaGlnaGVyIHRoYW4gb25lXG4gICAgICBlbGFwc2VkID0gZWxhcHNlZCA+IDEgPyAxIDogZWxhcHNlZDtcblxuICAgICAgLy8gYXBwbHkgZWFzaW5nIHRvIGVsYXBzZWQgdGltZVxuICAgICAgdmFsdWUgPSBlYXNlKGVsYXBzZWQpO1xuXG4gICAgICBjdXJyZW50WCA9IGNvbnRleHQuc3RhcnRYICsgKGNvbnRleHQueCAtIGNvbnRleHQuc3RhcnRYKSAqIHZhbHVlO1xuICAgICAgY3VycmVudFkgPSBjb250ZXh0LnN0YXJ0WSArIChjb250ZXh0LnkgLSBjb250ZXh0LnN0YXJ0WSkgKiB2YWx1ZTtcblxuICAgICAgY29udGV4dC5tZXRob2QuY2FsbChjb250ZXh0LnNjcm9sbGFibGUsIGN1cnJlbnRYLCBjdXJyZW50WSk7XG5cbiAgICAgIC8vIHNjcm9sbCBtb3JlIGlmIHdlIGhhdmUgbm90IHJlYWNoZWQgb3VyIGRlc3RpbmF0aW9uXG4gICAgICBpZiAoY3VycmVudFggIT09IGNvbnRleHQueCB8fCBjdXJyZW50WSAhPT0gY29udGV4dC55KSB7XG4gICAgICAgIHcucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHN0ZXAuYmluZCh3LCBjb250ZXh0KSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogc2Nyb2xscyB3aW5kb3cgb3IgZWxlbWVudCB3aXRoIGEgc21vb3RoIGJlaGF2aW9yXG4gICAgICogQG1ldGhvZCBzbW9vdGhTY3JvbGxcbiAgICAgKiBAcGFyYW0ge09iamVjdHxOb2RlfSBlbFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSB4XG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHlcbiAgICAgKiBAcmV0dXJucyB7dW5kZWZpbmVkfVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHNtb290aFNjcm9sbChlbCwgeCwgeSkge1xuICAgICAgdmFyIHNjcm9sbGFibGU7XG4gICAgICB2YXIgc3RhcnRYO1xuICAgICAgdmFyIHN0YXJ0WTtcbiAgICAgIHZhciBtZXRob2Q7XG4gICAgICB2YXIgc3RhcnRUaW1lID0gbm93KCk7XG5cbiAgICAgIC8vIGRlZmluZSBzY3JvbGwgY29udGV4dFxuICAgICAgaWYgKGVsID09PSBkLmJvZHkpIHtcbiAgICAgICAgc2Nyb2xsYWJsZSA9IHc7XG4gICAgICAgIHN0YXJ0WCA9IHcuc2Nyb2xsWCB8fCB3LnBhZ2VYT2Zmc2V0O1xuICAgICAgICBzdGFydFkgPSB3LnNjcm9sbFkgfHwgdy5wYWdlWU9mZnNldDtcbiAgICAgICAgbWV0aG9kID0gb3JpZ2luYWwuc2Nyb2xsO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2Nyb2xsYWJsZSA9IGVsO1xuICAgICAgICBzdGFydFggPSBlbC5zY3JvbGxMZWZ0O1xuICAgICAgICBzdGFydFkgPSBlbC5zY3JvbGxUb3A7XG4gICAgICAgIG1ldGhvZCA9IHNjcm9sbEVsZW1lbnQ7XG4gICAgICB9XG5cbiAgICAgIC8vIHNjcm9sbCBsb29waW5nIG92ZXIgYSBmcmFtZVxuICAgICAgc3RlcCh7XG4gICAgICAgIHNjcm9sbGFibGU6IHNjcm9sbGFibGUsXG4gICAgICAgIG1ldGhvZDogbWV0aG9kLFxuICAgICAgICBzdGFydFRpbWU6IHN0YXJ0VGltZSxcbiAgICAgICAgc3RhcnRYOiBzdGFydFgsXG4gICAgICAgIHN0YXJ0WTogc3RhcnRZLFxuICAgICAgICB4OiB4LFxuICAgICAgICB5OiB5XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBPUklHSU5BTCBNRVRIT0RTIE9WRVJSSURFU1xuICAgIC8vIHcuc2Nyb2xsIGFuZCB3LnNjcm9sbFRvXG4gICAgdy5zY3JvbGwgPSB3LnNjcm9sbFRvID0gZnVuY3Rpb24oKSB7XG4gICAgICAvLyBhdm9pZCBhY3Rpb24gd2hlbiBubyBhcmd1bWVudHMgYXJlIHBhc3NlZFxuICAgICAgaWYgKGFyZ3VtZW50c1swXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gYXZvaWQgc21vb3RoIGJlaGF2aW9yIGlmIG5vdCByZXF1aXJlZFxuICAgICAgaWYgKHNob3VsZEJhaWxPdXQoYXJndW1lbnRzWzBdKSA9PT0gdHJ1ZSkge1xuICAgICAgICBvcmlnaW5hbC5zY3JvbGwuY2FsbChcbiAgICAgICAgICB3LFxuICAgICAgICAgIGFyZ3VtZW50c1swXS5sZWZ0ICE9PSB1bmRlZmluZWRcbiAgICAgICAgICAgID8gYXJndW1lbnRzWzBdLmxlZnRcbiAgICAgICAgICAgIDogdHlwZW9mIGFyZ3VtZW50c1swXSAhPT0gJ29iamVjdCdcbiAgICAgICAgICAgICAgPyBhcmd1bWVudHNbMF1cbiAgICAgICAgICAgICAgOiB3LnNjcm9sbFggfHwgdy5wYWdlWE9mZnNldCxcbiAgICAgICAgICAvLyB1c2UgdG9wIHByb3AsIHNlY29uZCBhcmd1bWVudCBpZiBwcmVzZW50IG9yIGZhbGxiYWNrIHRvIHNjcm9sbFlcbiAgICAgICAgICBhcmd1bWVudHNbMF0udG9wICE9PSB1bmRlZmluZWRcbiAgICAgICAgICAgID8gYXJndW1lbnRzWzBdLnRvcFxuICAgICAgICAgICAgOiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZFxuICAgICAgICAgICAgICA/IGFyZ3VtZW50c1sxXVxuICAgICAgICAgICAgICA6IHcuc2Nyb2xsWSB8fCB3LnBhZ2VZT2Zmc2V0XG4gICAgICAgICk7XG5cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBMRVQgVEhFIFNNT09USE5FU1MgQkVHSU4hXG4gICAgICBzbW9vdGhTY3JvbGwuY2FsbChcbiAgICAgICAgdyxcbiAgICAgICAgZC5ib2R5LFxuICAgICAgICBhcmd1bWVudHNbMF0ubGVmdCAhPT0gdW5kZWZpbmVkXG4gICAgICAgICAgPyB+fmFyZ3VtZW50c1swXS5sZWZ0XG4gICAgICAgICAgOiB3LnNjcm9sbFggfHwgdy5wYWdlWE9mZnNldCxcbiAgICAgICAgYXJndW1lbnRzWzBdLnRvcCAhPT0gdW5kZWZpbmVkXG4gICAgICAgICAgPyB+fmFyZ3VtZW50c1swXS50b3BcbiAgICAgICAgICA6IHcuc2Nyb2xsWSB8fCB3LnBhZ2VZT2Zmc2V0XG4gICAgICApO1xuICAgIH07XG5cbiAgICAvLyB3LnNjcm9sbEJ5XG4gICAgdy5zY3JvbGxCeSA9IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gYXZvaWQgYWN0aW9uIHdoZW4gbm8gYXJndW1lbnRzIGFyZSBwYXNzZWRcbiAgICAgIGlmIChhcmd1bWVudHNbMF0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIGF2b2lkIHNtb290aCBiZWhhdmlvciBpZiBub3QgcmVxdWlyZWRcbiAgICAgIGlmIChzaG91bGRCYWlsT3V0KGFyZ3VtZW50c1swXSkpIHtcbiAgICAgICAgb3JpZ2luYWwuc2Nyb2xsQnkuY2FsbChcbiAgICAgICAgICB3LFxuICAgICAgICAgIGFyZ3VtZW50c1swXS5sZWZ0ICE9PSB1bmRlZmluZWRcbiAgICAgICAgICAgID8gYXJndW1lbnRzWzBdLmxlZnRcbiAgICAgICAgICAgIDogdHlwZW9mIGFyZ3VtZW50c1swXSAhPT0gJ29iamVjdCcgPyBhcmd1bWVudHNbMF0gOiAwLFxuICAgICAgICAgIGFyZ3VtZW50c1swXS50b3AgIT09IHVuZGVmaW5lZFxuICAgICAgICAgICAgPyBhcmd1bWVudHNbMF0udG9wXG4gICAgICAgICAgICA6IGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogMFxuICAgICAgICApO1xuXG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gTEVUIFRIRSBTTU9PVEhORVNTIEJFR0lOIVxuICAgICAgc21vb3RoU2Nyb2xsLmNhbGwoXG4gICAgICAgIHcsXG4gICAgICAgIGQuYm9keSxcbiAgICAgICAgfn5hcmd1bWVudHNbMF0ubGVmdCArICh3LnNjcm9sbFggfHwgdy5wYWdlWE9mZnNldCksXG4gICAgICAgIH5+YXJndW1lbnRzWzBdLnRvcCArICh3LnNjcm9sbFkgfHwgdy5wYWdlWU9mZnNldClcbiAgICAgICk7XG4gICAgfTtcblxuICAgIC8vIEVsZW1lbnQucHJvdG90eXBlLnNjcm9sbCBhbmQgRWxlbWVudC5wcm90b3R5cGUuc2Nyb2xsVG9cbiAgICBFbGVtZW50LnByb3RvdHlwZS5zY3JvbGwgPSBFbGVtZW50LnByb3RvdHlwZS5zY3JvbGxUbyA9IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gYXZvaWQgYWN0aW9uIHdoZW4gbm8gYXJndW1lbnRzIGFyZSBwYXNzZWRcbiAgICAgIGlmIChhcmd1bWVudHNbMF0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIGF2b2lkIHNtb290aCBiZWhhdmlvciBpZiBub3QgcmVxdWlyZWRcbiAgICAgIGlmIChzaG91bGRCYWlsT3V0KGFyZ3VtZW50c1swXSkgPT09IHRydWUpIHtcbiAgICAgICAgLy8gaWYgb25lIG51bWJlciBpcyBwYXNzZWQsIHRocm93IGVycm9yIHRvIG1hdGNoIEZpcmVmb3ggaW1wbGVtZW50YXRpb25cbiAgICAgICAgaWYgKHR5cGVvZiBhcmd1bWVudHNbMF0gPT09ICdudW1iZXInICYmIGFyZ3VtZW50c1sxXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKCdWYWx1ZSBjb3VsZCBub3QgYmUgY29udmVydGVkJyk7XG4gICAgICAgIH1cblxuICAgICAgICBvcmlnaW5hbC5lbGVtZW50U2Nyb2xsLmNhbGwoXG4gICAgICAgICAgdGhpcyxcbiAgICAgICAgICAvLyB1c2UgbGVmdCBwcm9wLCBmaXJzdCBudW1iZXIgYXJndW1lbnQgb3IgZmFsbGJhY2sgdG8gc2Nyb2xsTGVmdFxuICAgICAgICAgIGFyZ3VtZW50c1swXS5sZWZ0ICE9PSB1bmRlZmluZWRcbiAgICAgICAgICAgID8gfn5hcmd1bWVudHNbMF0ubGVmdFxuICAgICAgICAgICAgOiB0eXBlb2YgYXJndW1lbnRzWzBdICE9PSAnb2JqZWN0JyA/IH5+YXJndW1lbnRzWzBdIDogdGhpcy5zY3JvbGxMZWZ0LFxuICAgICAgICAgIC8vIHVzZSB0b3AgcHJvcCwgc2Vjb25kIGFyZ3VtZW50IG9yIGZhbGxiYWNrIHRvIHNjcm9sbFRvcFxuICAgICAgICAgIGFyZ3VtZW50c1swXS50b3AgIT09IHVuZGVmaW5lZFxuICAgICAgICAgICAgPyB+fmFyZ3VtZW50c1swXS50b3BcbiAgICAgICAgICAgIDogYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyB+fmFyZ3VtZW50c1sxXSA6IHRoaXMuc2Nyb2xsVG9wXG4gICAgICAgICk7XG5cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB2YXIgbGVmdCA9IGFyZ3VtZW50c1swXS5sZWZ0O1xuICAgICAgdmFyIHRvcCA9IGFyZ3VtZW50c1swXS50b3A7XG5cbiAgICAgIC8vIExFVCBUSEUgU01PT1RITkVTUyBCRUdJTiFcbiAgICAgIHNtb290aFNjcm9sbC5jYWxsKFxuICAgICAgICB0aGlzLFxuICAgICAgICB0aGlzLFxuICAgICAgICB0eXBlb2YgbGVmdCA9PT0gJ3VuZGVmaW5lZCcgPyB0aGlzLnNjcm9sbExlZnQgOiB+fmxlZnQsXG4gICAgICAgIHR5cGVvZiB0b3AgPT09ICd1bmRlZmluZWQnID8gdGhpcy5zY3JvbGxUb3AgOiB+fnRvcFxuICAgICAgKTtcbiAgICB9O1xuXG4gICAgLy8gRWxlbWVudC5wcm90b3R5cGUuc2Nyb2xsQnlcbiAgICBFbGVtZW50LnByb3RvdHlwZS5zY3JvbGxCeSA9IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gYXZvaWQgYWN0aW9uIHdoZW4gbm8gYXJndW1lbnRzIGFyZSBwYXNzZWRcbiAgICAgIGlmIChhcmd1bWVudHNbMF0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIGF2b2lkIHNtb290aCBiZWhhdmlvciBpZiBub3QgcmVxdWlyZWRcbiAgICAgIGlmIChzaG91bGRCYWlsT3V0KGFyZ3VtZW50c1swXSkgPT09IHRydWUpIHtcbiAgICAgICAgb3JpZ2luYWwuZWxlbWVudFNjcm9sbC5jYWxsKFxuICAgICAgICAgIHRoaXMsXG4gICAgICAgICAgYXJndW1lbnRzWzBdLmxlZnQgIT09IHVuZGVmaW5lZFxuICAgICAgICAgICAgPyB+fmFyZ3VtZW50c1swXS5sZWZ0ICsgdGhpcy5zY3JvbGxMZWZ0XG4gICAgICAgICAgICA6IH5+YXJndW1lbnRzWzBdICsgdGhpcy5zY3JvbGxMZWZ0LFxuICAgICAgICAgIGFyZ3VtZW50c1swXS50b3AgIT09IHVuZGVmaW5lZFxuICAgICAgICAgICAgPyB+fmFyZ3VtZW50c1swXS50b3AgKyB0aGlzLnNjcm9sbFRvcFxuICAgICAgICAgICAgOiB+fmFyZ3VtZW50c1sxXSArIHRoaXMuc2Nyb2xsVG9wXG4gICAgICAgICk7XG5cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnNjcm9sbCh7XG4gICAgICAgIGxlZnQ6IH5+YXJndW1lbnRzWzBdLmxlZnQgKyB0aGlzLnNjcm9sbExlZnQsXG4gICAgICAgIHRvcDogfn5hcmd1bWVudHNbMF0udG9wICsgdGhpcy5zY3JvbGxUb3AsXG4gICAgICAgIGJlaGF2aW9yOiBhcmd1bWVudHNbMF0uYmVoYXZpb3JcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICAvLyBFbGVtZW50LnByb3RvdHlwZS5zY3JvbGxJbnRvVmlld1xuICAgIEVsZW1lbnQucHJvdG90eXBlLnNjcm9sbEludG9WaWV3ID0gZnVuY3Rpb24oKSB7XG4gICAgICAvLyBhdm9pZCBzbW9vdGggYmVoYXZpb3IgaWYgbm90IHJlcXVpcmVkXG4gICAgICBpZiAoc2hvdWxkQmFpbE91dChhcmd1bWVudHNbMF0pID09PSB0cnVlKSB7XG4gICAgICAgIG9yaWdpbmFsLnNjcm9sbEludG9WaWV3LmNhbGwoXG4gICAgICAgICAgdGhpcyxcbiAgICAgICAgICBhcmd1bWVudHNbMF0gPT09IHVuZGVmaW5lZCA/IHRydWUgOiBhcmd1bWVudHNbMF1cbiAgICAgICAgKTtcblxuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIExFVCBUSEUgU01PT1RITkVTUyBCRUdJTiFcbiAgICAgIHZhciBzY3JvbGxhYmxlUGFyZW50ID0gZmluZFNjcm9sbGFibGVQYXJlbnQodGhpcyk7XG4gICAgICB2YXIgcGFyZW50UmVjdHMgPSBzY3JvbGxhYmxlUGFyZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgdmFyIGNsaWVudFJlY3RzID0gdGhpcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblxuICAgICAgaWYgKHNjcm9sbGFibGVQYXJlbnQgIT09IGQuYm9keSkge1xuICAgICAgICAvLyByZXZlYWwgZWxlbWVudCBpbnNpZGUgcGFyZW50XG4gICAgICAgIHNtb290aFNjcm9sbC5jYWxsKFxuICAgICAgICAgIHRoaXMsXG4gICAgICAgICAgc2Nyb2xsYWJsZVBhcmVudCxcbiAgICAgICAgICBzY3JvbGxhYmxlUGFyZW50LnNjcm9sbExlZnQgKyBjbGllbnRSZWN0cy5sZWZ0IC0gcGFyZW50UmVjdHMubGVmdCxcbiAgICAgICAgICBzY3JvbGxhYmxlUGFyZW50LnNjcm9sbFRvcCArIGNsaWVudFJlY3RzLnRvcCAtIHBhcmVudFJlY3RzLnRvcFxuICAgICAgICApO1xuXG4gICAgICAgIC8vIHJldmVhbCBwYXJlbnQgaW4gdmlld3BvcnQgdW5sZXNzIGlzIGZpeGVkXG4gICAgICAgIGlmICh3LmdldENvbXB1dGVkU3R5bGUoc2Nyb2xsYWJsZVBhcmVudCkucG9zaXRpb24gIT09ICdmaXhlZCcpIHtcbiAgICAgICAgICB3LnNjcm9sbEJ5KHtcbiAgICAgICAgICAgIGxlZnQ6IHBhcmVudFJlY3RzLmxlZnQsXG4gICAgICAgICAgICB0b3A6IHBhcmVudFJlY3RzLnRvcCxcbiAgICAgICAgICAgIGJlaGF2aW9yOiAnc21vb3RoJ1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyByZXZlYWwgZWxlbWVudCBpbiB2aWV3cG9ydFxuICAgICAgICB3LnNjcm9sbEJ5KHtcbiAgICAgICAgICBsZWZ0OiBjbGllbnRSZWN0cy5sZWZ0LFxuICAgICAgICAgIHRvcDogY2xpZW50UmVjdHMudG9wLFxuICAgICAgICAgIGJlaGF2aW9yOiAnc21vb3RoJ1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykge1xuICAgIC8vIGNvbW1vbmpzXG4gICAgbW9kdWxlLmV4cG9ydHMgPSB7IHBvbHlmaWxsOiBwb2x5ZmlsbCB9O1xuICB9IGVsc2Uge1xuICAgIC8vIGdsb2JhbFxuICAgIHBvbHlmaWxsKCk7XG4gIH1cblxufSgpKTtcbiIsIm1vZHVsZS5leHBvcnRzPVtcclxuICB7XHJcbiAgICBcIm5hbWVcIjogXCJBZ2VuY2UgRkFSXCIsXHJcbiAgICBcImFkZHJlc3NcIjogXCI0OCBBViBkZXMgZm9yY2VzIGFybWVlIHJveWFsZXNcIixcclxuICAgIFwiY2l0eVwiOiBcImNhc2FibGFuY2FcIixcclxuICAgIFwidHlwZVwiOiBcImFnZW5jZVwiLFxyXG4gICAgXCJjb29yZHNcIjoge1xyXG4gICAgICBcImVtYWlsXCI6IFwiamhvbmRvZUBnbWFpbC5jb21cIixcclxuICAgICAgXCJwaG9uZVwiOiBcIjA2MTg2NjE4NjZcIixcclxuICAgICAgXCJmYXhcIjogXCIwNjE4NjYxODY2XCIsXHJcbiAgICAgIFwiZ3BzXCI6IHtcclxuICAgICAgICBcImxhbmdcIjogMzMuNTUxOTU1NixcclxuICAgICAgICBcImxhdFwiOiAtNy42OTEzNjQ0XHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICBcImV4dGVuc2lvblwiOiB7XHJcbiAgICAgIFwibmFtZVwiOiBcIkFsLWJvdWNocmEgQ2FzYW5lYXJzaG9yZVwiLFxyXG4gICAgICBcImFkZHJlc3NcIjogXCI0OCBBViBkZXMgZm9yY2VzIGFybWVlIHJveWFsZXNcIlxyXG4gICAgfSxcclxuICAgIFwidGltZXRhYmxlXCI6IHtcclxuICAgICAgXCJtb25kYXlcIjogXCIwODowNS0xMjowNSB8IDE0OjAwLTE3OjE1XCIsXHJcbiAgICAgIFwidHVlc2RheVwiOiBcIjA4OjA1LTEyOjA1IHwgMTQ6MDAtMTc6MTVcIixcclxuICAgICAgXCJ3ZWRuZXNkYXlcIjogXCIwODowNS0xMjowNSB8IDE0OjAwLTE3OjE1XCIsXHJcbiAgICAgIFwidGh1cnNkYXlcIjogXCIwODowNS0xMjowNSB8IDE0OjAwLTE3OjE1XCIsXHJcbiAgICAgIFwiZnJpZGF5XCI6IFwiMDg6MDUtMTI6MDUgfCAxNDowMC0xNzoxNVwiLFxyXG4gICAgICBcInNhdHVyZGF5XCI6IFwiMDg6MDUtMTI6MDUgfCAxNDowMC0xNzoxNVwiLFxyXG4gICAgICBcInN1bmRheVwiOiBcIjA4OjA1LTEyOjA1IHwgMTQ6MDAtMTc6MTVcIlxyXG4gICAgfVxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJuYW1lXCI6IFwiQWdlbmNlIFNFSVpFICgxNikgTk9WRU1CUkVcIixcclxuICAgIFwiYWRkcmVzc1wiOiBcIjMgUGxhY2UgZHUgMTYgbm92ZW1icmVcIixcclxuICAgIFwiY2l0eVwiOiBcImNhc2FibGFuY2FcIixcclxuICAgIFwidHlwZVwiOiBcImFnZW5jZVwiLFxyXG4gICAgXCJjb29yZHNcIjoge1xyXG4gICAgICBcImVtYWlsXCI6IFwiamhvbmRvZUBnbWFpbC5jb21cIixcclxuICAgICAgXCJwaG9uZVwiOiBcIjA2MTg2NjE4NjZcIixcclxuICAgICAgXCJmYXhcIjogXCIwNjE4NjYxODY2XCIsXHJcbiAgICAgIFwiZ3BzXCI6IHtcclxuICAgICAgICBcImxhbmdcIjogMzMuNTYxMTExLFxyXG4gICAgICAgIFwibGF0XCI6IC03LjY0ODc5MjRcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIFwiZXh0ZW5zaW9uXCI6IHtcclxuICAgICAgXCJuYW1lXCI6IFwiQWwtYm91Y2hyYSBDYXNhbmVhcnNob3JlXCIsXHJcbiAgICAgIFwiYWRkcmVzc1wiOiBcIjQ4IEFWIGRlcyBmb3JjZXMgYXJtZWUgcm95YWxlc1wiXHJcbiAgICB9LFxyXG4gICAgXCJ0aW1ldGFibGVcIjoge1xyXG4gICAgICBcIm1vbmRheVwiOiBcIjA4OjA1LTEyOjA1IHwgMTQ6MDAtMTc6MTVcIixcclxuICAgICAgXCJ0dWVzZGF5XCI6IFwiMDg6MDUtMTI6MDUgfCAxNDowMC0xNzoxNVwiLFxyXG4gICAgICBcIndlZG5lc2RheVwiOiBcIjA4OjA1LTEyOjA1IHwgMTQ6MDAtMTc6MTVcIixcclxuICAgICAgXCJ0aHVyc2RheVwiOiBcIjA4OjA1LTEyOjA1IHwgMTQ6MDAtMTc6MTVcIixcclxuICAgICAgXCJmcmlkYXlcIjogXCIwODowNS0xMjowNSB8IDE0OjAwLTE3OjE1XCIsXHJcbiAgICAgIFwic2F0dXJkYXlcIjogXCIwODowNS0xMjowNSB8IDE0OjAwLTE3OjE1XCIsXHJcbiAgICAgIFwic3VuZGF5XCI6IFwiMDg6MDUtMTI6MDUgfCAxNDowMC0xNzoxNVwiXHJcbiAgICB9XHJcbiAgfSxcclxuICB7XHJcbiAgICBcIm5hbWVcIjogXCJBZ2VuY2UgRkFSXCIsXHJcbiAgICBcImFkZHJlc3NcIjogXCJBZ2VuY2UgWkVSS1RPVU5JXCIsXHJcbiAgICBcImNpdHlcIjogXCJjYXNhYmxhbmNhXCIsXHJcbiAgICBcInR5cGVcIjogXCJjZW50cmVzLWFmZmFpcmVzXCIsXHJcbiAgICBcImNvb3Jkc1wiOiB7XHJcbiAgICAgIFwiZW1haWxcIjogXCJqaG9uZG9lQGdtYWlsLmNvbVwiLFxyXG4gICAgICBcInBob25lXCI6IFwiMDYxODY2MTg2NlwiLFxyXG4gICAgICBcImZheFwiOiBcIjA2MTg2NjE4NjZcIixcclxuICAgICAgXCJncHNcIjoge1xyXG4gICAgICAgIFwibGFuZ1wiOiAzMy41ODQ1NjcyLFxyXG4gICAgICAgIFwibGF0XCI6IC03LjYyOTkwOTZcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIFwiZXh0ZW5zaW9uXCI6IHtcclxuICAgICAgXCJuYW1lXCI6IFwiQWwtYm91Y2hyYSBDYXNhbmVhcnNob3JlXCIsXHJcbiAgICAgIFwiYWRkcmVzc1wiOiBcIjQ4IEFWIGRlcyBmb3JjZXMgYXJtZWUgcm95YWxlc1wiXHJcbiAgICB9LFxyXG4gICAgXCJ0aW1ldGFibGVcIjoge1xyXG4gICAgICBcIm1vbmRheVwiOiBcIjA4OjA1LTEyOjA1IHwgMTQ6MDAtMTc6MTVcIixcclxuICAgICAgXCJ0dWVzZGF5XCI6IFwiMDg6MDUtMTI6MDUgfCAxNDowMC0xNzoxNVwiLFxyXG4gICAgICBcIndlZG5lc2RheVwiOiBcIjA4OjA1LTEyOjA1IHwgMTQ6MDAtMTc6MTVcIixcclxuICAgICAgXCJ0aHVyc2RheVwiOiBcIjA4OjA1LTEyOjA1IHwgMTQ6MDAtMTc6MTVcIixcclxuICAgICAgXCJmcmlkYXlcIjogXCIwODowNS0xMjowNSB8IDE0OjAwLTE3OjE1XCIsXHJcbiAgICAgIFwic2F0dXJkYXlcIjogXCIwODowNS0xMjowNSB8IDE0OjAwLTE3OjE1XCIsXHJcbiAgICAgIFwic3VuZGF5XCI6IFwiMDg6MDUtMTI6MDUgfCAxNDowMC0xNzoxNVwiXHJcbiAgICB9XHJcbiAgfSxcclxuICB7XHJcbiAgICBcIm5hbWVcIjogXCJBZ2VuY2UgUk9NQU5ESUVcIixcclxuICAgIFwiYWRkcmVzc1wiOiBcIjMgZXQgNCxJbW0gUm9tYW5kaWUgSUkgYm91bHZhcmQgQmlyIGFuemFyYW5lXCIsXHJcbiAgICBcImNpdHlcIjogXCJjYXNhYmxhbmNhXCIsXHJcbiAgICBcInR5cGVcIjogXCJhZ2VuY2VcIixcclxuICAgIFwiY29vcmRzXCI6IHtcclxuICAgICAgXCJlbWFpbFwiOiBcImpob25kb2VAZ21haWwuY29tXCIsXHJcbiAgICAgIFwicGhvbmVcIjogXCIwNjE4NjYxODY2XCIsXHJcbiAgICAgIFwiZmF4XCI6IFwiMDYxODY2MTg2NlwiLFxyXG4gICAgICBcImdwc1wiOiB7XHJcbiAgICAgICAgXCJsYW5nXCI6IDMzLjU3MjI2NzgsXHJcbiAgICAgICAgXCJsYXRcIjogLTcuNjI5MjIzXHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICBcImV4dGVuc2lvblwiOiB7XHJcbiAgICAgIFwibmFtZVwiOiBcIkFsLWJvdWNocmEgQ2FzYW5lYXJzaG9yZVwiLFxyXG4gICAgICBcImFkZHJlc3NcIjogXCI0OCBBViBkZXMgZm9yY2VzIGFybWVlIHJveWFsZXNcIlxyXG4gICAgfSxcclxuICAgIFwidGltZXRhYmxlXCI6IHtcclxuICAgICAgXCJtb25kYXlcIjogXCIwODowNS0xMjowNSB8IDE0OjAwLTE3OjE1XCIsXHJcbiAgICAgIFwidHVlc2RheVwiOiBcIjA4OjA1LTEyOjA1IHwgMTQ6MDAtMTc6MTVcIixcclxuICAgICAgXCJ3ZWRuZXNkYXlcIjogXCIwODowNS0xMjowNSB8IDE0OjAwLTE3OjE1XCIsXHJcbiAgICAgIFwidGh1cnNkYXlcIjogXCIwODowNS0xMjowNSB8IDE0OjAwLTE3OjE1XCIsXHJcbiAgICAgIFwiZnJpZGF5XCI6IFwiMDg6MDUtMTI6MDUgfCAxNDowMC0xNzoxNVwiLFxyXG4gICAgICBcInNhdHVyZGF5XCI6IFwiMDg6MDUtMTI6MDUgfCAxNDowMC0xNzoxNVwiLFxyXG4gICAgICBcInN1bmRheVwiOiBcIjA4OjA1LTEyOjA1IHwgMTQ6MDAtMTc6MTVcIlxyXG4gICAgfVxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJuYW1lXCI6IFwiQWdlbmNlIEhBSiBPTUFSIEFCREVMSkFMSUxcIixcclxuICAgIFwiYWRkcmVzc1wiOiBcIktNIDcsIDMgUm91dGUgZGUgUmFiYXQgQWluIHNiYWFcIixcclxuICAgIFwiY2l0eVwiOiBcImNhc2FibGFuY2FcIixcclxuICAgIFwidHlwZVwiOiBcInJlc2VhdS1ldHJhbmdlclwiLFxyXG4gICAgXCJjb29yZHNcIjoge1xyXG4gICAgICBcImVtYWlsXCI6IFwiamhvbmRvZUBnbWFpbC5jb21cIixcclxuICAgICAgXCJwaG9uZVwiOiBcIjA2MTg2NjE4NjZcIixcclxuICAgICAgXCJmYXhcIjogXCIwNjE4NjYxODY2XCIsXHJcbiAgICAgIFwiZ3BzXCI6IHtcclxuICAgICAgICBcImxhbmdcIjogMzMuNTgxMDMzNixcclxuICAgICAgICBcImxhdFwiOiAtNy41ODE0MDE1XHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICBcImV4dGVuc2lvblwiOiB7XHJcbiAgICAgIFwibmFtZVwiOiBcIkFsLWJvdWNocmEgQ2FzYW5lYXJzaG9yZVwiLFxyXG4gICAgICBcImFkZHJlc3NcIjogXCI0OCBBViBkZXMgZm9yY2VzIGFybWVlIHJveWFsZXNcIlxyXG4gICAgfSxcclxuICAgIFwidGltZXRhYmxlXCI6IHtcclxuICAgICAgXCJtb25kYXlcIjogXCIwODowNS0xMjowNSB8IDE0OjAwLTE3OjE1XCIsXHJcbiAgICAgIFwidHVlc2RheVwiOiBcIjA4OjA1LTEyOjA1IHwgMTQ6MDAtMTc6MTVcIixcclxuICAgICAgXCJ3ZWRuZXNkYXlcIjogXCIwODowNS0xMjowNSB8IDE0OjAwLTE3OjE1XCIsXHJcbiAgICAgIFwidGh1cnNkYXlcIjogXCIwODowNS0xMjowNSB8IDE0OjAwLTE3OjE1XCIsXHJcbiAgICAgIFwiZnJpZGF5XCI6IFwiMDg6MDUtMTI6MDUgfCAxNDowMC0xNzoxNVwiLFxyXG4gICAgICBcInNhdHVyZGF5XCI6IFwiMDg6MDUtMTI6MDUgfCAxNDowMC0xNzoxNVwiLFxyXG4gICAgICBcInN1bmRheVwiOiBcIjA4OjA1LTEyOjA1IHwgMTQ6MDAtMTc6MTVcIlxyXG4gICAgfVxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJuYW1lXCI6IFwiQWdlbmNlIFBPUlRFIETigJlBTkZBXCIsXHJcbiAgICBcImFkZHJlc3NcIjogXCJOwrAgNCBBTkcgQkQgROKAmWFuZmEgZXQgcnVlIG1vdWxheSByYWNoaWQgQlAgMjQ1XCIsXHJcbiAgICBcImNpdHlcIjogXCJjYXNhYmxhbmNhXCIsXHJcbiAgICBcInR5cGVcIjogXCJhZ2VuY2VcIixcclxuICAgIFwiY29vcmRzXCI6IHtcclxuICAgICAgXCJlbWFpbFwiOiBcImpob25kb2VAZ21haWwuY29tXCIsXHJcbiAgICAgIFwicGhvbmVcIjogXCIwNjE4NjYxODY2XCIsXHJcbiAgICAgIFwiZmF4XCI6IFwiMDYxODY2MTg2NlwiLFxyXG4gICAgICBcImdwc1wiOiB7XHJcbiAgICAgICAgXCJsYW5nXCI6IDMzLjU3MzA5LFxyXG4gICAgICAgIFwibGF0XCI6IC03LjYyODY5NzlcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIFwiZXh0ZW5zaW9uXCI6IHtcclxuICAgICAgXCJuYW1lXCI6IFwiQWwtYm91Y2hyYSBDYXNhbmVhcnNob3JlXCIsXHJcbiAgICAgIFwiYWRkcmVzc1wiOiBcIjQ4IEFWIGRlcyBmb3JjZXMgYXJtZWUgcm95YWxlc1wiXHJcbiAgICB9LFxyXG4gICAgXCJ0aW1ldGFibGVcIjoge1xyXG4gICAgICBcIm1vbmRheVwiOiBcIjA4OjA1LTEyOjA1IHwgMTQ6MDAtMTc6MTVcIixcclxuICAgICAgXCJ0dWVzZGF5XCI6IFwiMDg6MDUtMTI6MDUgfCAxNDowMC0xNzoxNVwiLFxyXG4gICAgICBcIndlZG5lc2RheVwiOiBcIjA4OjA1LTEyOjA1IHwgMTQ6MDAtMTc6MTVcIixcclxuICAgICAgXCJ0aHVyc2RheVwiOiBcIjA4OjA1LTEyOjA1IHwgMTQ6MDAtMTc6MTVcIixcclxuICAgICAgXCJmcmlkYXlcIjogXCIwODowNS0xMjowNSB8IDE0OjAwLTE3OjE1XCIsXHJcbiAgICAgIFwic2F0dXJkYXlcIjogXCIwODowNS0xMjowNSB8IDE0OjAwLTE3OjE1XCIsXHJcbiAgICAgIFwic3VuZGF5XCI6IFwiMDg6MDUtMTI6MDUgfCAxNDowMC0xNzoxNVwiXHJcbiAgICB9XHJcbiAgfSxcclxuICB7XHJcbiAgICBcIm5hbWVcIjogXCJBZ2VuY2UgT21hclwiLFxyXG4gICAgXCJhZGRyZXNzXCI6IFwiMyBldCA0LEltbSBSb21hbmRpZSBJSSBib3VsdmFyZCBCaXIgYW56YXJhbmVcIixcclxuICAgIFwiY2l0eVwiOiBcImNhc2FibGFuY2FcIixcclxuICAgIFwidHlwZVwiOiBcImdhYlwiLFxyXG4gICAgXCJjb29yZHNcIjoge1xyXG4gICAgICBcImVtYWlsXCI6IFwiamhvbmRvZUBnbWFpbC5jb21cIixcclxuICAgICAgXCJwaG9uZVwiOiBcIjA2MTg2NjE4NjZcIixcclxuICAgICAgXCJmYXhcIjogXCIwNjE4NjYxODY2XCIsXHJcbiAgICAgIFwiZ3BzXCI6IHtcclxuICAgICAgICBcImxhbmdcIjogMzMuNTYxNzYyMyxcclxuICAgICAgICBcImxhdFwiOiAtNy42MjQ4MTM2XHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICBcImV4dGVuc2lvblwiOiB7XHJcbiAgICAgIFwibmFtZVwiOiBcIkFsLWJvdWNocmEgQ2FzYW5lYXJzaG9yZVwiLFxyXG4gICAgICBcImFkZHJlc3NcIjogXCI0OCBBViBkZXMgZm9yY2VzIGFybWVlIHJveWFsZXNcIlxyXG4gICAgfSxcclxuICAgIFwidGltZXRhYmxlXCI6IHtcclxuICAgICAgXCJtb25kYXlcIjogXCIwODowNS0xMjowNSB8IDE0OjAwLTE3OjE1XCIsXHJcbiAgICAgIFwidHVlc2RheVwiOiBcIjA4OjA1LTEyOjA1IHwgMTQ6MDAtMTc6MTVcIixcclxuICAgICAgXCJ3ZWRuZXNkYXlcIjogXCIwODowNS0xMjowNSB8IDE0OjAwLTE3OjE1XCIsXHJcbiAgICAgIFwidGh1cnNkYXlcIjogXCIwODowNS0xMjowNSB8IDE0OjAwLTE3OjE1XCIsXHJcbiAgICAgIFwiZnJpZGF5XCI6IFwiMDg6MDUtMTI6MDUgfCAxNDowMC0xNzoxNVwiLFxyXG4gICAgICBcInNhdHVyZGF5XCI6IFwiMDg6MDUtMTI6MDUgfCAxNDowMC0xNzoxNVwiLFxyXG4gICAgICBcInN1bmRheVwiOiBcIjA4OjA1LTEyOjA1IHwgMTQ6MDAtMTc6MTVcIlxyXG4gICAgfVxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJuYW1lXCI6IFwiQWdlbmNlIEhBSiBPTUFSIFwiLFxyXG4gICAgXCJhZGRyZXNzXCI6IFwiS00gNywgMyBSb3V0ZSBkZSBSYWJhdCBBaW4gc2JhYVwiLFxyXG4gICAgXCJjaXR5XCI6IFwicmFiYXRcIixcclxuICAgIFwidHlwZVwiOiBcImdhYlwiLFxyXG4gICAgXCJjb29yZHNcIjoge1xyXG4gICAgICBcImVtYWlsXCI6IFwiamhvbmRvZUBnbWFpbC5jb21cIixcclxuICAgICAgXCJwaG9uZVwiOiBcIjA2MTg2NjE4NjZcIixcclxuICAgICAgXCJmYXhcIjogXCIwNjE4NjYxODY2XCIsXHJcbiAgICAgIFwiZ3BzXCI6IHtcclxuICAgICAgICBcImxhbmdcIjogMzMuNTg1NjI5NyxcclxuICAgICAgICBcImxhdFwiOiAtNy42MjE2NTc3XHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICBcImV4dGVuc2lvblwiOiB7XHJcbiAgICAgIFwibmFtZVwiOiBcIkFsLWJvdWNocmEgQ2FzYW5lYXJzaG9yZVwiLFxyXG4gICAgICBcImFkZHJlc3NcIjogXCI0OCBBViBkZXMgZm9yY2VzIGFybWVlIHJveWFsZXNcIlxyXG4gICAgfSxcclxuICAgIFwidGltZXRhYmxlXCI6IHtcclxuICAgICAgXCJtb25kYXlcIjogXCIwODowNS0xMjowNSB8IDE0OjAwLTE3OjE1XCIsXHJcbiAgICAgIFwidHVlc2RheVwiOiBcIjA4OjA1LTEyOjA1IHwgMTQ6MDAtMTc6MTVcIixcclxuICAgICAgXCJ3ZWRuZXNkYXlcIjogXCIwODowNS0xMjowNSB8IDE0OjAwLTE3OjE1XCIsXHJcbiAgICAgIFwidGh1cnNkYXlcIjogXCIwODowNS0xMjowNSB8IDE0OjAwLTE3OjE1XCIsXHJcbiAgICAgIFwiZnJpZGF5XCI6IFwiMDg6MDUtMTI6MDUgfCAxNDowMC0xNzoxNVwiLFxyXG4gICAgICBcInNhdHVyZGF5XCI6IFwiMDg6MDUtMTI6MDUgfCAxNDowMC0xNzoxNVwiLFxyXG4gICAgICBcInN1bmRheVwiOiBcIjA4OjA1LTEyOjA1IHwgMTQ6MDAtMTc6MTVcIlxyXG4gICAgfVxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJuYW1lXCI6IFwiQWdlbmNlIFBPUlRFIFJhYmF0XCIsXHJcbiAgICBcImFkZHJlc3NcIjogXCJOwrAgNCBBTkcgQkQgROKAmWFuZmEgZXQgcnVlIG1vdWxheSByYWNoaWQgQlAgMjQ1XCIsXHJcbiAgICBcImNpdHlcIjogXCJ0YW5nZXJcIixcclxuICAgIFwidHlwZVwiOiBcImNlbnRyZXMtYWZmYWlyZXNcIixcclxuICAgIFwiY29vcmRzXCI6IHtcclxuICAgICAgXCJlbWFpbFwiOiBcImpob25kb2VAZ21haWwuY29tXCIsXHJcbiAgICAgIFwicGhvbmVcIjogXCIwNjE4NjYxODY2XCIsXHJcbiAgICAgIFwiZmF4XCI6IFwiMDYxODY2MTg2NlwiLFxyXG4gICAgICBcImdwc1wiOiB7XHJcbiAgICAgICAgXCJsYW5nXCI6IDMzLjU5NTUzODksXHJcbiAgICAgICAgXCJsYXRcIjogLTcuNjQ1OTM0M1xyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgXCJ0aW1ldGFibGVcIjoge1xyXG4gICAgICBcIm1vbmRheVwiOiBcIjA4OjA1LTEyOjA1IHwgMTQ6MDAtMTc6MTVcIixcclxuICAgICAgXCJ0dWVzZGF5XCI6IFwiMDg6MDUtMTI6MDUgfCAxNDowMC0xNzoxNVwiLFxyXG4gICAgICBcIndlZG5lc2RheVwiOiBcIjA4OjA1LTEyOjA1IHwgMTQ6MDAtMTc6MTVcIixcclxuICAgICAgXCJ0aHVyc2RheVwiOiBcIjA4OjA1LTEyOjA1IHwgMTQ6MDAtMTc6MTVcIixcclxuICAgICAgXCJmcmlkYXlcIjogXCIwODowNS0xMjowNSB8IDE0OjAwLTE3OjE1XCIsXHJcbiAgICAgIFwic2F0dXJkYXlcIjogXCIwODowNS0xMjowNSB8IDE0OjAwLTE3OjE1XCIsXHJcbiAgICAgIFwic3VuZGF5XCI6IFwiMDg6MDUtMTI6MDUgfCAxNDowMC0xNzoxNVwiXHJcbiAgICB9LFxyXG4gICAgXCJleHRlbnNpb25cIjoge1xyXG4gICAgICBcIm5hbWVcIjogXCJBbC1ib3VjaHJhIENhc2FuZWFyc2hvcmVcIixcclxuICAgICAgXCJhZGRyZXNzXCI6IFwiNDggQVYgZGVzIGZvcmNlcyBhcm1lZSByb3lhbGVzXCJcclxuICAgIH1cclxuICB9LFxyXG4gIHtcclxuICAgIFwibmFtZVwiOiBcIkFnZW5jZSBQT1JURSBSYWJhdFwiLFxyXG4gICAgXCJhZGRyZXNzXCI6IFwiTsKwIDQgQU5HIEJEIETigJlhbmZhIGV0IHJ1ZSBtb3VsYXkgcmFjaGlkIEJQIDI0NVwiLFxyXG4gICAgXCJjaXR5XCI6IFwidGFuZ2VyXCIsXHJcbiAgICBcInR5cGVcIjogXCJjZW50cmVzLWFmZmFpcmVzXCIsXHJcbiAgICBcImNvb3Jkc1wiOiB7XHJcbiAgICAgIFwiZW1haWxcIjogXCJqaG9uZG9lQGdtYWlsLmNvbVwiLFxyXG4gICAgICBcInBob25lXCI6IFwiMDYxODY2MTg2NlwiLFxyXG4gICAgICBcImZheFwiOiBcIjA2MTg2NjE4NjZcIixcclxuICAgICAgXCJncHNcIjoge1xyXG4gICAgICAgIFwibGFuZ1wiOiAzMy41OTU1Mzg5LFxyXG4gICAgICAgIFwibGF0XCI6IC03LjY0NTkzNDNcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIFwidGltZXRhYmxlXCI6IHtcclxuICAgICAgXCJtb25kYXlcIjogXCIwODowNS0xMjowNSB8IDE0OjAwLTE3OjE1XCIsXHJcbiAgICAgIFwidHVlc2RheVwiOiBcIjA4OjA1LTEyOjA1IHwgMTQ6MDAtMTc6MTVcIixcclxuICAgICAgXCJ3ZWRuZXNkYXlcIjogXCIwODowNS0xMjowNSB8IDE0OjAwLTE3OjE1XCIsXHJcbiAgICAgIFwidGh1cnNkYXlcIjogXCIwODowNS0xMjowNSB8IDE0OjAwLTE3OjE1XCIsXHJcbiAgICAgIFwiZnJpZGF5XCI6IFwiMDg6MDUtMTI6MDUgfCAxNDowMC0xNzoxNVwiLFxyXG4gICAgICBcInNhdHVyZGF5XCI6IFwiMDg6MDUtMTI6MDUgfCAxNDowMC0xNzoxNVwiLFxyXG4gICAgICBcInN1bmRheVwiOiBcIjA4OjA1LTEyOjA1IHwgMTQ6MDAtMTc6MTVcIlxyXG4gICAgfSxcclxuICAgIFwiZXh0ZW5zaW9uXCI6IHtcclxuICAgICAgXCJuYW1lXCI6IFwiQWwtYm91Y2hyYSBDYXNhbmVhcnNob3JlXCIsXHJcbiAgICAgIFwiYWRkcmVzc1wiOiBcIjQ4IEFWIGRlcyBmb3JjZXMgYXJtZWUgcm95YWxlc1wiXHJcbiAgICB9XHJcbiAgfSxcclxuICB7XHJcbiAgICBcIm5hbWVcIjogXCJBZ2VuY2UgUE9SVEUgUmFiYXRcIixcclxuICAgIFwiYWRkcmVzc1wiOiBcIk7CsCA0IEFORyBCRCBE4oCZYW5mYSBldCBydWUgbW91bGF5IHJhY2hpZCBCUCAyNDVcIixcclxuICAgIFwiY2l0eVwiOiBcInRhbmdlclwiLFxyXG4gICAgXCJ0eXBlXCI6IFwiY2VudHJlcy1hZmZhaXJlc1wiLFxyXG4gICAgXCJjb29yZHNcIjoge1xyXG4gICAgICBcImVtYWlsXCI6IFwiamhvbmRvZUBnbWFpbC5jb21cIixcclxuICAgICAgXCJwaG9uZVwiOiBcIjA2MTg2NjE4NjZcIixcclxuICAgICAgXCJmYXhcIjogXCIwNjE4NjYxODY2XCIsXHJcbiAgICAgIFwiZ3BzXCI6IHtcclxuICAgICAgICBcImxhbmdcIjogMzMuOTY4Mjk3MSxcclxuICAgICAgICBcImxhdFwiOiAtNi44NjUxMTcyXHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICBcInRpbWV0YWJsZVwiOiB7XHJcbiAgICAgIFwibW9uZGF5XCI6IFwiMDg6MDUtMTI6MDUgfCAxNDowMC0xNzoxNVwiLFxyXG4gICAgICBcInR1ZXNkYXlcIjogXCIwODowNS0xMjowNSB8IDE0OjAwLTE3OjE1XCIsXHJcbiAgICAgIFwid2VkbmVzZGF5XCI6IFwiMDg6MDUtMTI6MDUgfCAxNDowMC0xNzoxNVwiLFxyXG4gICAgICBcInRodXJzZGF5XCI6IFwiMDg6MDUtMTI6MDUgfCAxNDowMC0xNzoxNVwiLFxyXG4gICAgICBcImZyaWRheVwiOiBcIjA4OjA1LTEyOjA1IHwgMTQ6MDAtMTc6MTVcIixcclxuICAgICAgXCJzYXR1cmRheVwiOiBcIjA4OjA1LTEyOjA1IHwgMTQ6MDAtMTc6MTVcIixcclxuICAgICAgXCJzdW5kYXlcIjogXCIwODowNS0xMjowNSB8IDE0OjAwLTE3OjE1XCJcclxuICAgIH0sXHJcbiAgICBcImV4dGVuc2lvblwiOiB7XHJcbiAgICAgIFwibmFtZVwiOiBcIkFsLWJvdWNocmEgQ2FzYW5lYXJzaG9yZVwiLFxyXG4gICAgICBcImFkZHJlc3NcIjogXCI0OCBBViBkZXMgZm9yY2VzIGFybWVlIHJveWFsZXNcIlxyXG4gICAgfVxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJuYW1lXCI6IFwiQWdlbmNlIFJpeWFkIFwiLFxyXG4gICAgXCJhZGRyZXNzXCI6IFwiTsKwIDQgQU5HIEJEIETigJlhbmZhIGV0IHJ1ZSBtb3VsYXkgcmFjaGlkIEJQIDI0NVwiLFxyXG4gICAgXCJjaXR5XCI6IFwidGFuZ2VyXCIsXHJcbiAgICBcInR5cGVcIjogXCJjZW50cmVzLWFmZmFpcmVzXCIsXHJcbiAgICBcImNvb3Jkc1wiOiB7XHJcbiAgICAgIFwiZW1haWxcIjogXCJqaG9uZG9lQGdtYWlsLmNvbVwiLFxyXG4gICAgICBcInBob25lXCI6IFwiMDYxODY2MTg2NlwiLFxyXG4gICAgICBcImZheFwiOiBcIjA2MTg2NjE4NjZcIixcclxuICAgICAgXCJncHNcIjoge1xyXG4gICAgICAgIFwibGFuZ1wiOiAzMy45NjEzMTU4LFxyXG4gICAgICAgIFwibGF0XCI6IC02Ljg3NjMxNzlcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIFwidGltZXRhYmxlXCI6IHtcclxuICAgICAgXCJtb25kYXlcIjogXCIwODowNS0xMjowNSB8IDE0OjAwLTE3OjE1XCIsXHJcbiAgICAgIFwidHVlc2RheVwiOiBcIjA4OjA1LTEyOjA1IHwgMTQ6MDAtMTc6MTVcIixcclxuICAgICAgXCJ3ZWRuZXNkYXlcIjogXCIwODowNS0xMjowNSB8IDE0OjAwLTE3OjE1XCIsXHJcbiAgICAgIFwidGh1cnNkYXlcIjogXCIwODowNS0xMjowNSB8IDE0OjAwLTE3OjE1XCIsXHJcbiAgICAgIFwiZnJpZGF5XCI6IFwiMDg6MDUtMTI6MDUgfCAxNDowMC0xNzoxNVwiLFxyXG4gICAgICBcInNhdHVyZGF5XCI6IFwiMDg6MDUtMTI6MDUgfCAxNDowMC0xNzoxNVwiLFxyXG4gICAgICBcInN1bmRheVwiOiBcIjA4OjA1LTEyOjA1IHwgMTQ6MDAtMTc6MTVcIlxyXG4gICAgfSxcclxuICAgIFwiZXh0ZW5zaW9uXCI6IHtcclxuICAgICAgXCJuYW1lXCI6IFwiQWwtYm91Y2hyYSBDYXNhbmVhcnNob3JlXCIsXHJcbiAgICAgIFwiYWRkcmVzc1wiOiBcIjQ4IEFWIGRlcyBmb3JjZXMgYXJtZWUgcm95YWxlc1wiXHJcbiAgICB9XHJcbiAgfSxcclxuICB7XHJcbiAgICBcIm5hbWVcIjogXCJBZ2VuY2UgSGF5IFJhYmF0XCIsXHJcbiAgICBcImFkZHJlc3NcIjogXCJOwrAgNCBBTkcgQkQgROKAmWFuZmEgZXQgcnVlIG1vdWxheSByYWNoaWQgQlAgMjQ1XCIsXHJcbiAgICBcImNpdHlcIjogXCJ0YW5nZXJcIixcclxuICAgIFwidHlwZVwiOiBcImNlbnRyZXMtYWZmYWlyZXNcIixcclxuICAgIFwiY29vcmRzXCI6IHtcclxuICAgICAgXCJlbWFpbFwiOiBcImpob25kb2VAZ21haWwuY29tXCIsXHJcbiAgICAgIFwicGhvbmVcIjogXCIwNjE4NjYxODY2XCIsXHJcbiAgICAgIFwiZmF4XCI6IFwiMDYxODY2MTg2NlwiLFxyXG4gICAgICBcImdwc1wiOiB7XHJcbiAgICAgICAgXCJsYW5nXCI6IDMzLjk1OTk5MzMsXHJcbiAgICAgICAgXCJsYXRcIjogLTYuODg1NDk4OFxyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgXCJ0aW1ldGFibGVcIjoge1xyXG4gICAgICBcIm1vbmRheVwiOiBcIjA4OjA1LTEyOjA1IHwgMTQ6MDAtMTc6MTVcIixcclxuICAgICAgXCJ0dWVzZGF5XCI6IFwiMDg6MDUtMTI6MDUgfCAxNDowMC0xNzoxNVwiLFxyXG4gICAgICBcIndlZG5lc2RheVwiOiBcIjA4OjA1LTEyOjA1IHwgMTQ6MDAtMTc6MTVcIixcclxuICAgICAgXCJ0aHVyc2RheVwiOiBcIjA4OjA1LTEyOjA1IHwgMTQ6MDAtMTc6MTVcIixcclxuICAgICAgXCJmcmlkYXlcIjogXCIwODowNS0xMjowNSB8IDE0OjAwLTE3OjE1XCIsXHJcbiAgICAgIFwic2F0dXJkYXlcIjogXCIwODowNS0xMjowNSB8IDE0OjAwLTE3OjE1XCIsXHJcbiAgICAgIFwic3VuZGF5XCI6IFwiMDg6MDUtMTI6MDUgfCAxNDowMC0xNzoxNVwiXHJcbiAgICB9LFxyXG4gICAgXCJleHRlbnNpb25cIjoge1xyXG4gICAgICBcIm5hbWVcIjogXCJBbC1ib3VjaHJhIENhc2FuZWFyc2hvcmVcIixcclxuICAgICAgXCJhZGRyZXNzXCI6IFwiNDggQVYgZGVzIGZvcmNlcyBhcm1lZSByb3lhbGVzXCJcclxuICAgIH1cclxuICB9XHJcbl1cclxuIiwiaW1wb3J0IHNlbGVjdCBmcm9tICcuLi8uLi9jb21wb25lbnRzL3NlbGVjdC1maWx0ZXIvaW5kZXguanMnXHJcbmltcG9ydCB0b3BIZWFkZXIgZnJvbSAnLi4vLi4vY29tcG9uZW50cy90b3AtaGVhZGVyL2luZGV4LmpzJ1xyXG5pbXBvcnQgaGVhZGVyIGZyb20gJy4uLy4uL2NvbXBvbmVudHMvaGVhZGVyL2luZGV4LmpzJ1xyXG5pbXBvcnQgZm9vdGVyIGZyb20gJy4uLy4uL2NvbXBvbmVudHMvZm9vdGVyL2luZGV4LmpzJ1xyXG5pbXBvcnQgY2FyZFNsaWRlciBmcm9tICcuLi8uLi9jb21wb25lbnRzL2NhcmQvY2FyZC1zbGlkZXIuanMnXHJcbmltcG9ydCBkYXRlU2xpZGVyIGZyb20gJy4uLy4uL2NvbXBvbmVudHMvZGF0ZS1zbGlkZXIvZGF0ZS1zbGlkZXIuanMnXHJcbmltcG9ydCBsb2dvU2xpZGVyIGZyb20gJy4uLy4uL2NvbXBvbmVudHMvbG9nby1zbGlkZXIvaW5kZXguanMnXHJcbmltcG9ydCBmaW5hbmNlIGZyb20gJy4uLy4uL2NvbXBvbmVudHMvZmluYW5jZS9pbmRleC5qcydcclxuaW1wb3J0IGZpbmFuY2VGaWx0ZXIgZnJvbSAnLi4vLi4vY29tcG9uZW50cy9maW5hbmNlL2ZpbHRlci5qcydcclxuaW1wb3J0IGJhbnF1ZXNTbGlkZXIgZnJvbSAnLi4vLi4vY29tcG9uZW50cy9ub3MtYmFucXVlcy9pbmRleC5qcydcclxuaW1wb3J0IGhvbWVTbGlkZXIgZnJvbSAnLi4vLi4vY29tcG9uZW50cy9ob21lLXNsaWRlci9pbmRleC5qcydcclxuaW1wb3J0IGJlc29pbkFpZGUgZnJvbSAnLi4vLi4vY29tcG9uZW50cy9iZXNvaW4tYWlkZS9pbmRleC5qcydcclxuaW1wb3J0IHN3aXBlYm94IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvc3dpcGVib3gvaW5kZXguanMnXHJcbmltcG9ydCBhcnRpY2xlU2xpZGVyIGZyb20gJy4uLy4uL2NvbXBvbmVudHMvYXJ0aWNsZS1zbGlkZXIvaW5kZXguanMnXHJcbmltcG9ydCBjYXJkUmFwcG9ydCBmcm9tICcuLi8uLi9jb21wb25lbnRzL2NhcmQvY2FyZC1yYXBwb3J0L2NhcmQtcmFwcG9ydC5qcydcclxuaW1wb3J0IHBvcHVwU2VhcmNoIGZyb20gJy4uLy4uL2NvbXBvbmVudHMvcG9wdXAtc2VhcmNoL2luZGV4LmpzJ1xyXG5pbXBvcnQgcG9wdXBTZWFyY2hGaWx0ZXIgZnJvbSAnLi4vLi4vY29tcG9uZW50cy9wb3B1cC1zZWFyY2gvZmlsdGVyLmpzJ1xyXG5pbXBvcnQgcG9wdXBWaWRlbyBmcm9tICcuLi8uLi9jb21wb25lbnRzL3BvcHVwLXZpZGVvL2luZGV4LmpzJ1xyXG5pbXBvcnQgYWN0dWFsaXRlU2xpZGVyIGZyb20gJy4uLy4uL2NvbXBvbmVudHMvYWN0dWFsaXRlLXNsaWRlci9pbmRleC5qcydcclxuaW1wb3J0IHB1YlNsaWRlciBmcm9tICcuLi8uLi9jb21wb25lbnRzL3B1Yi1zbGlkZXIvaW5kZXguanMnXHJcbmltcG9ydCBmb3JtVmFsaWRhdGlvbiBmcm9tICcuLi8uLi9jb21wb25lbnRzL2Zvcm0vZm9ybS12YWxpZGF0aW9uLmpzJ1xyXG5pbXBvcnQgZm9ybVVwbG9hZCBmcm9tICcuLi8uLi9jb21wb25lbnRzL2Zvcm0vZm9ybS11cGxvYWQuanMnXHJcbmltcG9ydCBjYXJkQWN0dVNsaWRlciBmcm9tICcuLi8uLi9jb21wb25lbnRzL2NhcmQvY2FyZC1hY3R1YWxpdGVzLmpzJ1xyXG5pbXBvcnQgY2FyZEhpc3RvaXJlU2xpZGVyIGZyb20gJy4uLy4uL2NvbXBvbmVudHMvY2FyZC9jYXJkLWhpc3RvaXJlLmpzJ1xyXG5pbXBvcnQgYXBwZWxPZmZlcmVzIGZyb20gJy4uLy4uL2NvbXBvbmVudHMvYXBwZWwtb2ZmcmVzL2luZGV4LmpzJ1xyXG5pbXBvcnQgbWFwIGZyb20gJy4uLy4uL2NvbXBvbmVudHMvbWFwL2luZGV4LmpzJ1xyXG5pbXBvcnQgdGltZWxpbmUgZnJvbSAnLi4vLi4vY29tcG9uZW50cy90aW1lbGluZS9pbmRleC5qcydcclxuaW1wb3J0IHtcclxuICBtYXBDb250cm9sLFxyXG4gIHRvZ2dsZUNvbnRyb2xcclxufSBmcm9tICcuLi8uLi9jb21wb25lbnRzL21hcC1jb250cm9sL2luZGV4LmpzJ1xyXG5pbXBvcnQgc21vb3Roc2Nyb2xsIGZyb20gJ3Ntb290aHNjcm9sbC1wb2x5ZmlsbCdcclxuaW1wb3J0IGFjdHVhbGl0ZUZpbHRlciBmcm9tICcuLi8uLi9jb21wb25lbnRzL2FjdHVhbGl0ZXMvaW5kZXguanMnXHJcbmltcG9ydCBtZWRpYWNlbnRlckZpbHRlciBmcm9tICcuLi8uLi9jb21wb25lbnRzL21lZGlhY2VudGVyL2luZGV4LmpzJ1xyXG5pbXBvcnQgY29tbXVuaXF1ZXNGaWx0ZXIgZnJvbSAnLi4vLi4vY29tcG9uZW50cy9jb21tdW5pcXVlcy9pbmRleC5qcydcclxuaW1wb3J0IHJlc3VsdEZpbHRlciBmcm9tICcuLi8uLi9jb21wb25lbnRzL3Jlc3VsdC9pbmRleC5qcydcclxuaW1wb3J0IG1lZGlhR2FsbGVyeSBmcm9tICcuLi8uLi9jb21wb25lbnRzL21lZGlhLWdhbGxlcnkvaW5kZXguanMnXHJcblxyXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbiAoKSB7XHJcbiAgc21vb3Roc2Nyb2xsLnBvbHlmaWxsKClcclxuXHJcbiAgaWYgKHR5cGVvZiBOb2RlTGlzdC5wcm90b3R5cGUuZm9yRWFjaCAhPT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgTm9kZUxpc3QucHJvdG90eXBlLmZvckVhY2ggPSBBcnJheS5wcm90b3R5cGUuZm9yRWFjaFxyXG4gIH1cclxuXHJcbiAgaWYgKCFTdHJpbmcucHJvdG90eXBlLmluY2x1ZGVzKSB7XHJcbiAgICBBcnJheS5wcm90b3R5cGUuaW5jbHVkZXMgPSBmdW5jdGlvbiAoc2VhcmNoLCBzdGFydCkge1xyXG4gICAgICBpZiAodHlwZW9mIHN0YXJ0ICE9PSAnbnVtYmVyJykge1xyXG4gICAgICAgIHN0YXJ0ID0gMFxyXG4gICAgICB9XHJcbiAgICAgIGlmIChzdGFydCArIHNlYXJjaC5sZW5ndGggPiB0aGlzLmxlbmd0aCkge1xyXG4gICAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmluZGV4T2Yoc2VhcmNoLCBzdGFydCkgIT09IC0xXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIHNlbGVjdCgpXHJcbiAgdG9wSGVhZGVyKClcclxuICBoZWFkZXIoKVxyXG4gIGZvb3RlcigpXHJcbiAgY2FyZFNsaWRlcigpXHJcbiAgZmluYW5jZUZpbHRlcigpXHJcbiAgZGF0ZVNsaWRlcigpXHJcbiAgbG9nb1NsaWRlcigpXHJcbiAgZmluYW5jZSgpXHJcbiAgYmFucXVlc1NsaWRlcigpXHJcbiAgaG9tZVNsaWRlcigpXHJcbiAgYmVzb2luQWlkZSgpXHJcbiAgc3dpcGVib3goKVxyXG4gIGFydGljbGVTbGlkZXIoKVxyXG4gIGNhcmRSYXBwb3J0KClcclxuICBwb3B1cFNlYXJjaCgpXHJcbiAgcG9wdXBWaWRlbygpXHJcbiAgYWN0dWFsaXRlU2xpZGVyKClcclxuICBwdWJTbGlkZXIoKVxyXG4gIGZvcm1WYWxpZGF0aW9uKClcclxuICBmb3JtVXBsb2FkKClcclxuICBjYXJkQWN0dVNsaWRlcigpXHJcbiAgY2FyZEhpc3RvaXJlU2xpZGVyKClcclxuICBtYXAoKVxyXG4gIG1hcENvbnRyb2woKVxyXG4gIHRvZ2dsZUNvbnRyb2woKVxyXG4gIHRpbWVsaW5lKClcclxuICBhY3R1YWxpdGVGaWx0ZXIoKVxyXG4gIGFwcGVsT2ZmZXJlcygpXHJcbiAgbWVkaWFjZW50ZXJGaWx0ZXIoKVxyXG4gIGNvbW11bmlxdWVzRmlsdGVyKClcclxuICBwb3B1cFNlYXJjaEZpbHRlcigpXHJcbiAgcmVzdWx0RmlsdGVyKClcclxuICBtZWRpYUdhbGxlcnkoKVxyXG59KVxyXG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiAoKSB7XHJcbiAgaWYgKCQoJy5hY3R1YWxpdGUtc2xpZGVyJykubGVuZ3RoKSB7XHJcblxyXG4gICAgdmFyIHJ0bCA9ICQoJ2h0bWwnKS5hdHRyKCdkaXInKSA9PSAncnRsJztcclxuXHJcbiAgICBpZiAoJCh3aW5kb3cpLndpZHRoKCkgPiA5OTEpIHtcclxuICAgICAgYXJ0aWNsZVNsaWRlcigwLCBydGwpXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBhcnRpY2xlU2xpZGVyKDAsIHJ0bClcclxuICAgIH1cclxuXHJcbiAgICAkKHdpbmRvdykub24oJ3Jlc2l6ZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgaWYgKCQod2luZG93KS53aWR0aCgpID4gOTkxKSB7XHJcbiAgICAgICAgYXJ0aWNsZVNsaWRlcigwLCBydGwpXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgYXJ0aWNsZVNsaWRlcigwLCBydGwpXHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBhcnRpY2xlU2xpZGVyIChzdGFnZVBhZGRpbmcsIHJ0bCkge1xyXG4gICAgJCgnLmFjdHVhbGl0ZS1zbGlkZXIub3dsLWNhcm91c2VsJykub3dsQ2Fyb3VzZWwoe1xyXG4gICAgICBzdGFnZVBhZGRpbmc6IHN0YWdlUGFkZGluZyxcclxuICAgICAgbWFyZ2luOiAxOCxcclxuICAgICAgZG90czogdHJ1ZSxcclxuICAgICAgbmF2OiB0cnVlLFxyXG4gICAgICBtZXJnZTogdHJ1ZSxcclxuICAgICAgbG9vcDogdHJ1ZSxcclxuICAgICAgcnRsOiBydGwsXHJcbiAgICAgIHJlc3BvbnNpdmU6IHtcclxuICAgICAgICAwOiB7XHJcbiAgICAgICAgICBpdGVtczogMVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgOTkyOiB7XHJcbiAgICAgICAgICBpdGVtczogM1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSlcclxuICB9XHJcbn1cclxuIiwiaW1wb3J0IERhdGVGaWx0ZXIgZnJvbSAnLi4vLi4vY29tcG9uZW50cy9kYXRlLWZpbHRlci9pbmRleC5qcydcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uICgpIHtcclxuICBsZXQgdGFnRmlsdGVycyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJyNhY3R1YWxpdGUtZmlsdGVycyBhJylcclxuICBsZXQgYWN0dWFsaXRlSG9sZGVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2FjdHVhbGl0ZS1ob2xkZXInKVxyXG4gIGxldCBzdGFydERhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc3RhcnQnKVxyXG4gIGxldCBlbmREYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmVuZCcpXHJcbiAgbGV0IGFsbEZpbHRlckJ0biA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNhY3R1YWxpdGUtZmlsdGVyLWFsbCcpXHJcblxyXG4gIGlmICh0YWdGaWx0ZXJzLmxlbmd0aCA8PSAwIHx8ICFhY3R1YWxpdGVIb2xkZXIpIHJldHVyblxyXG5cclxuICBsZXQgc3RhdGUgPSB7XHJcbiAgICBmaWx0ZXJzOiBbXSxcclxuICAgIGRhdGVGaWx0ZXI6IHtcclxuICAgICAgZnJvbTogJycsXHJcbiAgICAgIHRvOiAnJ1xyXG4gICAgfSxcclxuICAgIG9yZGVyOiAnZGVzYycsXHJcbiAgICBtYXg6IDMsXHJcbiAgICBkYXRhOiBbXHJcbiAgICAgIHtcclxuICAgICAgICB0eXBlOiAnYXJ0aWNsZS1pbWcnLFxyXG4gICAgICAgIHRhZ3M6IFsnUlNFJywgJ0ZJTkFOQ0UnLCAnRU5UUkVQUkVOQVJJQVQnXSxcclxuICAgICAgICBkYXRlOiAnMjEvMDcvMjAxNycsXHJcbiAgICAgICAgdGl0bGU6ICd1bmUgYW1iaWFuY2UgZmVzdGl2ZSBldCBmYW1pbGlhbGUgcXVlIHPigJllc3QgZMOpcm91bMOpJyxcclxuICAgICAgICBjb250ZW50OiAnTGUgR3JvdXBlIEJDUCwgYWN0ZXVyIHBhbmFmcmljYWluIGRlIHLDqWbDqXJlbmNlLCBldCBsYSBTb2Npw6l0w6kgRmluYVRuY2nDqHJlIEludGVybmF0aW9uYWxlIChJRkMpLi4uJyxcclxuICAgICAgICBpbWFnZTogJ2Fzc2V0cy9pbWcvYWN0dS0yLnBuZydcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHR5cGU6ICdhbm5vbmNlJyxcclxuICAgICAgICB0YWdzOiBbJ1JTRSddLFxyXG4gICAgICAgIGRhdGU6ICcyOS8wNy8yMDE3JyxcclxuICAgICAgICBjb250ZW50OiBgQSBs4oCZb2NjYXNpb24gZGUgbGEgSm91cm7DqWUgSW50ZXJuYXRpb25hbGUgZGUgbGEgRmVtbWUsIGxhIDxhIGhyZWY9XCJodHRwczovL3R3aXR0ZXIuY29tL2hhc2h0YWcvQmFucXVlX1BvcHVsYWlyZVwiIHRhcmdldD1cIl9ibGFua1wiPiNCYW5xdWVfUG9wdWxhaXJlPC9hPiBwcsOpc2VudGUgw6AgdG91dGVzIGxlcyBmZW1tZXMgc2VzIHbFk3V4IGxlcyBwbHVzIHNpbmPDqHJlcyBkZSByw6l1c3NpdGUgZXQgZGUgcHJvc3DDqXJpdMOpLiA8YSBocmVmPVwiaHR0cHM6Ly90d2l0dGVyLmNvbS9oYXNodGFnLzhtYXJzXCIgIHRhcmdldD1cIl9ibGFua1wiPiM4bWFyczwvYT4gPGEgaHJlZj1cImh0dHBzOi8vdHdpdHRlci5jb20vaGFzaHRhZy9jb3Jwb1wiICB0YXJnZXQ9XCJfYmxhbmtcIj4jY29ycG88L2E+XHJcbiAgICAgICAgYFxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgdHlwZTogJ2FydGljbGUnLFxyXG4gICAgICAgIHRhZ3M6IFsnUlNFJywgJ0VOVFJFUFJFTkFSSUFUJ10sXHJcbiAgICAgICAgZGF0ZTogJzIyLzA3LzIwMTcnLFxyXG4gICAgICAgIHRpdGxlOiAndW5lIGFtYmlhbmNlIGZlc3RpdmUgZXQgZmFtaWxpYWxlIHF1ZSBz4oCZZXN0IGTDqXJvdWzDqScsXHJcbiAgICAgICAgY29udGVudDogJ0xlIEdyb3VwZSBCQ1AsIGFjdGV1ciBwYW5hZnJpY2FpbiBkZSByw6lmw6lyZW5jZSwgZXQgbGEgU29jacOpdMOpIEZpbmFUbmNpw6hyZSBJbnRlcm5hdGlvbmFsZSAoSUZDKS4uLidcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHR5cGU6ICdhcnRpY2xlJyxcclxuICAgICAgICB0YWdzOiBbJ1JTRScsICdERVZFTE9QUEVNRU5UIERVUkFCTEUnXSxcclxuICAgICAgICBkYXRlOiAnMjMvMDcvMjAxNycsXHJcbiAgICAgICAgdGl0bGU6ICd1bmUgYW1iaWFuY2UgZmVzdGl2ZSBldCBmYW1pbGlhbGUgcXVlIHPigJllc3QgZMOpcm91bMOpJyxcclxuICAgICAgICBjb250ZW50OiAnTGUgR3JvdXBlIEJDUCwgYWN0ZXVyIHBhbmFmcmljYWluIGRlIHLDqWbDqXJlbmNlLCBldCBsYSBTb2Npw6l0w6kgRmluYVRuY2nDqHJlIEludGVybmF0aW9uYWxlIChJRkMpLi4uJ1xyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgdHlwZTogJ2FydGljbGUnLFxyXG4gICAgICAgIHRhZ3M6IFsnUlNFJ10sXHJcbiAgICAgICAgZGF0ZTogJzIxLzA3LzIwMTcnLFxyXG4gICAgICAgIHRpdGxlOiAndW5lIGFtYmlhbmNlIGZlc3RpdmUgZXQgZmFtaWxpYWxlIHF1ZSBz4oCZZXN0IGTDqXJvdWzDqScsXHJcbiAgICAgICAgY29udGVudDogJ0xlIEdyb3VwZSBCQ1AsIGFjdGV1ciBwYW5hZnJpY2FpbiBkZSByw6lmw6lyZW5jZSwgZXQgbGEgU29jacOpdMOpIEZpbmFUbmNpw6hyZSBJbnRlcm5hdGlvbmFsZSAoSUZDKS4uLidcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHR5cGU6ICdhcnRpY2xlJyxcclxuICAgICAgICB0YWdzOiBbJ1JTRScsICdGSU5BTkNFJ10sXHJcbiAgICAgICAgZGF0ZTogJzI0LzA3LzIwMTcnLFxyXG4gICAgICAgIHRpdGxlOiAndW5lIGFtYmlhbmNlIGZlc3RpdmUgZXQgZmFtaWxpYWxlIHF1ZSBz4oCZZXN0IGTDqXJvdWzDqScsXHJcbiAgICAgICAgY29udGVudDogJ0xlIEdyb3VwZSBCQ1AsIGFjdGV1ciBwYW5hZnJpY2FpbiBkZSByw6lmw6lyZW5jZSwgZXQgbGEgU29jacOpdMOpIEZpbmFUbmNpw6hyZSBJbnRlcm5hdGlvbmFsZSAoSUZDKS4uLidcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHR5cGU6ICdhcnRpY2xlLWltZycsXHJcbiAgICAgICAgdGFnczogWydSU0UnLCAnRklOQU5DRSddLFxyXG4gICAgICAgIGRhdGU6ICcyNS8wNy8yMDE3JyxcclxuICAgICAgICB0aXRsZTogJ3VuZSBhbWJpYW5jZSBmZXN0aXZlIGV0IGZhbWlsaWFsZSBxdWUgc+KAmWVzdCBkw6lyb3Vsw6knLFxyXG4gICAgICAgIGNvbnRlbnQ6ICdMZSBHcm91cGUgQkNQLCBhY3RldXIgcGFuYWZyaWNhaW4gZGUgcsOpZsOpcmVuY2UsIGV0IGxhIFNvY2nDqXTDqSBGaW5hVG5jacOocmUgSW50ZXJuYXRpb25hbGUgKElGQykuLi4nLFxyXG4gICAgICAgIGltYWdlOiAnYXNzZXRzL2ltZy9hY3R1LTEucG5nJ1xyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgdHlwZTogJ2FydGljbGUnLFxyXG4gICAgICAgIHRhZ3M6IFsnUlNFJ10sXHJcbiAgICAgICAgZGF0ZTogJzI2LzA3LzIwMTcnLFxyXG4gICAgICAgIHRpdGxlOiAndW5lIGFtYmlhbmNlIGZlc3RpdmUgZXQgZmFtaWxpYWxlIHF1ZSBz4oCZZXN0IGTDqXJvdWzDqScsXHJcbiAgICAgICAgY29udGVudDogJ0xlIEdyb3VwZSBCQ1AsIGFjdGV1ciBwYW5hZnJpY2FpbiBkZSByw6lmw6lyZW5jZSwgZXQgbGEgU29jacOpdMOpIEZpbmFUbmNpw6hyZSBJbnRlcm5hdGlvbmFsZSAoSUZDKS4uLidcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHR5cGU6ICdhcnRpY2xlJyxcclxuICAgICAgICB0YWdzOiBbJ1JTRScsICdGSU5BTkNFJ10sXHJcbiAgICAgICAgZGF0ZTogJzIxLzA3LzIwMTcnLFxyXG4gICAgICAgIHRpdGxlOiAndW5lIGFtYmlhbmNlIGZlc3RpdmUgZXQgZmFtaWxpYWxlIHF1ZSBz4oCZZXN0IGTDqXJvdWzDqScsXHJcbiAgICAgICAgY29udGVudDogJ0xlIEdyb3VwZSBCQ1AsIGFjdGV1ciBwYW5hZnJpY2FpbiBkZSByw6lmw6lyZW5jZSwgZXQgbGEgU29jacOpdMOpIEZpbmFUbmNpw6hyZSBJbnRlcm5hdGlvbmFsZSAoSUZDKS4uLidcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHR5cGU6ICdhcnRpY2xlLWltZycsXHJcbiAgICAgICAgdGFnczogWydSU0UnLCAnRklOQU5DRSddLFxyXG4gICAgICAgIGRhdGU6ICcyMS8wOC8yMDE3JyxcclxuICAgICAgICB0aXRsZTogJ3VuZSBhbWJpYW5jZSBmZXN0aXZlIGV0IGZhbWlsaWFsZSBxdWUgc+KAmWVzdCBkw6lyb3Vsw6knLFxyXG4gICAgICAgIGNvbnRlbnQ6ICdMZSBHcm91cGUgQkNQLCBhY3RldXIgcGFuYWZyaWNhaW4gZGUgcsOpZsOpcmVuY2UsIGV0IGxhIFNvY2nDqXTDqSBGaW5hVG5jacOocmUgSW50ZXJuYXRpb25hbGUgKElGQykuLi4nLFxyXG4gICAgICAgIGltYWdlOiAnYXNzZXRzL2ltZy9hY3R1LTEucG5nJ1xyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgdHlwZTogJ2FydGljbGUnLFxyXG4gICAgICAgIHRhZ3M6IFsnUlNFJ10sXHJcbiAgICAgICAgZGF0ZTogJzIyLzA4LzIwMTYnLFxyXG4gICAgICAgIHRpdGxlOiAndW5lIGFtYmlhbmNlIGZlc3RpdmUgZXQgZmFtaWxpYWxlIHF1ZSBz4oCZZXN0IGTDqXJvdWzDqScsXHJcbiAgICAgICAgY29udGVudDogJ0xlIEdyb3VwZSBCQ1AsIGFjdGV1ciBwYW5hZnJpY2FpbiBkZSByw6lmw6lyZW5jZSwgZXQgbGEgU29jacOpdMOpIEZpbmFUbmNpw6hyZSBJbnRlcm5hdGlvbmFsZSAoSUZDKS4uLidcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHR5cGU6ICdhcnRpY2xlJyxcclxuICAgICAgICB0YWdzOiBbJ1JTRScsICdGSU5BTkNFJ10sXHJcbiAgICAgICAgZGF0ZTogJzIxLzA5LzIwMTcnLFxyXG4gICAgICAgIHRpdGxlOiAndW5lIGFtYmlhbmNlIGZlc3RpdmUgZXQgZmFtaWxpYWxlIHF1ZSBz4oCZZXN0IGTDqXJvdWzDqScsXHJcbiAgICAgICAgY29udGVudDogJ0xlIEdyb3VwZSBCQ1AsIGFjdGV1ciBwYW5hZnJpY2FpbiBkZSByw6lmw6lyZW5jZSwgZXQgbGEgU29jacOpdMOpIEZpbmFUbmNpw6hyZSBJbnRlcm5hdGlvbmFsZSAoSUZDKS4uLidcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHR5cGU6ICdhcnRpY2xlLWltZycsXHJcbiAgICAgICAgdGFnczogWydSU0UnLCAnRklOQU5DRSddLFxyXG4gICAgICAgIGRhdGU6ICcyMS8xMC8yMDE3JyxcclxuICAgICAgICB0aXRsZTogJ3VuZSBhbWJpYW5jZSBmZXN0aXZlIGV0IGZhbWlsaWFsZSBxdWUgc+KAmWVzdCBkw6lyb3Vsw6knLFxyXG4gICAgICAgIGNvbnRlbnQ6ICdMZSBHcm91cGUgQkNQLCBhY3RldXIgcGFuYWZyaWNhaW4gZGUgcsOpZsOpcmVuY2UsIGV0IGxhIFNvY2nDqXTDqSBGaW5hVG5jacOocmUgSW50ZXJuYXRpb25hbGUgKElGQykuLi4nLFxyXG4gICAgICAgIGltYWdlOiAnYXNzZXRzL2ltZy9hY3R1LTEucG5nJ1xyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgdHlwZTogJ2FydGljbGUnLFxyXG4gICAgICAgIHRhZ3M6IFsnUlNFJywgJ0ZJTkFOQ0UnXSxcclxuICAgICAgICBkYXRlOiAnMjEvMDcvMjAxOCcsXHJcbiAgICAgICAgdGl0bGU6ICd1bmUgYW1iaWFuY2UgZmVzdGl2ZSBldCBmYW1pbGlhbGUgcXVlIHPigJllc3QgZMOpcm91bMOpJyxcclxuICAgICAgICBjb250ZW50OiAnTGUgR3JvdXBlIEJDUCwgYWN0ZXVyIHBhbmFmcmljYWluIGRlIHLDqWbDqXJlbmNlLCBldCBsYSBTb2Npw6l0w6kgRmluYVRuY2nDqHJlIEludGVybmF0aW9uYWxlIChJRkMpLi4uJ1xyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgdHlwZTogJ2FydGljbGUtaW1nJyxcclxuICAgICAgICB0YWdzOiBbJ1JTRScsICdGSU5BTkNFJ10sXHJcbiAgICAgICAgZGF0ZTogJzIxLzA3LzIwMTgnLFxyXG4gICAgICAgIHRpdGxlOiAndW5lIGFtYmlhbmNlIGZlc3RpdmUgZXQgZmFtaWxpYWxlIHF1ZSBz4oCZZXN0IGTDqXJvdWzDqScsXHJcbiAgICAgICAgY29udGVudDogJ0xlIEdyb3VwZSBCQ1AsIGFjdGV1ciBwYW5hZnJpY2FpbiBkZSByw6lmw6lyZW5jZSwgZXQgbGEgU29jacOpdMOpIEZpbmFUbmNpw6hyZSBJbnRlcm5hdGlvbmFsZSAoSUZDKS4uLicsXHJcbiAgICAgICAgaW1hZ2U6ICdhc3NldHMvaW1nL2FjdHUtMS5wbmcnXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB0eXBlOiAnYXJ0aWNsZScsXHJcbiAgICAgICAgdGFnczogWydSU0UnLCAnRklOQU5DRSddLFxyXG4gICAgICAgIGRhdGU6ICcyMS8wNy8yMDE5JyxcclxuICAgICAgICB0aXRsZTogJ3VuZSBhbWJpYW5jZSBmZXN0aXZlIGV0IGZhbWlsaWFsZSBxdWUgc+KAmWVzdCBkw6lyb3Vsw6knLFxyXG4gICAgICAgIGNvbnRlbnQ6ICdMZSBHcm91cGUgQkNQLCBhY3RldXIgcGFuYWZyaWNhaW4gZGUgcsOpZsOpcmVuY2UsIGV0IGxhIFNvY2nDqXTDqSBGaW5hVG5jacOocmUgSW50ZXJuYXRpb25hbGUgKElGQykuLi4nXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB0eXBlOiAnYXJ0aWNsZS1pbWcnLFxyXG4gICAgICAgIHRhZ3M6IFsnUlNFJywgJ0ZJTkFOQ0UnXSxcclxuICAgICAgICBkYXRlOiAnMjEvMDcvMjAyMCcsXHJcbiAgICAgICAgdGl0bGU6ICd1bmUgYW1iaWFuY2UgZmVzdGl2ZSBldCBmYW1pbGlhbGUgcXVlIHPigJllc3QgZMOpcm91bMOpJyxcclxuICAgICAgICBjb250ZW50OiAnTGUgR3JvdXBlIEJDUCwgYWN0ZXVyIHBhbmFmcmljYWluIGRlIHLDqWbDqXJlbmNlLCBldCBsYSBTb2Npw6l0w6kgRmluYVRuY2nDqHJlIEludGVybmF0aW9uYWxlIChJRkMpLi4uJyxcclxuICAgICAgICBpbWFnZTogJ2Fzc2V0cy9pbWcvYWN0dS0xLnBuZydcclxuICAgICAgfVxyXG4gICAgXVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gY2xlYW5UYWcgKHRhZ0ZpbHRlcikge1xyXG4gICAgdGFnRmlsdGVyID0gdGFnRmlsdGVyLnRyaW0oKS50b0xvd2VyQ2FzZSgpXHJcbiAgICBpZiAodGFnRmlsdGVyWzBdID09ICcjJykge1xyXG4gICAgICByZXR1cm4gdGFnRmlsdGVyLnNsaWNlKDEpXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRhZ0ZpbHRlclxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gbWFrZURhdGVPYmplY3QgKGRhdGVTdHJpbmcpIHtcclxuICAgIGxldCBbZGF5LCBtb250aCwgeWVhcl0gPSBkYXRlU3RyaW5nLnNwbGl0KCcvJylcclxuXHJcbiAgICByZXR1cm4gbmV3IERhdGUoeWVhciwgbW9udGggLSAxLCBkYXkpXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBhcHBseUZpbHRlcnMgKCkge1xyXG4gICAgbGV0IGRhdGEgPSBzdGF0ZS5kYXRhXHJcbiAgICBpZiAoc3RhdGUuZmlsdGVycy5sZW5ndGggPiAwKSB7XHJcbiAgICAgIGRhdGEgPSBkYXRhLmZpbHRlcihwb3N0ID0+IHtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHN0YXRlLmZpbHRlcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgIGlmIChwb3N0LnRhZ3MuaW5jbHVkZXMoc3RhdGUuZmlsdGVyc1tpXS50b1VwcGVyQ2FzZSgpKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmFsc2VcclxuICAgICAgfSlcclxuICAgIH1cclxuXHJcbiAgICBpZiAoc3RhdGUuZGF0ZUZpbHRlci5mcm9tICYmIHN0YXRlLmRhdGVGaWx0ZXIudG8pIHtcclxuICAgICAgZGF0YSA9IGRhdGEuZmlsdGVyKHBvc3QgPT4ge1xyXG4gICAgICAgIGlmIChcclxuICAgICAgICAgIG1ha2VEYXRlT2JqZWN0KHBvc3QuZGF0ZSkgLSBtYWtlRGF0ZU9iamVjdChzdGF0ZS5kYXRlRmlsdGVyLmZyb20pID49XHJcbiAgICAgICAgICAgIDAgJiZcclxuICAgICAgICAgIG1ha2VEYXRlT2JqZWN0KHBvc3QuZGF0ZSkgLSBtYWtlRGF0ZU9iamVjdChzdGF0ZS5kYXRlRmlsdGVyLnRvKSA8PSAwXHJcbiAgICAgICAgKSB7XHJcbiAgICAgICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICAgIH0pXHJcbiAgICB9XHJcblxyXG4gICAgZGF0YSA9IGRhdGEuc29ydCgoYSwgYikgPT4ge1xyXG4gICAgICByZXR1cm4gc3RhdGUub3JkZXIgPT0gJ2Rlc2MnXHJcbiAgICAgICAgPyBtYWtlRGF0ZU9iamVjdChiLmRhdGUpIC0gbWFrZURhdGVPYmplY3QoYS5kYXRlKVxyXG4gICAgICAgIDogbWFrZURhdGVPYmplY3QoYS5kYXRlKSAtIG1ha2VEYXRlT2JqZWN0KGIuZGF0ZSlcclxuICAgIH0pXHJcblxyXG4gICAgc2hvd1NlbGVjdGVkKGRhdGEpXHJcbiAgfVxyXG4gIGZ1bmN0aW9uIGNoYW5nZUZpbHRlcnMgKGUpIHtcclxuICAgIGUucHJldmVudERlZmF1bHQoKVxyXG5cclxuICAgIHRoaXMuY2xhc3NMaXN0LnRvZ2dsZSgnYWN0aXZlJylcclxuXHJcbiAgICBzdGF0ZS5maWx0ZXJzID0gW11cclxuXHJcbiAgICB0YWdGaWx0ZXJzLmZvckVhY2goZnVuY3Rpb24gKHRhZykge1xyXG4gICAgICBpZiAoJCh0YWcpLmhhc0NsYXNzKCdhY3RpdmUnKSkge1xyXG4gICAgICAgIHN0YXRlLmZpbHRlcnMucHVzaChjbGVhblRhZyh0YWcuaW5uZXJUZXh0KSlcclxuICAgICAgfVxyXG4gICAgfSlcclxuXHJcbiAgICBpZiAoc3RhdGUuZmlsdGVycy5sZW5ndGggPiAwKSB7XHJcbiAgICAgIGFsbEZpbHRlckJ0bi5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgYWxsRmlsdGVyQnRuLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpXHJcbiAgICB9XHJcblxyXG4gICAgYXBwbHlGaWx0ZXJzKClcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHNob3dTZWxlY3RlZCAoZGF0YSkge1xyXG4gICAgbGV0IHNlbGVjdGVkRGF0YSA9IGRhdGEuc2xpY2UoMCwgc3RhdGUubWF4ICogMylcclxuXHJcbiAgICBpZiAoc2VsZWN0ZWREYXRhLmxlbmd0aCA+PSBkYXRhLmxlbmd0aCkge1xyXG4gICAgICAkKCcjbW9yZS1hY3R1YWxpdGUnKS5oaWRlKClcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICQoJyNtb3JlLWFjdHVhbGl0ZScpLnNob3coKVxyXG4gICAgfVxyXG5cclxuICAgIHJlbmRlcihzZWxlY3RlZERhdGEpXHJcbiAgfVxyXG5cclxuICBhcHBseUZpbHRlcnMoKVxyXG5cclxuICAkKCcjbW9yZS1hY3R1YWxpdGUnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICBzdGF0ZS5tYXgrK1xyXG4gICAgYXBwbHlGaWx0ZXJzKClcclxuXHJcbiAgICB0aGlzLnNjcm9sbEludG9WaWV3KHtcclxuICAgICAgYmVoYXZpb3I6ICdzbW9vdGgnLFxyXG4gICAgICBpbmxpbmU6ICdlbmQnXHJcbiAgICB9KVxyXG4gICAgaWYgKHN0YXRlLm1heCArIDEgPiBzdGF0ZS5kYXRhLmxlbmd0aCAvIDMpICQodGhpcykuaGlkZSgpXHJcbiAgfSlcclxuXHJcbiAgZnVuY3Rpb24gcmVuZGVyIChkYXRhKSB7XHJcbiAgICBhY3R1YWxpdGVIb2xkZXIuaW5uZXJIVE1MID0gZGF0YVxyXG4gICAgICAubWFwKHBvc3QgPT4ge1xyXG4gICAgICAgIGlmIChwb3N0LnR5cGUgPT09ICdhcnRpY2xlJykge1xyXG4gICAgICAgICAgcmV0dXJuIGBcclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJjb2wtMTIgY29sLWxnLTQgbWItMlwiPlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cImNhcmQgY2FyZC0tYWN0dWFsaXRlc1wiPlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cImNhcmRfdGFnc1wiPlxyXG4gICAgICAgICAgICAke3Bvc3QudGFnc1xyXG4gICAgICAgICAgICAubWFwKHRhZyA9PiB7XHJcbiAgICAgICAgICAgICAgcmV0dXJuIGA8YSBjbGFzcz1cImJ0biBidG4tLXRhZyBidG4tLW9yYW5nZSBtci0xXCIgaHJlZj1cIi9nYnAtZnJvbnQvYWN0dWFsaXRlcy5odG1sXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgIyR7dGFnfVxyXG4gICAgICAgICAgICAgICAgICA8L2E+YFxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuam9pbignJyl9XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIDxwIGNsYXNzPVwiY2FyZF9kYXRlXCI+XHJcbiAgICAgICAgICAgICAgJHtwb3N0LmRhdGV9XHJcbiAgICAgICAgICA8L3A+XHJcbiAgICAgICAgICA8YSBjbGFzcz1cImNhcmRfdGl0bGVcIiBocmVmPVwiL2dicC1mcm9udC9uZXdzLWRldGFpbC5odG1sXCI+XHJcbiAgICAgICAgICAke3Bvc3QudGl0bGV9XHJcbiAgICAgICAgPC9hPlxyXG4gICAgICAgICAgPHAgY2xhc3M9XCJjYXJkX2Rlc2NcIj5cclxuICAgICAgICAgICAgJHtwb3N0LmNvbnRlbnR9XHJcbiAgICAgICAgICA8L3A+XHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiY2xlYXJmaXggcG9zaXRpb24tcmVsYXRpdmVcIj5cclxuICAgICAgICAgICAgICA8YSBjbGFzcz1cImNhcmRfbGlua1wiIGhyZWY9XCIvZ2JwLWZyb250L25ld3MtZGV0YWlsLmh0bWxcIj5cclxuICAgICAgICAgICAgZW4gc2F2b2lyIHBsdXNcclxuICAgICAgICAgIDwvYT5cclxuICAgICAgICAgICAgICA8YSBjbGFzcz1cImNhcmRfc2hhcmVcIiBocmVmPVwiL2Rpc3QvbmV3cy1kZXRhaWwuaHRtbFwiPlxyXG4gICAgICAgICAgICAgICAgICA8c3ZnPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPHVzZSB4bGluazpocmVmPVwiI2ljb24tc2hhcmUtc3ltYm9sXCI+PC91c2U+XHJcbiAgICAgICAgICAgICAgICAgIDwvc3ZnPlxyXG4gICAgICAgICAgICAgIDwvYT5cclxuICAgICAgICAgICAgICA8dWwgY2xhc3M9XCJzaGFyZVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPGxpPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxhIGhyZWY9XCJodHRwczovL3d3dy5mYWNlYm9vay5jb20vc2hhcmUucGhwP3U9XCIgb25jbGljaz1cImphdmFzY3JpcHQ6d2luZG93Lm9wZW4odGhpcy5ocmVmLCcnLCAnbWVudWJhcj1ubyx0b29sYmFyPW5vLHJlc2l6YWJsZT15ZXMsc2Nyb2xsYmFycz15ZXMsaGVpZ2h0PTYwMCx3aWR0aD02MDAnKTtyZXR1cm4gZmFsc2U7XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzdmcgY2xhc3M9XCJmYlwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHVzZSB4bGluazpocmVmPVwiI2ljb24tZmFjZWJvb2tcIj48L3VzZT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zdmc+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9hPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPC9saT5cclxuICAgICAgICAgICAgICAgICAgICAgIDxsaT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICA8YSBocmVmPVwiaHR0cHM6Ly90d2l0dGVyLmNvbS9pbnRlbnQvdHdlZXQ/dGV4dD10ZXh0LXBhcnRhZ2UmYW1wO3VybD1cIiBvbmNsaWNrPVwiamF2YXNjcmlwdDp3aW5kb3cub3Blbih0aGlzLmhyZWYsJycsICdtZW51YmFyPW5vLHRvb2xiYXI9bm8scmVzaXphYmxlPXllcyxzY3JvbGxiYXJzPXllcyxoZWlnaHQ9NjAwLHdpZHRoPTYwMCcpO3JldHVybiBmYWxzZTtcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHN2ZyBjbGFzcz1cInR3aXR0ZXJcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx1c2UgeGxpbms6aHJlZj1cIiNpY29uLXR3aXR0ZXJcIj48L3VzZT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zdmc+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9hPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPC9saT5cclxuICAgICAgICAgICAgICAgICAgICAgIDxsaT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICA8YSBocmVmPVwiaHR0cHM6Ly9wbHVzLmdvb2dsZS5jb20vc2hhcmU/dXJsPWh0dHBzOi8vcGx1cy5nb29nbGUuY29tXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzdmc+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dXNlIHhsaW5rOmhyZWY9XCIjaWNvbi1nb29nbGUtcGx1c1wiPjwvdXNlPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3N2Zz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L2E+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8L2xpPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPGxpPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxhIGhyZWY9XCJodHRwczovL2FwaS53aGF0c2FwcC5jb20vc2VuZD90ZXh0PXRleHQtd2hhdHNhcHAmYW1wO3VybD1cIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHN2Zz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx1c2UgeGxpbms6aHJlZj1cIiNpY29uLXdoYXRzYXBwXCI+PC91c2U+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3ZnPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvYT5cclxuICAgICAgICAgICAgICAgICAgICAgIDwvbGk+XHJcbiAgICAgICAgICAgICAgICAgIDwvdWw+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIGBcclxuICAgICAgICB9IGVsc2UgaWYgKHBvc3QudHlwZSA9PT0gJ2FydGljbGUtaW1nJykge1xyXG4gICAgICAgICAgcmV0dXJuIGBcclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJjb2wtMTIgY29sLWxnLTggbWItMlwiPjxkaXYgY2xhc3M9XCJjYXJkIGNhcmQtLWFjdHVhbGl0ZXMgY2FyZC0tYWN0dWFsaXRlcy1pbWcgY2xlYXJmaXhcIj5cclxuICAgICAgICAgIDxhIGNsYXNzPVwiaW1nLXdyYXBwZXJcIiBocmVmPVwiL2dicC1mcm9udC9uZXdzLWRldGFpbC5odG1sXCI+XHJcbiAgICAgICAgICAgICAgPGltZyBzcmM9XCIke3Bvc3QuaW1hZ2V9XCIgYWx0PVwiXCI+XHJcbiAgICAgICAgICA8L2E+XHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwid3JhcHBlclwiPlxyXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjYXJkX3RhZ3NcIj5cclxuICAgICAgICAgICAgICAke3Bvc3QudGFnc1xyXG4gICAgICAgICAgICAubWFwKHRhZyA9PiB7XHJcbiAgICAgICAgICAgICAgcmV0dXJuIGA8YSBjbGFzcz1cImJ0biBidG4tLXRhZyBidG4tLW9yYW5nZSBtci0xXCIgaHJlZj1cIi9nYnAtZnJvbnQvYWN0dWFsaXRlcy5odG1sXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICMke3RhZ31cclxuICAgICAgICAgICAgICAgICAgICAgIDwvYT5gXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5qb2luKCcnKX1cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8cCBjbGFzcz1cImNhcmRfZGF0ZVwiPlxyXG4gICAgICAgICAgICAgICAgICAke3Bvc3QuZGF0ZX1cclxuICAgICAgICAgICAgICA8L3A+XHJcbiAgICAgICAgICAgICAgPGEgY2xhc3M9XCJjYXJkX3RpdGxlXCIgaHJlZj1cIi9nYnAtZnJvbnQvbmV3cy1kZXRhaWwuaHRtbFwiPlxyXG4gICAgICAgICAgICAgICAgJHtwb3N0LnRpdGxlfVxyXG4gICAgICAgICAgPC9hPlxyXG4gICAgICAgICAgICAgIDxwIGNsYXNzPVwiY2FyZF9kZXNjXCI+XHJcbiAgICAgICAgICAgICAgJHtwb3N0LmNvbnRlbnR9XHJcbiAgICAgICAgICAgICAgPC9wPlxyXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjbGVhcmZpeCBwb3NpdGlvbi1yZWxhdGl2ZVwiPlxyXG4gICAgICAgICAgICAgICAgICA8YSBjbGFzcz1cImNhcmRfbGlua1wiIGhyZWY9XCIvZ2JwLWZyb250L25ld3MtZGV0YWlsLmh0bWxcIj5cclxuICAgICAgICAgICAgICBlbiBzYXZvaXIgcGx1c1xyXG4gICAgICAgICAgICA8L2E+XHJcbiAgICAgICAgICAgICAgICAgIDxhIGNsYXNzPVwiY2FyZF9zaGFyZVwiIGhyZWY9XCIjXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8c3ZnPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDx1c2UgeGxpbms6aHJlZj1cIiNpY29uLXNoYXJlLXN5bWJvbFwiPjwvdXNlPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPC9zdmc+XHJcbiAgICAgICAgICAgICAgICAgIDwvYT5cclxuICAgICAgICAgICAgICAgICAgPHVsIGNsYXNzPVwic2hhcmVcIj5cclxuICAgICAgICAgICAgICAgICAgICAgIDxsaT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICA8YSBocmVmPVwiaHR0cHM6Ly93d3cuZmFjZWJvb2suY29tL3NoYXJlLnBocD91PVwiIG9uY2xpY2s9XCJqYXZhc2NyaXB0OndpbmRvdy5vcGVuKHRoaXMuaHJlZiwnJywgJ21lbnViYXI9bm8sdG9vbGJhcj1ubyxyZXNpemFibGU9eWVzLHNjcm9sbGJhcnM9eWVzLGhlaWdodD02MDAsd2lkdGg9NjAwJyk7cmV0dXJuIGZhbHNlO1wiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3ZnIGNsYXNzPVwiZmJcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx1c2UgeGxpbms6aHJlZj1cIiNpY29uLWZhY2Vib29rXCI+PC91c2U+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3ZnPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvYT5cclxuICAgICAgICAgICAgICAgICAgICAgIDwvbGk+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8bGk+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPGEgaHJlZj1cImh0dHBzOi8vdHdpdHRlci5jb20vaW50ZW50L3R3ZWV0P3RleHQ9dGV4dC1wYXJ0YWdlJmFtcDt1cmw9XCIgb25jbGljaz1cImphdmFzY3JpcHQ6d2luZG93Lm9wZW4odGhpcy5ocmVmLCcnLCAnbWVudWJhcj1ubyx0b29sYmFyPW5vLHJlc2l6YWJsZT15ZXMsc2Nyb2xsYmFycz15ZXMsaGVpZ2h0PTYwMCx3aWR0aD02MDAnKTtyZXR1cm4gZmFsc2U7XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzdmcgY2xhc3M9XCJ0d2l0dGVyXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dXNlIHhsaW5rOmhyZWY9XCIjaWNvbi10d2l0dGVyXCI+PC91c2U+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3ZnPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvYT5cclxuICAgICAgICAgICAgICAgICAgICAgIDwvbGk+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8bGk+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPGEgaHJlZj1cImh0dHBzOi8vcGx1cy5nb29nbGUuY29tL3NoYXJlP3VybD1odHRwczovL3BsdXMuZ29vZ2xlLmNvbVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3ZnPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHVzZSB4bGluazpocmVmPVwiI2ljb24tZ29vZ2xlLXBsdXNcIj48L3VzZT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zdmc+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9hPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPC9saT5cclxuICAgICAgICAgICAgICAgICAgICAgIDxsaT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICA8YSBocmVmPVwiaHR0cHM6Ly9hcGkud2hhdHNhcHAuY29tL3NlbmQ/dGV4dD10ZXh0LXdoYXRzYXBwJmFtcDt1cmw9XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzdmc+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dXNlIHhsaW5rOmhyZWY9XCIjaWNvbi13aGF0c2FwcFwiPjwvdXNlPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3N2Zz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L2E+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8L2xpPlxyXG4gICAgICAgICAgICAgICAgICA8L3VsPlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgIDwvZGl2PjwvZGl2PlxyXG4gICAgICAgICAgYFxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICByZXR1cm4gYFxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cImNvbC0xMiBjb2wtbGctNCBtYi0yXCI+XHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjYXJkIGNhcmQtLWFjdHVhbGl0ZXMgY2FyZC0tYWN0dWFsaXRlcy1hbm5vbmNlXCI+XHJcbiAgICAgICAgICAgICAgPGltZyBzcmM9XCJhc3NldHMvaW1nL3R3aXR0ZXIucG5nXCIgYWx0PVwiXCI+XHJcbiAgICAgICAgICAgICAgPHAgY2xhc3M9XCJjYXJkX2Rlc2NcIj5cclxuICAgICAgICAgICAgICAgICR7cG9zdC5jb250ZW50fVxyXG4gICAgICAgICAgICAgIDwvcD5cclxuICAgICAgICAgICAgICA8YSBjbGFzcz1cImNhcmRfbGlua1wiIGhyZWY9XCJodHRwOi8vd3d3LnR3aXR0ZXIuY29tL0JQX01hcm9jXCIgdGFyZ2V0PVwiX2JsYW5rXCI+XHJcbiAgICAgICAgICAgICAgICBUd2l0dGVyLmNvbS9CUF9NYXJvY1xyXG4gICAgICAgICAgICAgIDwvYT5cclxuICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgYFxyXG4gICAgICAgIH1cclxuICAgICAgfSlcclxuICAgICAgLmpvaW4oJycpXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBkYXRlRm9ybWF0IChkYXRlKSB7XHJcbiAgICByZXR1cm4gYDEvJHtkYXRlLm1vbnRoKCkgKyAxfS8ke2RhdGUueWVhcigpfWBcclxuICB9XHJcblxyXG4gIGxldCBzdGFydEZpbHRlciA9IG5ldyBEYXRlRmlsdGVyKHN0YXJ0RGF0ZSwgZmFsc2UsIGZ1bmN0aW9uIChzdGFydCkge1xyXG4gICAgc3RhdGUuZGF0ZUZpbHRlci5mcm9tID0gZGF0ZUZvcm1hdChzdGFydClcclxuICAgIGFwcGx5RmlsdGVycygpXHJcbiAgfSlcclxuICBzdGFydEZpbHRlci5pbml0KClcclxuXHJcbiAgbGV0IGVuZEZpbHRlciA9IG5ldyBEYXRlRmlsdGVyKGVuZERhdGUsIHRydWUsIGZ1bmN0aW9uIChlbmQpIHtcclxuICAgIHN0YXRlLmRhdGVGaWx0ZXIudG8gPSBkYXRlRm9ybWF0KGVuZClcclxuICAgIGFwcGx5RmlsdGVycygpXHJcbiAgfSlcclxuICBlbmRGaWx0ZXIuaW5pdCgpXHJcblxyXG4gICQoJyNhY3R1YWxpdGUtc2VsZWN0LWZpbHRlcicpLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICBsZXQgc2VsZWN0ZWQgPSAkKCcjYWN0dWFsaXRlLXNlbGVjdC1maWx0ZXInKS5uZXh0KCkuZmluZCgnLmN1cnJlbnQnKS50ZXh0KClcclxuICAgIHNlbGVjdGVkID0gc2VsZWN0ZWQudG9Mb3dlckNhc2UoKVxyXG5cclxuICAgIC8vIGNvbnNvbGUubG9nKHNlbGVjdGVkKVxyXG5cclxuICAgICQoJyNkYXRlLWZpbHRlcicpLmFkZENsYXNzKCdkLWZsZXgnKVxyXG4gICAgJCgnI2RhdGUtZmlsdGVyJykuc2hvdygpXHJcblxyXG4gICAgaWYgKHNlbGVjdGVkICE9PSAncMOpcmlvZGUnKSB7XHJcbiAgICAgICQoJyNkYXRlLWZpbHRlcicpLnJlbW92ZUNsYXNzKCdkLWZsZXgnKVxyXG4gICAgICAkKCcjZGF0ZS1maWx0ZXInKS5oaWRlKClcclxuICAgICAgc3RhdGUub3JkZXIgPSAnZGVzYydcclxuICAgICAgc3RhdGUuZGF0ZUZpbHRlci5mcm9tID0gJydcclxuICAgICAgc3RhdGUuZGF0ZUZpbHRlci50byA9ICcnXHJcbiAgICAgIHN0YXJ0RmlsdGVyLmNsZWFyKClcclxuICAgICAgZW5kRmlsdGVyLmNsZWFyKClcclxuICAgIH1cclxuXHJcbiAgICBpZiAoc2VsZWN0ZWQgPT09ICdwbHVzIGFuY2llbnMnKSB7XHJcbiAgICAgIHN0YXRlLm9yZGVyID0gJ2FzYydcclxuICAgICAgYXBwbHlGaWx0ZXJzKClcclxuICAgIH0gZWxzZSBpZiAoc2VsZWN0ZWQgPT09ICdwbHVzIHLDqWNlbnRzJykge1xyXG4gICAgICBhcHBseUZpbHRlcnMoKVxyXG4gICAgICBzdGF0ZS5vcmRlciA9ICdkZXNjJ1xyXG4gICAgfVxyXG4gIH0pXHJcblxyXG4gIGFsbEZpbHRlckJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgIHN0YXRlLmZpbHRlcnMgPSBbXVxyXG4gICAgdGFnRmlsdGVycy5mb3JFYWNoKHRhZyA9PiB7XHJcbiAgICAgIHRhZy5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKVxyXG4gICAgfSlcclxuICAgIHRoaXMuY2xhc3NMaXN0LmFkZCgnYWN0aXZlJylcclxuICAgIGFwcGx5RmlsdGVycygpXHJcbiAgfSlcclxuICB0YWdGaWx0ZXJzLmZvckVhY2godGFnID0+IHtcclxuICAgIHRhZy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGNoYW5nZUZpbHRlcnMpXHJcbiAgfSlcclxuXHJcbiAgJCh3aW5kb3cpLm9uKCdzY3JvbGwnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICBsZXQgY29udGVudEhvbGRlciA9ICQoJyNhY3R1YWxpdGUtaG9sZGVyJylcclxuXHJcbiAgICBsZXQgY29udGVudEVuZCA9IGNvbnRlbnRIb2xkZXIub2Zmc2V0KCkudG9wICsgY29udGVudEhvbGRlci5oZWlnaHQoKVxyXG5cclxuICAgIGlmIChcclxuICAgICAgJCh0aGlzKS5zY3JvbGxUb3AoKSArICQod2luZG93KS5oZWlnaHQoKSAtIDI1MCA+PSBjb250ZW50RW5kICYmXHJcbiAgICAgIHN0YXRlLm1heCAqIDMgPD0gc3RhdGUuZGF0YS5sZW5ndGhcclxuICAgICkge1xyXG4gICAgICBzdGF0ZS5tYXgrK1xyXG4gICAgICBhcHBseUZpbHRlcnMoKVxyXG4gICAgfVxyXG4gIH0pXHJcbn1cclxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gKCkge1xyXG4gIGxldCBhcHBlbE9mZnJlcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNhcHBlbC1vZmZyZXMnKVxyXG5cclxuICBpZiAoIWFwcGVsT2ZmcmVzKSByZXR1cm5cclxuXHJcbiAgbGV0IHN0YXRlID0ge1xyXG4gICAgb3JnYW5pc21lOiAnJyxcclxuICAgIG5hdHVyZTogJycsXHJcbiAgICBkYXRhOiBbXHJcbiAgICAgIHtcclxuICAgICAgICBvcmdhbmlzbWU6ICdvcmdhbmlzbWUxJyxcclxuICAgICAgICBuYXR1cmU6ICduYXR1cmUxJyxcclxuICAgICAgICBkYXRlczoge1xyXG4gICAgICAgICAgcHViOiAnMTIvMTIvMjAyMCcsXHJcbiAgICAgICAgICBkZXBvOiAnMTIvMTIvMjAyMidcclxuICAgICAgICB9LFxyXG4gICAgICAgIHRpdGxlOiAnTGEgQmFucXVlIENlbnRyYWxlIFBvcHVsYWlyZSBsYW5jZSB1biBhcHBlbCBk4oCZb2ZmcmVzIG91dmVydCByZWxhdGlmIGF1IMKrIE1BUkNIRSBDQURSRSBBQ1FVSVNJVElPTiBERSBTVFlMT1MgUFJPTU9USU9OTkVMUyDCuy4nLFxyXG4gICAgICAgIG51bWVybzogJ07CsCA6IEFPIDAxNC0xOCAtIFByb3JvZ2F0aW9uJ1xyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgb3JnYW5pc21lOiAnb3JnYW5pc21lMScsXHJcbiAgICAgICAgbmF0dXJlOiAnbmF0dXJlMScsXHJcbiAgICAgICAgZGF0ZXM6IHtcclxuICAgICAgICAgIHB1YjogJzEyLzEyLzIwMjAnLFxyXG4gICAgICAgICAgZGVwbzogJzEyLzEyLzIwMjInXHJcbiAgICAgICAgfSxcclxuICAgICAgICB0aXRsZTogJ0xhIEJhbnF1ZSBDZW50cmFsZSBQb3B1bGFpcmUgbGFuY2UgdW4gYXBwZWwgZOKAmW9mZnJlcyBvdXZlcnQgcmVsYXRpZiBhdSDCqyBNQVJDSEUgQ0FEUkUgQUNRVUlTSVRJT04gREUgU1RZTE9TIFBST01PVElPTk5FTFMgwrsuJyxcclxuICAgICAgICBudW1lcm86ICdOwrAgOiBBTyAwMTQtMTggLSBQcm9yb2dhdGlvbidcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIG9yZ2FuaXNtZTogJ29yZ2FuaXNtZTInLFxyXG4gICAgICAgIG5hdHVyZTogJ25hdHVyZTEnLFxyXG4gICAgICAgIGRhdGVzOiB7XHJcbiAgICAgICAgICBwdWI6ICcxMi8xMi8yMDIwJyxcclxuICAgICAgICAgIGRlcG86ICcxMi8xMi8yMDIyJ1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdGl0bGU6ICdMYSBCYW5xdWUgQ2VudHJhbGUgUG9wdWxhaXJlIGxhbmNlIHVuIGFwcGVsIGTigJlvZmZyZXMgb3V2ZXJ0IHJlbGF0aWYgYXUgwqsgTUFSQ0hFIENBRFJFIEFDUVVJU0lUSU9OIERFIFNUWUxPUyBQUk9NT1RJT05ORUxTIMK7LicsXHJcbiAgICAgICAgbnVtZXJvOiAnTsKwIDogQU8gMDE0LTE4IC0gUHJvcm9nYXRpb24nXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBvcmdhbmlzbWU6ICdvcmdhbmlzbWUxJyxcclxuICAgICAgICBuYXR1cmU6ICduYXR1cmUxJyxcclxuICAgICAgICBkYXRlczoge1xyXG4gICAgICAgICAgcHViOiAnMTIvMTIvMjAyMCcsXHJcbiAgICAgICAgICBkZXBvOiAnMTIvMTIvMjAyMidcclxuICAgICAgICB9LFxyXG4gICAgICAgIHRpdGxlOiAnTGEgQmFucXVlIENlbnRyYWxlIFBvcHVsYWlyZSBsYW5jZSB1biBhcHBlbCBk4oCZb2ZmcmVzIG91dmVydCByZWxhdGlmIGF1IMKrIE1BUkNIRSBDQURSRSBBQ1FVSVNJVElPTiBERSBTVFlMT1MgUFJPTU9USU9OTkVMUyDCuy4nLFxyXG4gICAgICAgIG51bWVybzogJ07CsCA6IEFPIDAxNC0xOCAtIFByb3JvZ2F0aW9uJ1xyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgb3JnYW5pc21lOiAnb3JnYW5pc21lMScsXHJcbiAgICAgICAgbmF0dXJlOiAnbmF0dXJlMScsXHJcbiAgICAgICAgZGF0ZXM6IHtcclxuICAgICAgICAgIHB1YjogJzEyLzEyLzIwMjAnLFxyXG4gICAgICAgICAgZGVwbzogJzEyLzEyLzIwMjInXHJcbiAgICAgICAgfSxcclxuICAgICAgICB0aXRsZTogJ0xhIEJhbnF1ZSBDZW50cmFsZSBQb3B1bGFpcmUgbGFuY2UgdW4gYXBwZWwgZOKAmW9mZnJlcyBvdXZlcnQgcmVsYXRpZiBhdSDCqyBNQVJDSEUgQ0FEUkUgQUNRVUlTSVRJT04gREUgU1RZTE9TIFBST01PVElPTk5FTFMgwrsuJyxcclxuICAgICAgICBudW1lcm86ICdOwrAgOiBBTyAwMTQtMTggLSBQcm9yb2dhdGlvbidcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIG9yZ2FuaXNtZTogJ29yZ2FuaXNtZTInLFxyXG4gICAgICAgIG5hdHVyZTogJ25hdHVyZTEnLFxyXG4gICAgICAgIGRhdGVzOiB7XHJcbiAgICAgICAgICBwdWI6ICcxMi8xMi8yMDIwJyxcclxuICAgICAgICAgIGRlcG86ICcxMi8xMi8yMDIyJ1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdGl0bGU6ICdMYSBCYW5xdWUgQ2VudHJhbGUgUG9wdWxhaXJlIGxhbmNlIHVuIGFwcGVsIGTigJlvZmZyZXMgb3V2ZXJ0IHJlbGF0aWYgYXUgwqsgTUFSQ0hFIENBRFJFIEFDUVVJU0lUSU9OIERFIFNUWUxPUyBQUk9NT1RJT05ORUxTIMK7LicsXHJcbiAgICAgICAgbnVtZXJvOiAnTsKwIDogQU8gMDE0LTE4IC0gUHJvcm9nYXRpb24nXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBvcmdhbmlzbWU6ICdvcmdhbmlzbWUyJyxcclxuICAgICAgICBuYXR1cmU6ICduYXR1cmUxJyxcclxuICAgICAgICBkYXRlczoge1xyXG4gICAgICAgICAgcHViOiAnMTIvMTIvMjAyMCcsXHJcbiAgICAgICAgICBkZXBvOiAnMTIvMTIvMjAyMidcclxuICAgICAgICB9LFxyXG4gICAgICAgIHRpdGxlOiAnTGEgQmFucXVlIENlbnRyYWxlIFBvcHVsYWlyZSBsYW5jZSB1biBhcHBlbCBk4oCZb2ZmcmVzIG91dmVydCByZWxhdGlmIGF1IMKrIE1BUkNIRSBDQURSRSBBQ1FVSVNJVElPTiBERSBTVFlMT1MgUFJPTU9USU9OTkVMUyDCuy4nLFxyXG4gICAgICAgIG51bWVybzogJ07CsCA6IEFPIDAxNC0xOCAtIFByb3JvZ2F0aW9uJ1xyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgb3JnYW5pc21lOiAnb3JnYW5pc21lMycsXHJcbiAgICAgICAgbmF0dXJlOiAnbmF0dXJlMicsXHJcbiAgICAgICAgZGF0ZXM6IHtcclxuICAgICAgICAgIHB1YjogJzEyLzEyLzIwMjAnLFxyXG4gICAgICAgICAgZGVwbzogJzEyLzEyLzIwMjInXHJcbiAgICAgICAgfSxcclxuICAgICAgICB0aXRsZTogJ0xhIEJhbnF1ZSBDZW50cmFsZSBQb3B1bGFpcmUgbGFuY2UgdW4gYXBwZWwgZOKAmW9mZnJlcyBvdXZlcnQgcmVsYXRpZiBhdSDCqyBNQVJDSEUgQ0FEUkUgQUNRVUlTSVRJT04gREUgU1RZTE9TIFBST01PVElPTk5FTFMgwrsuJyxcclxuICAgICAgICBudW1lcm86ICdOwrAgOiBBTyAwMTQtMTggLSBQcm9yb2dhdGlvbidcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIG9yZ2FuaXNtZTogJ29yZ2FuaXNtZTQnLFxyXG4gICAgICAgIG5hdHVyZTogJ25hdHVyZTEnLFxyXG4gICAgICAgIGRhdGVzOiB7XHJcbiAgICAgICAgICBwdWI6ICcxMi8xMi8yMDIwJyxcclxuICAgICAgICAgIGRlcG86ICcxMi8xMi8yMDIyJ1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdGl0bGU6ICdMYSBCYW5xdWUgQ2VudHJhbGUgUG9wdWxhaXJlIGxhbmNlIHVuIGFwcGVsIGTigJlvZmZyZXMgb3V2ZXJ0IHJlbGF0aWYgYXUgwqsgTUFSQ0hFIENBRFJFIEFDUVVJU0lUSU9OIERFIFNUWUxPUyBQUk9NT1RJT05ORUxTIMK7LicsXHJcbiAgICAgICAgbnVtZXJvOiAnTsKwIDogQU8gMDE0LTE4IC0gUHJvcm9nYXRpb24nXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBvcmdhbmlzbWU6ICdvcmdhbmlzbWU0JyxcclxuICAgICAgICBuYXR1cmU6ICduYXR1cmUxJyxcclxuICAgICAgICBkYXRlczoge1xyXG4gICAgICAgICAgcHViOiAnMTIvMTIvMjAyMCcsXHJcbiAgICAgICAgICBkZXBvOiAnMTIvMTIvMjAyMidcclxuICAgICAgICB9LFxyXG4gICAgICAgIHRpdGxlOiAnTGEgQmFucXVlIENlbnRyYWxlIFBvcHVsYWlyZSBsYW5jZSB1biBhcHBlbCBk4oCZb2ZmcmVzIG91dmVydCByZWxhdGlmIGF1IMKrIE1BUkNIRSBDQURSRSBBQ1FVSVNJVElPTiBERSBTVFlMT1MgUFJPTU9USU9OTkVMUyDCuy4nLFxyXG4gICAgICAgIG51bWVybzogJ07CsCA6IEFPIDAxNC0xOCAtIFByb3JvZ2F0aW9uJ1xyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgb3JnYW5pc21lOiAnb3JnYW5pc21lNScsXHJcbiAgICAgICAgbmF0dXJlOiAnbmF0dXJlMScsXHJcbiAgICAgICAgZGF0ZXM6IHtcclxuICAgICAgICAgIHB1YjogJzEyLzEyLzIwMjAnLFxyXG4gICAgICAgICAgZGVwbzogJzEyLzEyLzIwMjInXHJcbiAgICAgICAgfSxcclxuICAgICAgICB0aXRsZTogJ0xhIEJhbnF1ZSBDZW50cmFsZSBQb3B1bGFpcmUgbGFuY2UgdW4gYXBwZWwgZOKAmW9mZnJlcyBvdXZlcnQgcmVsYXRpZiBhdSDCqyBNQVJDSEUgQ0FEUkUgQUNRVUlTSVRJT04gREUgU1RZTE9TIFBST01PVElPTk5FTFMgwrsuJyxcclxuICAgICAgICBudW1lcm86ICdOwrAgOiBBTyAwMTQtMTggLSBQcm9yb2dhdGlvbidcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIG9yZ2FuaXNtZTogJ29yZ2FuaXNtZTMnLFxyXG4gICAgICAgIG5hdHVyZTogJ25hdHVyZTEnLFxyXG4gICAgICAgIGRhdGVzOiB7XHJcbiAgICAgICAgICBwdWI6ICcxMi8xMi8yMDIwJyxcclxuICAgICAgICAgIGRlcG86ICcxMi8xMi8yMDIyJ1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdGl0bGU6ICdMYSBCYW5xdWUgQ2VudHJhbGUgUG9wdWxhaXJlIGxhbmNlIHVuIGFwcGVsIGTigJlvZmZyZXMgb3V2ZXJ0IHJlbGF0aWYgYXUgwqsgTUFSQ0hFIENBRFJFIEFDUVVJU0lUSU9OIERFIFNUWUxPUyBQUk9NT1RJT05ORUxTIMK7LicsXHJcbiAgICAgICAgbnVtZXJvOiAnTsKwIDogQU8gMDE0LTE4IC0gUHJvcm9nYXRpb24nXHJcbiAgICAgIH1cclxuICAgIF1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGFwcGx5RmlsdGVyICgpIHtcclxuICAgIGxldCBkYXRhID0gc3RhdGUuZGF0YS5maWx0ZXIob2ZmZXIgPT4ge1xyXG4gICAgICByZXR1cm4gKFxyXG4gICAgICAgIHN0YXRlLm9yZ2FuaXNtZSA9PT0gb2ZmZXIub3JnYW5pc21lICYmIHN0YXRlLm5hdHVyZSA9PT0gb2ZmZXIubmF0dXJlXHJcbiAgICAgIClcclxuICAgIH0pXHJcblxyXG4gICAgcmVuZGVyKGRhdGEpXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiByZW5kZXIgKGRhdGEpIHtcclxuICAgIGFwcGVsT2ZmcmVzLmlubmVySFRNTCA9IGRhdGFcclxuICAgICAgLm1hcChvZmZlciA9PiB7XHJcbiAgICAgICAgcmV0dXJuIGA8YSBjbGFzcz1cIm5ld3NcIiBocmVmPVwiL2dicC1mcm9udC9uZXdzLWRldGFpbC5odG1sXCI+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJuZXdzX2JvcmRlclwiPlxyXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm5ld3NfY29udGVudFwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJuZXdzX2RhdGUgY2xlYXJmaXhcIj5cclxuICAgICAgICAgICAgICAgICAgICAgIDxwIGNsYXNzPVwicHVibGljYXRpb25cIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgRGF0ZSBkZSBwdWJsaWNhdGlvbiAgOiAke29mZmVyLmRhdGVzLnB1Yn1cclxuICAgICAgICAgICAgICAgICAgICAgIDwvcD5cclxuICAgICAgICAgICAgICAgICAgICAgIDxwIGNsYXNzPVwibGltaXRlXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIERhdGUgbGltaXRlIGRlIGTDqXBvdCBkZSBkb3NzaWVyIDogJHtvZmZlci5kYXRlcy5kZXBvfVxyXG4gICAgICAgICAgICAgICAgICAgICAgPC9wPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDxoMiBjbGFzcz1cIm5ld3NfdGl0bGVcIj5cclxuICAgICAgICAgICAgICAgICAgICAke29mZmVyLnRpdGxlfVxyXG4gICAgICAgICAgICAgICAgICAgIDwvaDI+XHJcbiAgICAgICAgICAgICAgICAgICAgPHAgY2xhc3M9XCJuZXdzX3R4dFwiPlxyXG4gICAgICAgICAgICAgICAgICAgICR7b2ZmZXIubnVtZXJvfVxyXG4gICAgICAgICAgICAgICAgICAgIDwvcD5cclxuICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8L2E+YFxyXG4gICAgICB9KVxyXG4gICAgICAuam9pbignJylcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGluaXQgKCkge1xyXG4gICAgc3RhdGUub3JnYW5pc21lID0gJCgnI2FwcGVsLW9mZnJlcy1zZWxlY3Rfb3JnYW5pc21lJylcclxuICAgICAgLm5leHQoKVxyXG4gICAgICAuZmluZCgnLmN1cnJlbnQnKVxyXG4gICAgICAudGV4dCgpXHJcbiAgICAgIC50b0xvd2VyQ2FzZSgpXHJcbiAgICBzdGF0ZS5uYXR1cmUgPSAkKCcjYXBwZWwtb2ZmcmVzLXNlbGVjdF9uYXR1cmUnKVxyXG4gICAgICAubmV4dCgpXHJcbiAgICAgIC5maW5kKCcuY3VycmVudCcpXHJcbiAgICAgIC50ZXh0KClcclxuICAgICAgLnRvTG93ZXJDYXNlKClcclxuICAgIGFwcGx5RmlsdGVyKClcclxuICB9XHJcbiAgaW5pdCgpXHJcblxyXG4gICQoJyNhcHBlbC1vZmZyZXMtc2VsZWN0X29yZ2FuaXNtZScpLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICBzdGF0ZS5vcmdhbmlzbWUgPSAkKCcjYXBwZWwtb2ZmcmVzLXNlbGVjdF9vcmdhbmlzbWUnKVxyXG4gICAgICAubmV4dCgpXHJcbiAgICAgIC5maW5kKCcuY3VycmVudCcpXHJcbiAgICAgIC50ZXh0KClcclxuICAgICAgLnRvTG93ZXJDYXNlKClcclxuICAgIGFwcGx5RmlsdGVyKClcclxuICB9KVxyXG4gICQoJyNhcHBlbC1vZmZyZXMtc2VsZWN0X25hdHVyZScpLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICBzdGF0ZS5uYXR1cmUgPSAkKCcjYXBwZWwtb2ZmcmVzLXNlbGVjdF9uYXR1cmUnKVxyXG4gICAgICAubmV4dCgpXHJcbiAgICAgIC5maW5kKCcuY3VycmVudCcpXHJcbiAgICAgIC50ZXh0KClcclxuICAgICAgLnRvTG93ZXJDYXNlKClcclxuICAgIGFwcGx5RmlsdGVyKClcclxuICB9KVxyXG59XHJcbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xyXG5cdGlmICgkKCcuYXJ0aWNsZS1zbGlkZXInKS5sZW5ndGgpIHtcclxuXHJcbiAgICAgICAgdmFyIHJ0bCA9ICQoJ2h0bWwnKS5hdHRyKCdkaXInKSA9PSAncnRsJztcclxuXHJcblx0XHRpZiAoJCh3aW5kb3cpLndpZHRoKCkgPiA5OTEpIHtcclxuXHRcdFx0YXJ0aWNsZVNsaWRlcigwLCBydGwpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0YXJ0aWNsZVNsaWRlcigzMiwgcnRsKTtcclxuXHRcdH1cclxuXHJcblx0XHQkKHdpbmRvdykub24oJ3Jlc2l6ZScsIGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0aWYgKCQod2luZG93KS53aWR0aCgpID4gOTkxKSB7XHJcblx0XHRcdFx0YXJ0aWNsZVNsaWRlcigwLCBydGwpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGFydGljbGVTbGlkZXIoMzIsIHJ0bCk7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGFydGljbGVTbGlkZXIoc3RhZ2VQYWRkaW5nLCBydGwpIHtcclxuICAgICAgICAkKCcuYXJ0aWNsZS1zbGlkZXIub3dsLWNhcm91c2VsJykub3dsQ2Fyb3VzZWwoe1xyXG4gICAgICAgICAgICBzdGFnZVBhZGRpbmc6IHN0YWdlUGFkZGluZyxcclxuICAgICAgICAgICAgbWFyZ2luOiAxMCxcclxuICAgICAgICAgICAgZG90czogdHJ1ZSxcclxuICAgICAgICAgICAgbmF2OiB0cnVlLFxyXG4gICAgICAgICAgICBsb29wOiBmYWxzZSxcclxuICAgICAgICAgICAgcnRsOiBydGwsXHJcbiAgICAgICAgICAgIHJlc3BvbnNpdmU6IHtcclxuICAgICAgICAgICAgICAgIDA6IHtcclxuICAgICAgICAgICAgICAgICAgICBpdGVtczogMVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIDk5Mjoge1xyXG4gICAgICAgICAgICAgICAgXHRpdGVtczogM1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59IiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gKCkge1xyXG5cdGlmICgkKCcuYmVzb2luLWFpZGUnKS5sZW5ndGgpIHtcclxuXHJcblx0XHQkKCcuYmVzb2luLWFpZGUnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdCQoJy5xdWVzdGlvbnMnKS50b2dnbGVDbGFzcygnZC1ub25lJyk7XHJcblx0XHR9KTtcclxuXHR9XHJcbn0iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiAoKSB7XHJcblxyXG5cdGlmICgkKCcuY2FyZC1hY3R1YWxpdGVzLXNsaWRlcicpLmxlbmd0aCkge1xyXG5cclxuICAgICAgICB2YXIgcnRsID0gJCgnaHRtbCcpLmF0dHIoJ2RpcicpID09ICdydGwnO1xyXG5cclxuXHRcdGlmICgkKHdpbmRvdykud2lkdGgoKSA8PSA5OTEpIHtcclxuICAgICAgICAgICAgXHJcblx0XHRcdGNhcmRBY3R1U2xpZGVyKDQ4LCBydGwpO1xyXG5cclxuXHRcdH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAkKCcuY2FyZC1hY3R1YWxpdGVzLXNsaWRlcicpLm93bENhcm91c2VsKCdkZXN0cm95Jyk7XHJcblxyXG4gICAgICAgIH1cclxuXHJcblx0XHQkKHdpbmRvdykub24oJ3Jlc2l6ZScsIGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0aWYgKCQod2luZG93KS53aWR0aCgpIDw9IDk5MSkge1xyXG5cclxuICAgICAgICAgICAgICAgICQoJy5jYXJkLWFjdHVhbGl0ZXMtc2xpZGVyJykub3dsQ2Fyb3VzZWwoJ2Rlc3Ryb3knKTtcclxuXHRcdFx0XHRjYXJkQWN0dVNsaWRlcig0OCwgcnRsKTtcclxuXHJcblx0XHRcdH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgJCgnLmNhcmQtYWN0dWFsaXRlcy1zbGlkZXInKS5vd2xDYXJvdXNlbCgnZGVzdHJveScpO1xyXG4gICAgICAgICAgICB9XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGNhcmRBY3R1U2xpZGVyKHN0YWdlUGFkZGluZywgcnRsKSB7XHJcbiAgICAgICAgJCgnLmNhcmQtYWN0dWFsaXRlcy1zbGlkZXIub3dsLWNhcm91c2VsJykub3dsQ2Fyb3VzZWwoe1xyXG4gICAgICAgICAgICBzdGFnZVBhZGRpbmc6IHN0YWdlUGFkZGluZyxcclxuICAgICAgICAgICAgbWFyZ2luOiAxNixcclxuICAgICAgICAgICAgZG90czogdHJ1ZSxcclxuICAgICAgICAgICAgbmF2OiBmYWxzZSxcclxuICAgICAgICAgICAgcnRsOiBydGwsXHJcbiAgICAgICAgICAgIHJlc3BvbnNpdmU6IHtcclxuICAgICAgICAgICAgICAgIDA6IHtcclxuICAgICAgICAgICAgICAgICAgICBpdGVtczogMVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59IiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gKCkge1xyXG5cclxuXHRpZiAoJCgnLmNhcmQtaGlzdG9pcmUtc2xpZGVyJykubGVuZ3RoKSB7XHJcblxyXG4gICAgICAgICB2YXIgcnRsID0gJCgnaHRtbCcpLmF0dHIoJ2RpcicpID09ICdydGwnO1xyXG5cclxuXHRcdGlmICgkKHdpbmRvdykud2lkdGgoKSA8PSA3NjgpIHtcclxuXHJcblx0XHRcdGNhcmRIaXN0b2lyZVNsaWRlcig0OCwgcnRsKTtcclxuXHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHQkKCcuY2FyZC1oaXN0b2lyZS1zbGlkZXInKS5vd2xDYXJvdXNlbCgnZGVzdHJveScpO1xyXG5cdFx0fVxyXG5cclxuXHRcdCQod2luZG93KS5vbigncmVzaXplJywgZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRpZiAoJCh3aW5kb3cpLndpZHRoKCkgPD0gNzY4KSB7XHJcblxyXG5cdFx0XHRcdGNhcmRIaXN0b2lyZVNsaWRlcig0OCwgcnRsKTtcclxuXHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0JCgnLmNhcmQtaGlzdG9pcmUtc2xpZGVyJykub3dsQ2Fyb3VzZWwoJ2Rlc3Ryb3knKTtcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBjYXJkSGlzdG9pcmVTbGlkZXIoc3RhZ2VQYWRkaW5nLCBydGwpIHtcclxuICAgICAgICAkKCcuY2FyZC1oaXN0b2lyZS1zbGlkZXIub3dsLWNhcm91c2VsJykub3dsQ2Fyb3VzZWwoe1xyXG4gICAgICAgICAgICBzdGFnZVBhZGRpbmc6IHN0YWdlUGFkZGluZyxcclxuICAgICAgICAgICAgbWFyZ2luOiA1LFxyXG4gICAgICAgICAgICBkb3RzOiB0cnVlLFxyXG4gICAgICAgICAgICBuYXY6IGZhbHNlLFxyXG4gICAgICAgICAgICBydGw6IHJ0bCxcclxuICAgICAgICAgICAgcmVzcG9uc2l2ZToge1xyXG4gICAgICAgICAgICAgICAgMDoge1xyXG4gICAgICAgICAgICAgICAgICAgIGl0ZW1zOiAxXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn0iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiAoKSB7XHJcblx0aWYgKCQoJy5jYXJkLS1yYXBwb3J0LXJpZ2h0JykubGVuZ3RoKSB7XHJcblxyXG5cdFx0dmFyIHJ0bCA9ICQoJ2h0bWwnKS5hdHRyKCdkaXInKSA9PSAncnRsJztcclxuXHJcblx0XHRpZiAoJCh3aW5kb3cpLndpZHRoKCkgPiA3NjgpIHtcclxuXHRcdFx0cmFwcG9ydFNsaWRlcigwLCBydGwpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0cmFwcG9ydFNsaWRlcigwLCBydGwpO1xyXG5cdFx0fVxyXG5cclxuXHRcdCQod2luZG93KS5vbigncmVzaXplJywgZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRpZiAoJCh3aW5kb3cpLndpZHRoKCkgPiA3NjgpIHtcclxuXHRcdFx0XHRyYXBwb3J0U2xpZGVyKDAsIHJ0bCk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0cmFwcG9ydFNsaWRlcigwLCBydGwpO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiByYXBwb3J0U2xpZGVyKHN0YWdlUGFkZGluZywgcnRsKSB7XHJcbiAgICAgICAgdmFyIG93bCA9ICQoJy5jYXJkLS1yYXBwb3J0LXJpZ2h0Lm93bC1jYXJvdXNlbCcpLm93bENhcm91c2VsKHtcclxuICAgICAgICAgICAgc3RhZ2VQYWRkaW5nOiBzdGFnZVBhZGRpbmcsXHJcbiAgICAgICAgICAgIG1hcmdpbjogMCxcclxuICAgICAgICAgICAgZG90czogZmFsc2UsXHJcbiAgICAgICAgICAgIG5hdjogZmFsc2UsXHJcbiAgICAgICAgICAgIGxvb3A6IGZhbHNlLFxyXG4gICAgICAgICAgICBydGw6IHJ0bCxcclxuICAgICAgICAgICAgcmVzcG9uc2l2ZToge1xyXG4gICAgICAgICAgICAgICAgMDoge1xyXG4gICAgICAgICAgICAgICAgICAgIGl0ZW1zOiAxXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICQoJy5jYXJkLS1yYXBwb3J0LXJpZ2h0IC53cmFwcGVyX2J0biAubmV4dCcpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCkge1xyXG5cdFx0ICAgIG93bC50cmlnZ2VyKCduZXh0Lm93bC5jYXJvdXNlbCcpO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0Ly8gR28gdG8gdGhlIHByZXZpb3VzIGl0ZW1cclxuXHRcdCQoJy5jYXJkLS1yYXBwb3J0LXJpZ2h0IC53cmFwcGVyX2J0biAucHJldicpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCkge1xyXG5cdFx0ICAgIC8vIFdpdGggb3B0aW9uYWwgc3BlZWQgcGFyYW1ldGVyXHJcblx0XHQgICAgLy8gUGFyYW1ldGVycyBoYXMgdG8gYmUgaW4gc3F1YXJlIGJyYWNrZXQgJ1tdJ1xyXG5cdFx0ICAgIG93bC50cmlnZ2VyKCdwcmV2Lm93bC5jYXJvdXNlbCcpO1xyXG5cdFx0fSk7XHJcblxyXG4gICAgfVxyXG59IiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gKCkge1xyXG5cclxuXHRpZiAoJCgnLmNhcmQtc2xpZGVyLXdyYXBwZXInKS5sZW5ndGgpIHtcclxuXHJcblx0XHRpZiAoJCh3aW5kb3cpLndpZHRoKCkgPiA3NjgpIHtcclxuXHRcdFx0Y2FyZFNsaWRlclBhZ2UoMTYpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0Y2FyZFNsaWRlclBhZ2UoMCk7XHJcblx0XHR9XHJcblxyXG5cdFx0JCh3aW5kb3cpLm9uKCdyZXNpemUnLCBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdGlmICgkKHdpbmRvdykud2lkdGgoKSA+IDc2OCkge1xyXG5cdFx0XHRcdGNhcmRTbGlkZXJQYWdlKDE2KTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRjYXJkU2xpZGVyUGFnZSgwKTtcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBjYXJkU2xpZGVyUGFnZShzdGFnZVBhZGRpbmcpIHtcclxuICAgICAgICAkKCcuY2FyZC1zbGlkZXItd3JhcHBlci5vd2wtY2Fyb3VzZWwnKS5vd2xDYXJvdXNlbCh7XHJcbiAgICAgICAgICAgIHN0YWdlUGFkZGluZzogc3RhZ2VQYWRkaW5nLFxyXG4gICAgICAgICAgICBtYXJnaW46IDE2LFxyXG4gICAgICAgICAgICBkb3RzOiB0cnVlLFxyXG4gICAgICAgICAgICBuYXY6IHRydWUsXHJcbiAgICAgICAgICAgIHJlc3BvbnNpdmU6IHtcclxuICAgICAgICAgICAgICAgIDA6IHtcclxuICAgICAgICAgICAgICAgICAgICBpdGVtczogMVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIDc2ODoge1xyXG4gICAgICAgICAgICAgICAgXHRpdGVtczogMlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIDk5Mjoge1xyXG4gICAgICAgICAgICAgICAgICAgIGl0ZW1zOiA0XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQgRGF0ZUZpbHRlciBmcm9tICcuLi8uLi9jb21wb25lbnRzL2RhdGUtZmlsdGVyL2luZGV4LmpzJ1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gKCkge1xyXG4gIGxldCB0YWdGaWx0ZXJzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnI2NvbW11bmlxdWVzLWZpbHRlcnMgYScpXHJcbiAgbGV0IGNvbW11bmlxdWVzSG9sZGVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2NvbW11bmlxdWVzLWhvbGRlcicpXHJcbiAgbGV0IHN0YXJ0RGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zdGFydCcpXHJcbiAgbGV0IGVuZERhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuZW5kJylcclxuICBsZXQgYWxsRmlsdGVyQnRuID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2NvbW11bmlxdWVzLWZpbHRlci1hbGwnKVxyXG5cclxuICBpZiAodGFnRmlsdGVycy5sZW5ndGggPD0gMCB8fCAhY29tbXVuaXF1ZXNIb2xkZXIpIHJldHVyblxyXG5cclxuICBsZXQgc3RhdGUgPSB7XHJcbiAgICBmaWx0ZXJzOiBbXSxcclxuICAgIGRhdGVGaWx0ZXI6IHtcclxuICAgICAgZnJvbTogJycsXHJcbiAgICAgIHRvOiAnJ1xyXG4gICAgfSxcclxuICAgIG9yZGVyOiAnZGVzYycsXHJcbiAgICBtYXg6IDMsXHJcbiAgICBkYXRhOiBbXHJcbiAgICAgIHtcclxuICAgICAgICB0YWdzOiBbJ1JTRScsICdGSU5BTkNFJywgJ0VOVFJFUFJFTkFSSUFUJ10sXHJcbiAgICAgICAgZGF0ZTogJzIxLzA3LzIwMTcnLFxyXG4gICAgICAgIHRpdGxlOiAnTGUgR3JvdXBlIEJDUCBsYW5jZSBsYSBwciBlbWnDqHJlIGJhbnF1ZSBtYXJvY2FpbmUgZMOpZGnDqWUgw6AgbOKAmWFjdGl2aXTDqSDigJx0aXRyZXPigJ0nLFxyXG4gICAgICAgIHNpemU6IDQ1MCxcclxuICAgICAgICB0eXBlOiAncGRmJ1xyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgdGFnczogWydSU0UnXSxcclxuICAgICAgICB0aXRsZTogJ0xlIEdyb3VwZSBCQ1AgbGFuY2UgbGEgcHIgZW1pw6hyZSBiYW5xdWUgbWFyb2NhaW5lIGTDqWRpw6llIMOgIGzigJlhY3Rpdml0w6kg4oCcdGl0cmVz4oCdJyxcclxuICAgICAgICBkYXRlOiAnMjkvMDcvMjAxNycsXHJcbiAgICAgICAgc2l6ZTogNDUwLFxyXG4gICAgICAgIHR5cGU6ICdwZGYnXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB0YWdzOiBbJ1JTRScsICdFTlRSRVBSRU5BUklBVCddLFxyXG4gICAgICAgIGRhdGU6ICcyMi8wNy8yMDE3JyxcclxuICAgICAgICB0aXRsZTogJ0xlIEdyb3VwZSBCQ1AgbGFuY2UgbGEgcHJlbWnDqHJlIGJhbnF1ZSBtYXJvY2FpbmUgZMOpZGnDqWUgw6AgbOKAmWFjdGl2aXTDqSDigJx0aXRyZXPigJ0nLFxyXG4gICAgICAgIHNpemU6IDQ1MCxcclxuICAgICAgICB0eXBlOiAncGRmJ1xyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgdGFnczogWydSU0UnLCAnREVWRUxPUFBFTUVOVCBEVVJBQkxFJ10sXHJcbiAgICAgICAgZGF0ZTogJzIzLzA3LzIwMTcnLFxyXG4gICAgICAgIHRpdGxlOiAnTGUgR3JvdXBlIEJDUCBsYW5jZSBsYSBwcmVtacOocmUgYmFucXVlIG1hcm9jYWluZSBkw6lkacOpZSDDoCBs4oCZYWN0aXZpdMOpIOKAnHRpdHJlc+KAnScsXHJcbiAgICAgICAgc2l6ZTogNDUwLFxyXG4gICAgICAgIHR5cGU6ICdwZGYnXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB0YWdzOiBbJ1JTRSddLFxyXG4gICAgICAgIGRhdGU6ICcyMS8wNy8yMDE3JyxcclxuICAgICAgICB0aXRsZTogJ0xlIEdyb3VwZSBCQ1AgbGFuY2UgbGEgcHJlbWnDqHJlIGJhbnF1ZSBtYXJvY2FpbmUgZMOpZGnDqWUgw6AgbOKAmWFjdGl2aXTDqSDigJx0aXRyZXPigJ0nLFxyXG4gICAgICAgIHNpemU6IDQ1MCxcclxuICAgICAgICB0eXBlOiAncGRmJ1xyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgdGFnczogWydSU0UnLCAnRklOQU5DRSddLFxyXG4gICAgICAgIGRhdGU6ICcyNC8wNy8yMDE3JyxcclxuICAgICAgICB0aXRsZTogJ0xlIEdyb3VwZSBCQ1AgbGFuY2UgbGEgcHJlbWnDqHJlIGJhbnF1ZSBtYXJvY2FpbmUgZMOpZGnDqWUgw6AgbOKAmWFjdGl2aXTDqSDigJx0aXRyZXPigJ0nLFxyXG4gICAgICAgIHNpemU6IDQ1MCxcclxuICAgICAgICB0eXBlOiAncGRmJ1xyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgdGFnczogWydSU0UnLCAnRklOQU5DRSddLFxyXG4gICAgICAgIGRhdGU6ICcyNS8wNy8yMDE3JyxcclxuICAgICAgICB0aXRsZTogJ0xlIEdyb3VwZSBCQ1AgbGFuY2UgbGEgcHJlbWnDqHJlIGJhbnF1ZSBtYXJvY2FpbmUgZMOpZGnDqWUgw6AgbOKAmWFjdGl2aXTDqSDigJx0aXRyZXPigJ0nLFxyXG4gICAgICAgIHNpemU6IDQ1MCxcclxuICAgICAgICB0eXBlOiAncGRmJ1xyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgdGFnczogWydSU0UnXSxcclxuICAgICAgICBkYXRlOiAnMjYvMDcvMjAxNycsXHJcbiAgICAgICAgdGl0bGU6ICdMZSBHcm91cGUgQkNQIGxhbmNlIGxhIHByZW1pw6hyZSBiYW5xdWUgbWFyb2NhaW5lIGTDqWRpw6llIMOgIGzigJlhY3Rpdml0w6kg4oCcdGl0cmVz4oCdJyxcclxuICAgICAgICBzaXplOiA0NTAsXHJcbiAgICAgICAgdHlwZTogJ3BkZidcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHRhZ3M6IFsnUlNFJywgJ0ZJTkFOQ0UnXSxcclxuICAgICAgICBkYXRlOiAnMjEvMDcvMjAxNycsXHJcbiAgICAgICAgdGl0bGU6ICdMZSBHcm91cGUgQkNQIGxhbmNlIGxhIHByZW1pw6hyZSBiYW5xdWUgbWFyb2NhaW5lIGTDqWRpw6llIMOgIGzigJlhY3Rpdml0w6kg4oCcdGl0cmVz4oCdJyxcclxuICAgICAgICBzaXplOiA0NTAsXHJcbiAgICAgICAgdHlwZTogJ3BkZidcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHRhZ3M6IFsnUlNFJywgJ0ZJTkFOQ0UnXSxcclxuICAgICAgICBkYXRlOiAnMjEvMDgvMjAxNycsXHJcbiAgICAgICAgdGl0bGU6ICdMZSBHcm91cGUgQkNQIGxhbmNlIGxhIHByZW1pw6hyZSBiYW5xdWUgbWFyb2NhaW5lIGTDqWRpw6llIMOgIGzigJlhY3Rpdml0w6kg4oCcdGl0cmVz4oCdJyxcclxuICAgICAgICBzaXplOiA0NTAsXHJcbiAgICAgICAgdHlwZTogJ3BkZidcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHRhZ3M6IFsnUlNFJ10sXHJcbiAgICAgICAgZGF0ZTogJzIyLzA4LzIwMTYnLFxyXG4gICAgICAgIHRpdGxlOiAnTGUgR3JvdXBlIEJDUCBsYW5jZSBsYSBwcmVtacOocmUgYmFucXVlIG1hcm9jYWluZSBkw6lkacOpZSDDoCBs4oCZYWN0aXZpdMOpIOKAnHRpdHJlc+KAnScsXHJcbiAgICAgICAgc2l6ZTogNDUwLFxyXG4gICAgICAgIHR5cGU6ICdwZGYnXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB0YWdzOiBbJ1JTRScsICdGSU5BTkNFJ10sXHJcbiAgICAgICAgZGF0ZTogJzIxLzA5LzIwMTcnLFxyXG4gICAgICAgIHRpdGxlOiAnTGUgR3JvdXBlIEJDUCBsYW5jZSBsYSBwcmVtacOocmUgYmFucXVlIG1hcm9jYWluZSBkw6lkacOpZSDDoCBs4oCZYWN0aXZpdMOpIOKAnHRpdHJlc+KAnScsXHJcbiAgICAgICAgc2l6ZTogNDUwLFxyXG4gICAgICAgIHR5cGU6ICdwZGYnXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB0YWdzOiBbJ1JTRScsICdGSU5BTkNFJ10sXHJcbiAgICAgICAgZGF0ZTogJzIxLzEwLzIwMTcnLFxyXG4gICAgICAgIHRpdGxlOiAnTGUgR3JvdXBlIEJDUCBsYW5jZSBsYSBwcmVtacOocmUgYmFucXVlIG1hcm9jYWluZSBkw6lkacOpZSDDoCBs4oCZYWN0aXZpdMOpIOKAnHRpdHJlc+KAnScsXHJcbiAgICAgICAgc2l6ZTogNDUwLFxyXG4gICAgICAgIHR5cGU6ICdwZGYnXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB0YWdzOiBbJ1JTRScsICdGSU5BTkNFJ10sXHJcbiAgICAgICAgZGF0ZTogJzIxLzA3LzIwMTgnLFxyXG4gICAgICAgIHRpdGxlOiAnTGUgR3JvdXBlIEJDUCBsYW5jZSBsYSBwcmVtacOocmUgYmFucXVlIG1hcm9jYWluZSBkw6lkacOpZSDDoCBs4oCZYWN0aXZpdMOpIOKAnHRpdHJlc+KAnScsXHJcbiAgICAgICAgc2l6ZTogNDUwLFxyXG4gICAgICAgIHR5cGU6ICdwZGYnXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB0YWdzOiBbJ1JTRScsICdGSU5BTkNFJ10sXHJcbiAgICAgICAgZGF0ZTogJzIxLzA3LzIwMTgnLFxyXG4gICAgICAgIHRpdGxlOiAnTGUgR3JvdXBlIEJDUCBsYW5jZSBsYSBwcmVtacOocmUgYmFucXVlIG1hcm9jYWluZSBkw6lkacOpZSDDoCBs4oCZYWN0aXZpdMOpIOKAnHRpdHJlc+KAnScsXHJcbiAgICAgICAgc2l6ZTogNDUwLFxyXG4gICAgICAgIHR5cGU6ICdwZGYnXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB0YWdzOiBbJ1JTRScsICdGSU5BTkNFJ10sXHJcbiAgICAgICAgZGF0ZTogJzIxLzA3LzIwMTknLFxyXG4gICAgICAgIHRpdGxlOiAnTGUgR3JvdXBlIEJDUCBsYW5jZSBsYSBwcmVtacOocmUgYmFucXVlIG1hcm9jYWluZSBkw6lkacOpZSDDoCBs4oCZYWN0aXZpdMOpIOKAnHRpdHJlc+KAnScsXHJcbiAgICAgICAgc2l6ZTogNDUwLFxyXG4gICAgICAgIHR5cGU6ICdwZGYnXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB0YWdzOiBbJ1JTRScsICdGSU5BTkNFJ10sXHJcbiAgICAgICAgZGF0ZTogJzIxLzA3LzIwMjAnLFxyXG4gICAgICAgIHRpdGxlOiAnTGUgR3JvdXBlIEJDUCBsYW5jZSBsYSBwcmVtacOocmUgYmFucXVlIG1hcm9jYWluZSBkw6lkacOpZSDDoCBs4oCZYWN0aXZpdMOpIOKAnHRpdHJlc+KAnScsXHJcbiAgICAgICAgc2l6ZTogNDUwLFxyXG4gICAgICAgIHR5cGU6ICdwZGYnXHJcbiAgICAgIH1cclxuICAgIF1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGNsZWFuVGFnICh0YWdGaWx0ZXIpIHtcclxuICAgIHRhZ0ZpbHRlciA9IHRhZ0ZpbHRlci50b0xvd2VyQ2FzZSgpXHJcbiAgICBpZiAodGFnRmlsdGVyWzBdID09ICcjJykge1xyXG4gICAgICB0YWdGaWx0ZXIgPSB0YWdGaWx0ZXIuc2xpY2UoMSlcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGFnRmlsdGVyXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBtYWtlRGF0ZU9iamVjdCAoZGF0ZVN0cmluZykge1xyXG4gICAgbGV0IFtkYXksIG1vbnRoLCB5ZWFyXSA9IGRhdGVTdHJpbmcuc3BsaXQoJy8nKVxyXG5cclxuICAgIHJldHVybiBuZXcgRGF0ZSh5ZWFyLCBtb250aCAtIDEsIGRheSlcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGFwcGx5RmlsdGVycyAoKSB7XHJcbiAgICBsZXQgZGF0YSA9IHN0YXRlLmRhdGFcclxuICAgIGlmIChzdGF0ZS5maWx0ZXJzLmxlbmd0aCA+IDApIHtcclxuICAgICAgZGF0YSA9IGRhdGEuZmlsdGVyKHBvc3QgPT4ge1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3RhdGUuZmlsdGVycy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgaWYgKHBvc3QudGFncy5pbmNsdWRlcyhzdGF0ZS5maWx0ZXJzW2ldLnRvVXBwZXJDYXNlKCkpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgICB9KVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChzdGF0ZS5kYXRlRmlsdGVyLmZyb20gJiYgc3RhdGUuZGF0ZUZpbHRlci50bykge1xyXG4gICAgICBkYXRhID0gZGF0YS5maWx0ZXIocG9zdCA9PiB7XHJcbiAgICAgICAgaWYgKFxyXG4gICAgICAgICAgbWFrZURhdGVPYmplY3QocG9zdC5kYXRlKSAtIG1ha2VEYXRlT2JqZWN0KHN0YXRlLmRhdGVGaWx0ZXIuZnJvbSkgPj1cclxuICAgICAgICAgICAgMCAmJlxyXG4gICAgICAgICAgbWFrZURhdGVPYmplY3QocG9zdC5kYXRlKSAtIG1ha2VEYXRlT2JqZWN0KHN0YXRlLmRhdGVGaWx0ZXIudG8pIDw9IDBcclxuICAgICAgICApIHtcclxuICAgICAgICAgIHJldHVybiB0cnVlXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZmFsc2VcclxuICAgICAgfSlcclxuICAgIH1cclxuXHJcbiAgICBkYXRhID0gZGF0YS5zb3J0KChhLCBiKSA9PiB7XHJcbiAgICAgIHJldHVybiBzdGF0ZS5vcmRlciA9PSAnZGVzYydcclxuICAgICAgICA/IG1ha2VEYXRlT2JqZWN0KGIuZGF0ZSkgLSBtYWtlRGF0ZU9iamVjdChhLmRhdGUpXHJcbiAgICAgICAgOiBtYWtlRGF0ZU9iamVjdChhLmRhdGUpIC0gbWFrZURhdGVPYmplY3QoYi5kYXRlKVxyXG4gICAgfSlcclxuXHJcbiAgICBzaG93U2VsZWN0ZWQoZGF0YSlcclxuICB9XHJcbiAgZnVuY3Rpb24gY2hhbmdlRmlsdGVycyAoZSkge1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcblxyXG4gICAgdGhpcy5jbGFzc0xpc3QudG9nZ2xlKCdhY3RpdmUnKVxyXG5cclxuICAgIHN0YXRlLmZpbHRlcnMgPSBbXVxyXG5cclxuICAgIHRhZ0ZpbHRlcnMuZm9yRWFjaChmdW5jdGlvbiAodGFnKSB7XHJcbiAgICAgIGlmICgkKHRhZykuaGFzQ2xhc3MoJ2FjdGl2ZScpKSB7XHJcbiAgICAgICAgc3RhdGUuZmlsdGVycy5wdXNoKGNsZWFuVGFnKHRhZy5pbm5lclRleHQpKVxyXG4gICAgICB9XHJcbiAgICB9KVxyXG5cclxuICAgIGlmIChzdGF0ZS5maWx0ZXJzLmxlbmd0aCA+IDApIHtcclxuICAgICAgYWxsRmlsdGVyQnRuLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBhbGxGaWx0ZXJCdG4uY2xhc3NMaXN0LmFkZCgnYWN0aXZlJylcclxuICAgIH1cclxuXHJcbiAgICBhcHBseUZpbHRlcnMoKVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gc2hvd1NlbGVjdGVkIChkYXRhKSB7XHJcbiAgICBsZXQgc2VsZWN0ZWREYXRhID0gZGF0YS5zbGljZSgwLCBzdGF0ZS5tYXggKiAzKVxyXG5cclxuICAgIGNvbnNvbGUubG9nKGRhdGEubGVuZ3RoKVxyXG4gICAgY29uc29sZS5sb2coc2VsZWN0ZWREYXRhLmxlbmd0aClcclxuXHJcbiAgICBpZiAoc2VsZWN0ZWREYXRhLmxlbmd0aCA+PSBkYXRhLmxlbmd0aCkge1xyXG4gICAgICAkKCcjbW9yZS1jb21tdW5pcXVlcycpLmhpZGUoKVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgJCgnI21vcmUtY29tbXVuaXF1ZXMnKS5zaG93KClcclxuICAgIH1cclxuXHJcbiAgICByZW5kZXIoc2VsZWN0ZWREYXRhKVxyXG4gIH1cclxuXHJcbiAgYXBwbHlGaWx0ZXJzKClcclxuXHJcbiAgJCgnI21vcmUtY29tbXVuaXF1ZXMnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICBzdGF0ZS5tYXgrK1xyXG4gICAgYXBwbHlGaWx0ZXJzKClcclxuXHJcbiAgICB0aGlzLnNjcm9sbEludG9WaWV3KHtcclxuICAgICAgYmVoYXZpb3I6ICdzbW9vdGgnLFxyXG4gICAgICBpbmxpbmU6ICdlbmQnXHJcbiAgICB9KVxyXG4gICAgaWYgKHN0YXRlLm1heCArIDEgPiBzdGF0ZS5kYXRhLmxlbmd0aCAvIDMpICQodGhpcykuaGlkZSgpXHJcbiAgfSlcclxuXHJcbiAgZnVuY3Rpb24gcmVuZGVyIChkYXRhKSB7XHJcbiAgICBjb21tdW5pcXVlc0hvbGRlci5pbm5lckhUTUwgPSBkYXRhXHJcbiAgICAgIC5tYXAocG9zdCA9PiB7XHJcbiAgICAgICAgcmV0dXJuIGA8YSBjbGFzcz1cIm5ld3MgbmV3cy0tY29tbXVuaXF1ZXNcIiBocmVmPVwiI1wiPlxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJuZXdzX2JvcmRlclwiPlxyXG4gICAgICAgICAgPHN2ZyBjbGFzcz1cImljb24tcGRmXCI+XHJcbiAgICAgICAgICAgIDx1c2UgeGxpbms6aHJlZj1cIiNpY29uLXBkZlwiPjwvdXNlPlxyXG4gICAgICAgICAgPC9zdmc+XHJcbiAgICAgICAgICA8cD5cclxuICAgICAgICAgICAgVMOpbMOpY2hhcmdlclxyXG4gICAgICAgICAgPC9wPlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJuZXdzX2NvbnRlbnRcIj5cclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJuZXdzX2RhdGUgY2xlYXJmaXhcIj5cclxuICAgICAgICAgICAgPHAgY2xhc3M9XCJwdWJsaWNhdGlvblwiPlxyXG4gICAgICAgICAgICAgICR7cG9zdC5kYXRlfVxyXG4gICAgICAgICAgICA8L3A+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIDxoMiBjbGFzcz1cIm5ld3NfdGl0bGVcIj5cclxuICAgICAgICAgICAgJHtwb3N0LnRpdGxlfVxyXG4gICAgICAgICAgPC9oMj5cclxuICAgICAgICAgIDxwIGNsYXNzPVwibmV3c190eHRcIj5cclxuICAgICAgICAgICAgLiR7cG9zdC50eXBlfSAtICR7cG9zdC5zaXplfSBLQlxyXG4gICAgICAgICAgPC9wPlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICA8L2E+YFxyXG4gICAgICB9KVxyXG4gICAgICAuam9pbignJylcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGRhdGVGb3JtYXQgKGRhdGUpIHtcclxuICAgIHJldHVybiBgMS8ke2RhdGUubW9udGgoKSArIDF9LyR7ZGF0ZS55ZWFyKCl9YFxyXG4gIH1cclxuXHJcbiAgbGV0IHN0YXJ0RmlsdGVyID0gbmV3IERhdGVGaWx0ZXIoc3RhcnREYXRlLCBmYWxzZSwgZnVuY3Rpb24gKHN0YXJ0KSB7XHJcbiAgICBzdGF0ZS5kYXRlRmlsdGVyLmZyb20gPSBkYXRlRm9ybWF0KHN0YXJ0KVxyXG4gICAgYXBwbHlGaWx0ZXJzKClcclxuICB9KVxyXG4gIHN0YXJ0RmlsdGVyLmluaXQoKVxyXG5cclxuICBsZXQgZW5kRmlsdGVyID0gbmV3IERhdGVGaWx0ZXIoZW5kRGF0ZSwgdHJ1ZSwgZnVuY3Rpb24gKGVuZCkge1xyXG4gICAgc3RhdGUuZGF0ZUZpbHRlci50byA9IGRhdGVGb3JtYXQoZW5kKVxyXG4gICAgYXBwbHlGaWx0ZXJzKClcclxuICB9KVxyXG4gIGVuZEZpbHRlci5pbml0KClcclxuXHJcbiAgJCgnI2NvbW11bmlxdWVzLXNlbGVjdC1maWx0ZXInKS5vbignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xyXG4gICAgbGV0IHNlbGVjdGVkID0gJCgnI2NvbW11bmlxdWVzLXNlbGVjdC1maWx0ZXInKVxyXG4gICAgICAubmV4dCgpXHJcbiAgICAgIC5maW5kKCcuY3VycmVudCcpXHJcbiAgICAgIC50ZXh0KClcclxuICAgIHNlbGVjdGVkID0gc2VsZWN0ZWQudG9Mb3dlckNhc2UoKVxyXG5cclxuICAgIC8vIGNvbnNvbGUubG9nKHNlbGVjdGVkKVxyXG5cclxuICAgICQoJyNkYXRlLWZpbHRlcicpLmFkZENsYXNzKCdkLWZsZXgnKVxyXG4gICAgJCgnI2RhdGUtZmlsdGVyJykuc2hvdygpXHJcblxyXG4gICAgaWYgKHNlbGVjdGVkICE9PSAncMOpcmlvZGUnKSB7XHJcbiAgICAgICQoJyNkYXRlLWZpbHRlcicpLnJlbW92ZUNsYXNzKCdkLWZsZXgnKVxyXG4gICAgICAkKCcjZGF0ZS1maWx0ZXInKS5oaWRlKClcclxuICAgICAgc3RhdGUub3JkZXIgPSAnZGVzYydcclxuICAgICAgc3RhdGUuZGF0ZUZpbHRlci5mcm9tID0gJydcclxuICAgICAgc3RhdGUuZGF0ZUZpbHRlci50byA9ICcnXHJcbiAgICAgIHN0YXJ0RmlsdGVyLmNsZWFyKClcclxuICAgICAgZW5kRmlsdGVyLmNsZWFyKClcclxuICAgIH1cclxuXHJcbiAgICBpZiAoc2VsZWN0ZWQgPT09ICdwbHVzIGFuY2llbnMnKSB7XHJcbiAgICAgIHN0YXRlLm9yZGVyID0gJ2FzYydcclxuICAgICAgYXBwbHlGaWx0ZXJzKClcclxuICAgIH0gZWxzZSBpZiAoc2VsZWN0ZWQgPT09ICdwbHVzIHLDqWNlbnRzJykge1xyXG4gICAgICBhcHBseUZpbHRlcnMoKVxyXG4gICAgICBzdGF0ZS5vcmRlciA9ICdkZXNjJ1xyXG4gICAgfVxyXG4gIH0pXHJcblxyXG4gIGFsbEZpbHRlckJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgIHN0YXRlLmZpbHRlcnMgPSBbXVxyXG4gICAgdGFnRmlsdGVycy5mb3JFYWNoKHRhZyA9PiB7XHJcbiAgICAgIHRhZy5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKVxyXG4gICAgfSlcclxuICAgIHRoaXMuY2xhc3NMaXN0LmFkZCgnYWN0aXZlJylcclxuICAgIGFwcGx5RmlsdGVycygpXHJcbiAgfSlcclxuICB0YWdGaWx0ZXJzLmZvckVhY2godGFnID0+IHtcclxuICAgIHRhZy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGNoYW5nZUZpbHRlcnMpXHJcbiAgfSlcclxufVxyXG4iLCJpbXBvcnQgbW9tZW50IGZyb20gJ21vbWVudCdcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIChwYXJlbnQsIGVtcHR5LCBjYWxsYmFjaykge1xyXG4gIGxldCBjdXJyZW50RGF0ZSA9IG1vbWVudCgpXHJcblxyXG4gIGxldCBpbmNEYXRlID0gcGFyZW50LnF1ZXJ5U2VsZWN0b3IoJy5pbmNyZW1lbnQtZGF0ZScpXHJcbiAgbGV0IGRlY0RhdGUgPSBwYXJlbnQucXVlcnlTZWxlY3RvcignLmRlY3JlbWVudC1kYXRlJylcclxuICBsZXQgbW9udGhzSW5wdXQgPSBwYXJlbnQucXVlcnlTZWxlY3RvcignLmRhdGUtZmlsdGVyX21vbnRoIGlucHV0JylcclxuICBsZXQgeWVhcnNJbnB1dCA9IHBhcmVudC5xdWVyeVNlbGVjdG9yKCcuZGF0ZS1maWx0ZXJfeWVhciBpbnB1dCcpXHJcblxyXG4gIGZ1bmN0aW9uIHVwZGF0ZURhdGUgKCkge1xyXG4gICAgbGV0IGN1cnJlbnRNb250aCA9IGN1cnJlbnREYXRlLm1vbnRoKCkgKyAxXHJcbiAgICBsZXQgY3VycmVudFllYXIgPSBjdXJyZW50RGF0ZS55ZWFyKCkudG9TdHJpbmcoKVxyXG4gICAgbW9udGhzSW5wdXQudmFsdWUgPSBjdXJyZW50TW9udGhcclxuICAgIHllYXJzSW5wdXQudmFsdWUgPSBjdXJyZW50WWVhclxyXG4gICAgY2FsbGJhY2soY3VycmVudERhdGUpXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBiaW5kRXZlbnRzICgpIHtcclxuICAgIGluY0RhdGUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgY3VycmVudERhdGUgPSBtb21lbnQoY3VycmVudERhdGUpLmFkZCgxLCAnbW9udGhzJylcclxuICAgICAgdXBkYXRlRGF0ZSgpXHJcbiAgICB9KVxyXG4gICAgZGVjRGF0ZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgICBjdXJyZW50RGF0ZSA9IG1vbWVudChjdXJyZW50RGF0ZSkuc3VidHJhY3QoMSwgJ21vbnRocycpXHJcbiAgICAgIHVwZGF0ZURhdGUoKVxyXG4gICAgfSlcclxuICAgIG1vbnRoc0lucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgZnVuY3Rpb24gKCkge1xyXG4gICAgICBpZiAocGFyc2VJbnQodGhpcy52YWx1ZSkgPiAwICYmIHBhcnNlSW50KHRoaXMudmFsdWUpIDw9IDMxKSB7XHJcbiAgICAgICAgY3VycmVudERhdGUubW9udGgodGhpcy52YWx1ZSAtIDEpXHJcbiAgICAgICAgdXBkYXRlRGF0ZSgpXHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgICB5ZWFyc0lucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgZnVuY3Rpb24gKCkge1xyXG4gICAgICBpZiAocGFyc2VJbnQodGhpcy52YWx1ZSkgPiAwKSB7XHJcbiAgICAgICAgY3VycmVudERhdGUueWVhcih0aGlzLnZhbHVlKVxyXG4gICAgICAgIHVwZGF0ZURhdGUoKVxyXG4gICAgICB9XHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgdGhpcy5jbGVhciA9IGZ1bmN0aW9uICgpIHtcclxuICAgIG1vbnRoc0lucHV0LnZhbHVlID0geWVhcnNJbnB1dC52YWx1ZSA9ICcnXHJcbiAgfVxyXG5cclxuICB0aGlzLmluaXQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICBiaW5kRXZlbnRzKClcclxuICAgIGlmICghZW1wdHkpIHVwZGF0ZURhdGUoKVxyXG4gIH1cclxuXHJcbiAgdGhpcy5zZWxlY3RlZERhdGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICByZXR1cm4gY3VycmVudERhdGVcclxuICB9XHJcbn1cclxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gKCkge1xyXG5cdGlmICgkKCcuZGF0ZS1zbGlkZXInKS5sZW5ndGgpIHtcclxuXHJcblx0XHRpZiAoJCh3aW5kb3cpLndpZHRoKCkgPiA3NjgpIHtcclxuXHRcdFx0ZGF0ZVNsaWRlclBhZ2UoMCk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRkYXRlU2xpZGVyUGFnZSgwKTtcclxuXHRcdH1cclxuXHJcblx0XHQkKHdpbmRvdykub24oJ3Jlc2l6ZScsIGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0aWYgKCQod2luZG93KS53aWR0aCgpID4gNzY4KSB7XHJcblx0XHRcdFx0ZGF0ZVNsaWRlclBhZ2UoMCk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0ZGF0ZVNsaWRlclBhZ2UoMCk7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGRhdGVTbGlkZXJQYWdlKHN0YWdlUGFkZGluZykge1xyXG4gICAgICAgICQoJy5kYXRlLXNsaWRlci5vd2wtY2Fyb3VzZWwnKS5vd2xDYXJvdXNlbCh7XHJcbiAgICAgICAgICAgIHN0YWdlUGFkZGluZzogc3RhZ2VQYWRkaW5nLFxyXG4gICAgICAgICAgICBtYXJnaW46IDUsXHJcbiAgICAgICAgICAgIGRvdHM6IHRydWUsXHJcbiAgICAgICAgICAgIG5hdjogdHJ1ZSxcclxuICAgICAgICAgICAgcmVzcG9uc2l2ZToge1xyXG4gICAgICAgICAgICAgICAgMDoge1xyXG4gICAgICAgICAgICAgICAgICAgIGl0ZW1zOiA0XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgNzY4OiB7XHJcbiAgICAgICAgICAgICAgICBcdGl0ZW1zOiAxMFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIDk5Mjoge1xyXG4gICAgICAgICAgICAgICAgICAgIGl0ZW1zOiAxNVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59IiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gKCkge1xyXG4gIGxldCB0YWdGaWx0ZXJzLFxyXG4gICAgZmluYW5jZXNEYXRlcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNmaW5hbmNlLWRhdGVzJyksXHJcbiAgICBmaW5hbmNlUG9zdHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjZmluYW5jZS1wb3N0cycpXHJcblxyXG4gIGlmICghZmluYW5jZVBvc3RzKSByZXR1cm5cclxuXHJcbiAgbGV0IHN0YXRlID0ge1xyXG4gICAgZmlsdGVyOiAnMjAxOCcsXHJcbiAgICBkYXRhOiBbXHJcbiAgICAgIHtcclxuICAgICAgICBkYXRlOiAnMjIvMTIvMjAxNycsXHJcbiAgICAgICAgaW1nOiAnYXNzZXRzL2ltZy9maW5hbmNlLnBuZycsXHJcbiAgICAgICAgdGl0bGU6IHtcclxuICAgICAgICAgIGZpcnN0OiAnUsOpc3VsdGF0cycsXHJcbiAgICAgICAgICBsYXN0OiAnRmluYW5jaWVycydcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBkYXRlOiAnMjIvMTIvMjAxOCcsXHJcbiAgICAgICAgaW1nOiAnYXNzZXRzL2ltZy9maW5hbmNlLnBuZycsXHJcbiAgICAgICAgdGl0bGU6IHtcclxuICAgICAgICAgIGZpcnN0OiAnUsOpc3VsdGF0cycsXHJcbiAgICAgICAgICBsYXN0OiAnRmluYW5jaWVycydcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBkYXRlOiAnMjIvMTIvMjAxNicsXHJcbiAgICAgICAgaW1nOiAnYXNzZXRzL2ltZy9maW5hbmNlLnBuZycsXHJcbiAgICAgICAgdGl0bGU6IHtcclxuICAgICAgICAgIGZpcnN0OiAnUsOpc3VsdGF0cycsXHJcbiAgICAgICAgICBsYXN0OiAnRmluYW5jaWVycydcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBkYXRlOiAnMjIvMTIvMTk5NCcsXHJcbiAgICAgICAgaW1nOiAnYXNzZXRzL2ltZy9maW5hbmNlLnBuZycsXHJcbiAgICAgICAgdGl0bGU6IHtcclxuICAgICAgICAgIGZpcnN0OiAnUsOpc3VsdGF0cycsXHJcbiAgICAgICAgICBsYXN0OiAnRmluYW5jaWVycydcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBkYXRlOiAnMjIvMTIvMjAxMicsXHJcbiAgICAgICAgaW1nOiAnYXNzZXRzL2ltZy9maW5hbmNlLnBuZycsXHJcbiAgICAgICAgdGl0bGU6IHtcclxuICAgICAgICAgIGZpcnN0OiAnUsOpc3VsdGF0cycsXHJcbiAgICAgICAgICBsYXN0OiAnRmluYW5jaWVycydcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBkYXRlOiAnMjIvMTIvMjAxOCcsXHJcbiAgICAgICAgaW1nOiAnYXNzZXRzL2ltZy9maW5hbmNlLnBuZycsXHJcbiAgICAgICAgdGl0bGU6IHtcclxuICAgICAgICAgIGZpcnN0OiAnUsOpc3VsdGF0cycsXHJcbiAgICAgICAgICBsYXN0OiAnRmluYW5jaWVycydcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBkYXRlOiAnMjIvMTIvMTk5NicsXHJcbiAgICAgICAgaW1nOiAnYXNzZXRzL2ltZy9maW5hbmNlLnBuZycsXHJcbiAgICAgICAgdGl0bGU6IHtcclxuICAgICAgICAgIGZpcnN0OiAnUsOpc3VsdGF0cycsXHJcbiAgICAgICAgICBsYXN0OiAnRmluYW5jaWVycydcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBkYXRlOiAnMjIvMTIvMTk5MScsXHJcbiAgICAgICAgaW1nOiAnYXNzZXRzL2ltZy9maW5hbmNlLnBuZycsXHJcbiAgICAgICAgdGl0bGU6IHtcclxuICAgICAgICAgIGZpcnN0OiAnUsOpc3VsdGF0cycsXHJcbiAgICAgICAgICBsYXN0OiAnRmluYW5jaWVycydcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBkYXRlOiAnMjIvMTIvMjAwMCcsXHJcbiAgICAgICAgaW1nOiAnYXNzZXRzL2ltZy9maW5hbmNlLnBuZycsXHJcbiAgICAgICAgdGl0bGU6IHtcclxuICAgICAgICAgIGZpcnN0OiAnUsOpc3VsdGF0cycsXHJcbiAgICAgICAgICBsYXN0OiAnRmluYW5jaWVycydcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBkYXRlOiAnMjIvMTIvMjAxNScsXHJcbiAgICAgICAgaW1nOiAnYXNzZXRzL2ltZy9maW5hbmNlLnBuZycsXHJcbiAgICAgICAgdGl0bGU6IHtcclxuICAgICAgICAgIGZpcnN0OiAnUsOpc3VsdGF0cycsXHJcbiAgICAgICAgICBsYXN0OiAnRmluYW5jaWVycydcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBkYXRlOiAnMjIvMTIvMjAxNCcsXHJcbiAgICAgICAgaW1nOiAnYXNzZXRzL2ltZy9maW5hbmNlLnBuZycsXHJcbiAgICAgICAgdGl0bGU6IHtcclxuICAgICAgICAgIGZpcnN0OiAnUsOpc3VsdGF0cycsXHJcbiAgICAgICAgICBsYXN0OiAnRmluYW5jaWVycydcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBkYXRlOiAnMjIvMTIvMjAxMycsXHJcbiAgICAgICAgaW1nOiAnYXNzZXRzL2ltZy9maW5hbmNlLnBuZycsXHJcbiAgICAgICAgdGl0bGU6IHtcclxuICAgICAgICAgIGZpcnN0OiAnUsOpc3VsdGF0cycsXHJcbiAgICAgICAgICBsYXN0OiAnRmluYW5jaWVycydcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBkYXRlOiAnMjIvMTIvMjAxMCcsXHJcbiAgICAgICAgaW1nOiAnYXNzZXRzL2ltZy9maW5hbmNlLnBuZycsXHJcbiAgICAgICAgdGl0bGU6IHtcclxuICAgICAgICAgIGZpcnN0OiAnUsOpc3VsdGF0cycsXHJcbiAgICAgICAgICBsYXN0OiAnRmluYW5jaWVycydcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBkYXRlOiAnMjIvMTIvMjAxOCcsXHJcbiAgICAgICAgaW1nOiAnYXNzZXRzL2ltZy9maW5hbmNlLnBuZycsXHJcbiAgICAgICAgdGl0bGU6IHtcclxuICAgICAgICAgIGZpcnN0OiAnUsOpc3VsdGF0cycsXHJcbiAgICAgICAgICBsYXN0OiAnRmluYW5jaWVycydcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBkYXRlOiAnMjIvMTIvMjAxOCcsXHJcbiAgICAgICAgaW1nOiAnYXNzZXRzL2ltZy9maW5hbmNlLnBuZycsXHJcbiAgICAgICAgdGl0bGU6IHtcclxuICAgICAgICAgIGZpcnN0OiAnUsOpc3VsdGF0cycsXHJcbiAgICAgICAgICBsYXN0OiAnRmluYW5jaWVycydcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBkYXRlOiAnMjIvMTIvMjAxNycsXHJcbiAgICAgICAgaW1nOiAnYXNzZXRzL2ltZy9maW5hbmNlLnBuZycsXHJcbiAgICAgICAgdGl0bGU6IHtcclxuICAgICAgICAgIGZpcnN0OiAnUsOpc3VsdGF0cycsXHJcbiAgICAgICAgICBsYXN0OiAnRmluYW5jaWVycydcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBkYXRlOiAnMjIvMTIvMjAxOCcsXHJcbiAgICAgICAgaW1nOiAnYXNzZXRzL2ltZy9maW5hbmNlLnBuZycsXHJcbiAgICAgICAgdGl0bGU6IHtcclxuICAgICAgICAgIGZpcnN0OiAnUsOpc3VsdGF0cycsXHJcbiAgICAgICAgICBsYXN0OiAnRmluYW5jaWVycydcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBkYXRlOiAnMjIvMTIvMjAxOCcsXHJcbiAgICAgICAgaW1nOiAnYXNzZXRzL2ltZy9maW5hbmNlLnBuZycsXHJcbiAgICAgICAgdGl0bGU6IHtcclxuICAgICAgICAgIGZpcnN0OiAnUsOpc3VsdGF0cycsXHJcbiAgICAgICAgICBsYXN0OiAnRmluYW5jaWVycydcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBkYXRlOiAnMjIvMTIvMjAwMScsXHJcbiAgICAgICAgaW1nOiAnYXNzZXRzL2ltZy9maW5hbmNlLnBuZycsXHJcbiAgICAgICAgdGl0bGU6IHtcclxuICAgICAgICAgIGZpcnN0OiAnUsOpc3VsdGF0cycsXHJcbiAgICAgICAgICBsYXN0OiAnRmluYW5jaWVycydcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBkYXRlOiAnMjIvMTIvMjAwMycsXHJcbiAgICAgICAgaW1nOiAnYXNzZXRzL2ltZy9maW5hbmNlLnBuZycsXHJcbiAgICAgICAgdGl0bGU6IHtcclxuICAgICAgICAgIGZpcnN0OiAnUsOpc3VsdGF0cycsXHJcbiAgICAgICAgICBsYXN0OiAnRmluYW5jaWVycydcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBkYXRlOiAnMjIvMTIvMjAwNScsXHJcbiAgICAgICAgaW1nOiAnYXNzZXRzL2ltZy9maW5hbmNlLnBuZycsXHJcbiAgICAgICAgdGl0bGU6IHtcclxuICAgICAgICAgIGZpcnN0OiAnUsOpc3VsdGF0cycsXHJcbiAgICAgICAgICBsYXN0OiAnRmluYW5jaWVycydcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBkYXRlOiAnMjIvMTIvMjAwMicsXHJcbiAgICAgICAgaW1nOiAnYXNzZXRzL2ltZy9maW5hbmNlLnBuZycsXHJcbiAgICAgICAgdGl0bGU6IHtcclxuICAgICAgICAgIGZpcnN0OiAnUsOpc3VsdGF0cycsXHJcbiAgICAgICAgICBsYXN0OiAnRmluYW5jaWVycydcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBkYXRlOiAnMjIvMTIvMTk5OScsXHJcbiAgICAgICAgaW1nOiAnYXNzZXRzL2ltZy9maW5hbmNlLnBuZycsXHJcbiAgICAgICAgdGl0bGU6IHtcclxuICAgICAgICAgIGZpcnN0OiAnUsOpc3VsdGF0cycsXHJcbiAgICAgICAgICBsYXN0OiAnRmluYW5jaWVycydcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBkYXRlOiAnMjIvMTIvMTk4NScsXHJcbiAgICAgICAgaW1nOiAnYXNzZXRzL2ltZy9maW5hbmNlLnBuZycsXHJcbiAgICAgICAgdGl0bGU6IHtcclxuICAgICAgICAgIGZpcnN0OiAnUsOpc3VsdGF0cycsXHJcbiAgICAgICAgICBsYXN0OiAnRmluYW5jaWVycydcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIF1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGFwcGx5RmlsdGVycyAoKSB7XHJcbiAgICBsZXQgZGF0YSA9IHN0YXRlLmRhdGFcclxuICAgIGlmIChzdGF0ZS5maWx0ZXIpIHtcclxuICAgICAgZGF0YSA9IGRhdGEuZmlsdGVyKHBvc3QgPT4ge1xyXG4gICAgICAgIGlmIChzdGF0ZS5maWx0ZXIudHJpbSgpID09PSBwb3N0LmRhdGUuc3BsaXQoJy8nKVsyXSkge1xyXG4gICAgICAgICAgcmV0dXJuIHRydWVcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICAgIH0pXHJcbiAgICB9XHJcblxyXG4gICAgcmVuZGVyKGRhdGEpXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBjaGFuZ2VGaWx0ZXIgKGUpIHtcclxuICAgIGUucHJldmVudERlZmF1bHQoKVxyXG5cclxuICAgIHRhZ0ZpbHRlcnMuZm9yRWFjaChmdW5jdGlvbiAodGFnKSB7XHJcbiAgICAgIHRhZy5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKVxyXG4gICAgfSlcclxuXHJcbiAgICB0aGlzLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpXHJcblxyXG4gICAgc3RhdGUuZmlsdGVyID0gdGhpcy5pbm5lclRleHRcclxuXHJcbiAgICAvLyBjb25zb2xlLmxvZyhzdGF0ZS5maWx0ZXJzKVxyXG4gICAgYXBwbHlGaWx0ZXJzKClcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGJpbmRFdmVudHMgKCkge1xyXG4gICAgJCgnLmZpbmFuY2UnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHZhciBjdXJyZW50SXRlbSA9ICQodGhpcylcclxuICAgICAgY29uc29sZS5sb2coJ2NsaWNrZWQnKVxyXG4gICAgICAkKCcuZmluYW5jZScpLmVhY2goZnVuY3Rpb24gKGluZGV4LCBlbCkge1xyXG4gICAgICAgIGlmICgkKGVsKVswXSAhPT0gY3VycmVudEl0ZW1bMF0pIHtcclxuICAgICAgICAgICQoZWwpLnJlbW92ZUNsYXNzKCdvcGVuJylcclxuICAgICAgICB9XHJcbiAgICAgIH0pXHJcblxyXG4gICAgICAkKHRoaXMpLnRvZ2dsZUNsYXNzKCdvcGVuJylcclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiByZW5kZXIgKGRhdGEpIHtcclxuICAgIGZpbmFuY2VQb3N0cy5pbm5lckhUTUwgPSBkYXRhXHJcbiAgICAgIC5tYXAoKHBvc3QsIGluZGV4KSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIGBcclxuICAgICAgICAke2luZGV4ID09IDAgJiYgZGF0YS5sZW5ndGggPiAxID8gJzxkaXYgY2xhc3M9XCJjb2wtMTIgY29sLWxnLTggbWItbGctMyBtYi0yXCI+PGRpdiBjbGFzcz1cImZpbmFuY2UgZmluYW5jZS0tbGcgY2xlYXJmaXhcIj4nIDogJzxkaXYgY2xhc3M9XCJjb2wtMTIgY29sLWxnLTQgbWItbGctMyBtYi0yXCI+PGRpdiBjbGFzcz1cImZpbmFuY2UgY2xlYXJmaXhcIj4nfVxyXG4gICAgICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgICAgIDxpbWcgc3JjPVwiYXNzZXRzL2ltZy9maW5hbmNlLnBuZ1wiIGFsdD1cIlwiPlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZpbmFuY2VfdGl0bGVcIj5cclxuICAgICAgICAgICAgICA8aDMgY2xhc3M9XCJmaXJzdFwiPlxyXG4gICAgICAgICAgICAgICAgJHtwb3N0LnRpdGxlLmZpcnN0fVxyXG4gICAgICAgICAgICAgICAgPC9oMz5cclxuICAgICAgICAgICAgICAgIDxoMyBjbGFzcz1cImxhc3RcIj5cclxuICAgICAgICAgICAgICAgICR7cG9zdC50aXRsZS5sYXN0fVxyXG4gICAgICAgICAgICAgICAgPC9oMz5cclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgPHAgY2xhc3M9XCJmaW5hbmNlX2RhdGVcIj5cclxuICAgICAgICAgICAgICAgICR7cG9zdC5kYXRlfVxyXG4gICAgICAgICAgICAgIDwvcD5cclxuXHJcbiAgICAgICAgICAgICAgPHAgY2xhc3M9XCJkb3dubG9hZFwiPlxyXG4gICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzPVwiY2hlY2tib3hcIj5cclxuICAgICAgICAgICAgICAgICAgQ29tcHRlcyBzb2NpYXV4IGRlIGxhIEJhbnF1ZSBcclxuICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJjaGVja2JveFwiPlxyXG4gICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImNoZWNrbWFya1wiPlxyXG4gICAgICAgICAgICAgICAgICA8L3NwYW4+XHJcbiAgICAgICAgICAgICAgICA8L2xhYmVsPlxyXG4gICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzPVwiY2hlY2tib3hcIj5cclxuICAgICAgICAgICAgICAgICAgQ2VudHJhbGUgUG9wdWxhaXJlXHJcbiAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiBjaGVja2VkPlxyXG4gICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImNoZWNrbWFya1wiPlxyXG4gICAgICAgICAgICAgICAgICA8L3NwYW4+XHJcbiAgICAgICAgICAgICAgICA8L2xhYmVsPlxyXG4gICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzPVwiY2hlY2tib3hcIj5cclxuICAgICAgICAgICAgICAgICAgQ29tbXVuaXF1w6kgZGUgcHJlc3NlLSBWQVxyXG4gICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgY2hlY2tlZD5cclxuICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJjaGVja21hcmtcIj5cclxuICAgICAgICAgICAgICAgICAgPC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgPC9sYWJlbD5cclxuICAgICAgICAgICAgICAgIDxsYWJlbCBjbGFzcz1cImNoZWNrYm94XCI+XHJcbiAgICAgICAgICAgICAgICAgIENvbW11bmlxdcOpIGRlIHByZXNzZS0gVkZcclxuICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJjaGVja2JveFwiIGNoZWNrZWQ+XHJcbiAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiY2hlY2ttYXJrXCI+XHJcbiAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cclxuICAgICAgICAgICAgICAgIDwvbGFiZWw+XHJcbiAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tLWRvd25sb2FkXCI+XHJcbiAgICAgICAgICAgICAgICAgIHRlbGVjaGFyZ2VyXHJcbiAgICAgICAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICAgICAgICA8L3A+XHJcbiAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICBgXHJcbiAgICAgIH0pXHJcbiAgICAgIC5qb2luKCcnKVxyXG5cclxuICAgIGJpbmRFdmVudHMoKVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gaW5pdCAoKSB7XHJcbiAgICBsZXQgZGlzdGluY3RUYWdzID0gW11cclxuXHJcbiAgICBmaW5hbmNlc0RhdGVzLmlubmVySFRNTCA9IHN0YXRlLmRhdGFcclxuICAgICAgLmZpbHRlcihwb3N0ID0+IHtcclxuICAgICAgICBpZiAoIWRpc3RpbmN0VGFncy5pbmNsdWRlcyhwb3N0LmRhdGUpKSB7XHJcbiAgICAgICAgICBkaXN0aW5jdFRhZ3MucHVzaChwb3N0LmRhdGUpXHJcbiAgICAgICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICAgIH0pXHJcbiAgICAgIC5zb3J0KChweSwgbnkpID0+IHtcclxuICAgICAgICByZXR1cm4gbnkuZGF0ZS5zcGxpdCgnLycpWzJdIC0gcHkuZGF0ZS5zcGxpdCgnLycpWzJdXHJcbiAgICAgIH0pXHJcbiAgICAgIC5tYXAoKHBvc3QsIGluZGV4KSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIGA8YSBocmVmPVwiI1wiIGNsYXNzPVwiYnRuIGJ0bi0tdGFnICR7aW5kZXggPT0gMCA/ICdhY3RpdmUnIDogJyd9IFwiPlxyXG4gICAgICAgICAgICAgICAgICAke3Bvc3QuZGF0ZS5zcGxpdCgnLycpWzJdfVxyXG4gICAgICAgICAgICAgICAgPC9hPmBcclxuICAgICAgfSlcclxuICAgICAgLmpvaW4oJycpXHJcblxyXG4gICAgdGFnRmlsdGVycyA9IGZpbmFuY2VzRGF0ZXMucXVlcnlTZWxlY3RvckFsbCgnYScpXHJcblxyXG4gICAgdGFnRmlsdGVycy5mb3JFYWNoKHRhZyA9PiB7XHJcbiAgICAgIHRhZy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGNoYW5nZUZpbHRlcilcclxuICAgIH0pXHJcblxyXG4gICAgYXBwbHlGaWx0ZXJzKClcclxuICAgIGJpbmRFdmVudHMoKVxyXG4gIH1cclxuXHJcbiAgaW5pdCgpXHJcbn1cclxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gKCkge1xyXG5cdGlmICgkKCcuZmluYW5jZS5sZW5ndGgnKSkge1xyXG5cclxuXHRcdCQoJy5maW5hbmNlJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG5cclxuXHRcdFx0dmFyIGN1cnJlbnRJdGVtID0gJCh0aGlzKTtcclxuXHJcblx0XHRcdCQoJy5maW5hbmNlJykuZWFjaChmdW5jdGlvbiAoaW5kZXgsIGVsKSB7XHJcblxyXG5cdFx0XHRcdFx0aWYgKCQoZWwpWzBdICE9PSBjdXJyZW50SXRlbVswXSkge1xyXG5cdFx0XHRcdFx0XHQkKGVsKS5yZW1vdmVDbGFzcygnb3BlbicpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHR9KTtcclxuXHJcblx0XHRcdCQodGhpcykudG9nZ2xlQ2xhc3MoJ29wZW4nKTtcclxuXHRcdH0pO1xyXG5cdH1cclxufSIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uICgpIHtcclxuXHRpZiAoJCgnLmZvb3Rlcl90aXRsZScpLmxlbmd0aCkge1xyXG5cclxuXHRcdCQoJy5mb290ZXJfdGl0bGUnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdGlmICgkKHRoaXMpLm5leHQoJ3VsJykuY3NzKCdkaXNwbGF5JykgPT09ICdub25lJykge1xyXG5cclxuXHRcdFx0XHQkKCcuZm9vdGVyX3RpdGxlICsgdWwub3BlbicpLmNzcygnZGlzcGxheScsICdub25lJyk7XHJcblx0XHRcdFx0JCgnLmZvb3Rlcl90aXRsZSArIHVsLm9wZW4nKS5yZW1vdmVDbGFzcygnb3BlbicpO1xyXG5cclxuXHRcdFx0XHQkKHRoaXMpLm5leHQoJ3VsJykuY3NzKCdkaXNwbGF5JywgJ2Jsb2NrJyk7XHJcblx0XHRcdFx0JCh0aGlzKS5uZXh0KCd1bCcpLmFkZENsYXNzKCdvcGVuJyk7XHJcblxyXG5cdFx0XHR9IGVsc2Uge1xyXG5cclxuXHRcdFx0XHQkKHRoaXMpLm5leHQoJ3VsJykuY3NzKCdkaXNwbGF5JywgJ25vbmUnKTtcclxuXHRcdFx0XHQkKHRoaXMpLm5leHQoJ3VsJykucmVtb3ZlQ2xhc3MoJ29wZW4nKTtcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblxyXG5cdFx0JCh3aW5kb3cpLm9uKCdyZXNpemUnLCBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdGlmICggJCh3aW5kb3cpLndpZHRoKCkgPiA3NjggKSB7XHJcblx0XHRcdFx0JCgnLmZvb3Rlcl90aXRsZSArIHVsJykuY3NzKCdkaXNwbGF5JywgJ2Jsb2NrJyk7XHJcblx0XHRcdFx0JCgnLmZvb3Rlcl90aXRsZSArIHVsLm9wZW4nKS5yZW1vdmVDbGFzcygnb3BlbicpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdCQoJy5mb290ZXJfdGl0bGUgKyB1bCcpLmNzcygnZGlzcGxheScsICdub25lJyk7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdH1cclxufSIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xyXG5cclxuXHQvKiBWYXJpYWJsZXMgKi9cclxuXHJcbiAgICB2YXIgJGZvcm0gPSAkKCcuZm9ybS1zdGFnZScpO1xyXG4gICAgdmFyICRmb3JtRHJvcCA9ICQoJy5mb3JtX2Ryb3AnKTtcclxuICAgIHZhciAkaW5wdXQgPSAkZm9ybS5maW5kKCdpbnB1dFt0eXBlPWZpbGVdJyk7XHJcbiAgICB2YXIgZHJvcHBlZEZpbGVzID0gZmFsc2U7XHJcblxyXG5cclxuICAgIC8qIEZ1bmN0aW9ucyAqL1xyXG5cclxuICAgIHZhciBpc0FkdmFuY2VkVXBsb2FkID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgICAgIHJldHVybiAoKCdkcmFnZ2FibGUnIGluIGRpdikgfHwgKCdvbmRyYWdzdGFydCcgaW4gZGl2ICYmICdvbmRyb3AnIGluIGRpdikpICYmICdGb3JtRGF0YScgaW4gd2luZG93ICYmICdGaWxlUmVhZGVyJyBpbiB3aW5kb3c7XHJcbiAgICB9KCk7XHJcblxyXG4gICAgdmFyIGFkZGZpbGVEb20gPSBmdW5jdGlvbihmaWxlKSB7XHJcbiAgICAgICAgLy9jb25zb2xlLmxvZyhmaWxlKTtcclxuXHJcbiAgICAgICAgdmFyIGh0bWwgPSBgPGRpdiBjbGFzcz1cImNvbC0xMiBjb2wtbWQtNiBtYi0yXCI+XHJcblx0ICAgICAgICBcdFx0XHQ8ZGl2IGNsYXNzPVwiZm9ybV9maWxlXCIgaWQ9XCIke2ZpbGUubmFtZSArIHBhcnNlSW50KGZpbGUuc2l6ZSAvIDEwMjQpfVwiPlxyXG5cdFx0XHQgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIndyYXBwZXIgZC1mbGV4IGp1c3RpZnktY29udGVudC1iZXR3ZWVuIGFsaWduLWl0ZW1zLWNlbnRlclwiPlxyXG5cdFx0XHQgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJkLWZsZXggYWxpZ24taXRlbXMtY2VudGVyXCI+XHJcblx0XHRcdCAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiY2hlY2sgZC1ub25lXCI+XHJcblx0XHRcdCAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3ZnPlxyXG5cdFx0XHQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx1c2UgeGxpbms6aHJlZj1cIiNpY29uLWNoZWNrLWZpbGVcIj48L3VzZT5cclxuXHRcdFx0ICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3ZnPlxyXG5cdFx0XHQgICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XHJcblx0XHRcdCAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwicGRmXCI+XHJcblx0XHRcdCAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3ZnPlxyXG5cdFx0XHQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx1c2UgeGxpbms6aHJlZj1cIiNpY29uLXBkZi1maWxlXCI+PC91c2U+XHJcblx0XHRcdCAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3N2Zz5cclxuXHRcdFx0ICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxyXG5cdFx0XHQgICAgICAgICAgICAgICAgICAgICAgICA8c3Bhbj5cclxuXHRcdFx0ICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwIGNsYXNzPVwibmFtZVwiPlxyXG5cdFx0XHQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICR7ZmlsZS5uYW1lfVxyXG5cdFx0XHQgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9wPlxyXG5cdFx0XHQgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHAgY2xhc3M9XCJzaXplXCI+XHJcblx0XHRcdCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHtwYXJzZUludChmaWxlLnNpemUgLyAxMDI0KX1LQlxyXG5cdFx0XHQgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9wPlxyXG5cdFx0XHQgICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XHJcblx0XHRcdCAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcblx0XHRcdCAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImQtZmxleCBhbGlnbi1pdGVtcy1jZW50ZXJcIj5cclxuXHRcdFx0ICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJyZW1vdmUgZC1ub25lXCI+XHJcblx0XHRcdCAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3ZnPlxyXG5cdFx0XHQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx1c2UgeGxpbms6aHJlZj1cIiNpY29uLXJlbW92ZS1maWxlXCI+PC91c2U+XHJcblx0XHRcdCAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3N2Zz5cclxuXHRcdFx0ICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxyXG5cdFx0XHQgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImxvYWRpbmdcIj5cclxuXHRcdFx0ICAgICAgICAgICAgICAgICAgICAgICAgICAgIENoYXJnZW1lbnQgZW4gY291cnMgPHNwYW4gY2xhc3M9XCJwZXJjZW50YWdlXCI+PC9zcGFuPiAlXHJcblx0XHRcdCAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cclxuXHRcdFx0ICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJjcm9zc1wiPlxyXG5cdFx0XHQgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHN2Zz5cclxuXHRcdFx0ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dXNlIHhsaW5rOmhyZWY9XCIjaWNvbi1jcm9zcy1maWxlXCI+PC91c2U+XHJcblx0XHRcdCAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3N2Zz5cclxuXHRcdFx0ICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxyXG5cdFx0XHQgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG5cdFx0XHQgICAgICAgICAgICAgICAgPC9kaXY+XHJcblx0XHRcdCAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwicHJvZ3Jlc3MtYmFyXCIgc3R5bGU9XCJ3aWR0aDogMCVcIj48L2Rpdj5cclxuXHRcdFx0ICAgICAgICAgICAgPC9kaXY+XHJcblx0XHRcdCAgICAgICAgPC9kaXY+YDtcclxuXHJcblx0XHQkKCcuZm9ybV9maWxlcycpLmFwcGVuZChodG1sKTtcclxuXHJcbiAgICB9O1xyXG5cclxuICAgIHZhciBzZW5kRmlsZXMgPSBmdW5jdGlvbihmaWxlcykge1xyXG4gICAgICAgIC8vY29uc29sZS5sb2coZmlsZXMpO1xyXG5cclxuICAgICAgICB2YXIgYWpheERhdGEgPSBuZXcgRm9ybURhdGEoJGZvcm0uZ2V0KDApKTtcclxuXHJcbiAgICAgICAgJC5lYWNoKGRyb3BwZWRGaWxlcywgZnVuY3Rpb24oaSwgZmlsZSkge1xyXG5cclxuICAgICAgICBcdHZhciBmaWxlSWQgPSBmaWxlLm5hbWUgKyBwYXJzZUludChmaWxlLnNpemUgLyAxMDI0KTtcclxuICAgICAgICAgICAgYWpheERhdGEuYXBwZW5kKGZpbGVJZCwgZmlsZSk7XHJcblxyXG4gICAgICAgICAgICBhZGRmaWxlRG9tKGZpbGUpO1xyXG5cclxuICAgICAgICAgICAgJC5hamF4KHtcclxuICAgICAgICAgICAgICAgIHhocjogZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHZhciB4aHIgPSBuZXcgd2luZG93LlhNTEh0dHBSZXF1ZXN0KCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHhoci51cGxvYWQuYWRkRXZlbnRMaXN0ZW5lcihcInByb2dyZXNzXCIsIGZ1bmN0aW9uKGV2dCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXZ0Lmxlbmd0aENvbXB1dGFibGUpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcGVyY2VudENvbXBsZXRlID0gZXZ0LmxvYWRlZCAvIGV2dC50b3RhbDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBmaWxlSWQgPSBmaWxlLm5hbWUgKyBwYXJzZUludChmaWxlLnNpemUgLyAxMDI0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBmaWxlRG9tID0gJChkb2N1bWVudC5nZXRFbGVtZW50QnlJZChmaWxlSWQpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwZXJjZW50YWdlRG9tID0gJChkb2N1bWVudC5nZXRFbGVtZW50QnlJZChmaWxlSWQpKS5maW5kKCcucGVyY2VudGFnZScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHByb2dyZXNzQmFyID0gJChkb2N1bWVudC5nZXRFbGVtZW50QnlJZChmaWxlSWQpKS5maW5kKCcucHJvZ3Jlc3MtYmFyJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGVyY2VudENvbXBsZXRlID0gcGFyc2VJbnQocGVyY2VudENvbXBsZXRlICogMTAwKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwZXJjZW50YWdlRG9tLmFwcGVuZChwZXJjZW50Q29tcGxldGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvZ3Jlc3NCYXIuY3NzKCd3aWR0aCcsIHBlcmNlbnRDb21wbGV0ZSArICclJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2cocGVyY2VudENvbXBsZXRlKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocGVyY2VudENvbXBsZXRlID09PSAxMDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcdFx0ZmlsZURvbS5maW5kKCcucHJvZ3Jlc3MtYmFyJykudG9nZ2xlQ2xhc3MoJ2Qtbm9uZScpO1xyXG5cdCAgICAgICAgICAgICAgICAgICAgICAgICAgICBcdGZpbGVEb20uZmluZCgnLmxvYWRpbmcnKS50b2dnbGVDbGFzcygnZC1ub25lJyk7XHJcblx0ICAgICAgICAgICAgICAgICAgICAgICAgICAgIFx0ZmlsZURvbS5maW5kKCcucmVtb3ZlJykudG9nZ2xlQ2xhc3MoJ2Qtbm9uZScpO1xyXG5cdCAgICAgICAgICAgICAgICAgICAgICAgICAgICBcdGZpbGVEb20uZmluZCgnLmNyb3NzJykudG9nZ2xlQ2xhc3MoJ2Qtbm9uZScpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFx0fSwgMzAwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFx0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSwgZmFsc2UpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4geGhyO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHVybDogJ2FjdGlvbi91cGxvYWRmaWxlJyxcclxuICAgICAgICAgICAgICAgIHR5cGU6ICRmb3JtLmF0dHIoJ21ldGhvZCcpLFxyXG4gICAgICAgICAgICAgICAgZGF0YTogYWpheERhdGEsXHJcbiAgICAgICAgICAgICAgICBkYXRhVHlwZTogJ2pzb24nLFxyXG4gICAgICAgICAgICAgICAgY2FjaGU6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgY29udGVudFR5cGU6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgcHJvY2Vzc0RhdGE6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgY29tcGxldGU6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICRmb3JtLnJlbW92ZUNsYXNzKCdpcy11cGxvYWRpbmcnKTtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJGZvcm0uYWRkQ2xhc3MoZGF0YS5zdWNjZXNzID09IHRydWUgPyAnaXMtc3VjY2VzcycgOiAnaXMtZXJyb3InKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIWRhdGEuc3VjY2VzcykgY29uc29sZS5sb2coJ3VwbG9hZCBlcnJvcicpO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGVycm9yOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBMb2cgdGhlIGVycm9yLCBzaG93IGFuIGFsZXJ0LCB3aGF0ZXZlciB3b3JrcyBmb3IgeW91XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgJCgnLnJlbW92ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuXHRcdCAgICBcdHZhciByZW1vdmVJZCA9ICQodGhpcykuY2xvc2VzdCgnLmZvcm1fZmlsZScpLmF0dHIoJ2lkJyk7XHJcblxyXG5cdFx0ICAgIFx0cmVtb3ZlRmlsZShyZW1vdmVJZCk7XHJcblx0XHQgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxuICAgIHZhciByZW1vdmVGaWxlID0gZnVuY3Rpb24oaWQpIHtcclxuICAgIFx0dmFyIGZpbGUgPSAkKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKSkucGFyZW50KCk7XHJcbiAgICBcdGZpbGUucmVtb3ZlKCk7XHJcbiAgICB9XHJcblxyXG5cdC8qIERyYWcgYW5kIGRyb3AgTGlzdGVuZXIgKi9cclxuXHJcbiAgICBpZiAoaXNBZHZhbmNlZFVwbG9hZCkge1xyXG4gICAgICAgIC8vIEJyb3dzZXIgc3VwcG9ydCBEcmFnIGFuZCBEcm9wXHJcblxyXG4gICAgICAgICRmb3JtRHJvcC5vbignZHJhZyBkcmFnc3RhcnQgZHJhZ2VuZCBkcmFnb3ZlciBkcmFnZW50ZXIgZHJhZ2xlYXZlIGRyb3AnLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAub24oJ2RyYWdvdmVyIGRyYWdlbnRlcicsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgJGZvcm1Ecm9wLmFkZENsYXNzKCdpcy1kcmFnb3ZlcicpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAub24oJ2RyYWdsZWF2ZSBkcmFnZW5kIGRyb3AnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICRmb3JtRHJvcC5yZW1vdmVDbGFzcygnaXMtZHJhZ292ZXInKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLm9uKCdkcm9wJywgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICAgICAgZHJvcHBlZEZpbGVzID0gZS5vcmlnaW5hbEV2ZW50LmRhdGFUcmFuc2Zlci5maWxlcztcclxuICAgICAgICAgICAgICAgIHNlbmRGaWxlcyhkcm9wcGVkRmlsZXMpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgJGlucHV0Lm9uKCdjaGFuZ2UnLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgXHRkcm9wcGVkRmlsZXMgPSBlLnRhcmdldC5maWxlcztcclxuICAgICAgICAgICAgc2VuZEZpbGVzKGUudGFyZ2V0LmZpbGVzKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAvL2ZhbGxiYWNrIGZvciBJRTktIGJyb3dzZXJzXHJcbiAgICB9XHJcblxyXG4gICAgLyogU3VibWl0IExpc3RlbmVyICovXHJcblxyXG4gICAgJGZvcm0ub24oJ3N1Ym1pdCcsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICBpZiAoJGZvcm0uaGFzQ2xhc3MoJ2lzLXVwbG9hZGluZycpKSByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgICAgICRmb3JtLmFkZENsYXNzKCdpcy11cGxvYWRpbmcnKS5yZW1vdmVDbGFzcygnaXMtZXJyb3InKTtcclxuXHJcbiAgICAgICAgaWYgKGlzQWR2YW5jZWRVcGxvYWQpIHtcclxuICAgICAgICAgICAgLy8gYWpheCBmb3IgbW9kZXJuIGJyb3dzZXJzXHJcblxyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcblxyXG4gICAgICAgICAgICAvLyBGb3JtIElucHV0IERhdGFcclxuICAgICAgICAgICAgdmFyIGFqYXhEYXRhID0ge307XHJcblxyXG4gICAgICAgICAgICAkLmFqYXgoe1xyXG4gICAgICAgICAgICAgICAgdXJsOiAkZm9ybS5hdHRyKCdhY3Rpb24nKSxcclxuICAgICAgICAgICAgICAgIHR5cGU6ICRmb3JtLmF0dHIoJ21ldGhvZCcpLFxyXG4gICAgICAgICAgICAgICAgZGF0YTogYWpheERhdGEsXHJcbiAgICAgICAgICAgICAgICBkYXRhVHlwZTogJ2pzb24nLFxyXG4gICAgICAgICAgICAgICAgY2FjaGU6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgY29udGVudFR5cGU6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgcHJvY2Vzc0RhdGE6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgY29tcGxldGU6IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihkYXRhKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGVycm9yOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBMb2cgdGhlIGVycm9yLCBzaG93IGFuIGFsZXJ0LCB3aGF0ZXZlciB3b3JrcyBmb3IgeW91XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBhamF4IGZvciBJRTktIGJyb3dzZXJzXHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG59IiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XHJcbiAgICAkKFwiZm9ybVtuYW1lPSdmb3JtLXN0YWdlJ11cIikudmFsaWRhdGUoe1xyXG5cclxuICAgICAgICAvLyBTcGVjaWZ5IHZhbGlkYXRpb24gcnVsZXNcclxuICAgICAgICBydWxlczoge1xyXG4gICAgICAgICAgICBmaXJzdG5hbWU6ICdyZXF1aXJlZCcsXHJcbiAgICAgICAgICAgIGxhc3RuYW1lOiAncmVxdWlyZWQnLFxyXG4gICAgICAgICAgICBlbWFpbDoge1xyXG4gICAgICAgICAgICAgICAgcmVxdWlyZWQ6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBlbWFpbDogdHJ1ZVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB0ZWw6IHtcclxuICAgICAgICAgICAgICAgIHJlcXVpcmVkOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgZGlnaXRzOiB0cnVlXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHNlcnZpY2U6ICdyZXF1aXJlZCcsXHJcbiAgICAgICAgICAgIGZvcm1hdGlvbjogJ3JlcXVpcmVkJyxcclxuICAgICAgICAgICAgc3RhZ2U6IHtcclxuICAgICAgICAgICAgICAgIHJlcXVpcmVkOiB0cnVlLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAndHlwZS1mb3JtYXRpb24nOiB7XHJcbiAgICAgICAgICAgICAgICByZXF1aXJlZDogdHJ1ZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyBTcGVjaWZ5IHZhbGlkYXRpb24gZXJyb3IgbWVzc2FnZXNcclxuICAgICAgICBtZXNzYWdlczoge1xyXG4gICAgICAgICAgICBmaXJzdG5hbWU6ICdWZXVpbGxleiBlbnRyZXIgdm90cmUgcHLDqW5vbScsXHJcbiAgICAgICAgICAgIGxhc3RuYW1lOiAnVmV1aWxsZXogZW50cmVyIHZvdHJlIG5vbScsXHJcbiAgICAgICAgICAgIGVtYWlsOiAnVmV1aWxsZXogZW50cmVyIHVuIGVtYWlsIHZhbGlkZScsXHJcbiAgICAgICAgICAgIHRlbDogJ1ZldWlsbGV6IGVudHJlciB1biBudW3DqXJvIGRlIHTDqWzDqXBob25lIHZhbGlkZSAoMTAgY2FyYWN0w6hyZXMgbWluKScsXHJcbiAgICAgICAgICAgICd0eXBlLWZvcm1hdGlvbic6ICdWZXVpbGxleiBlbnRyZXIgdW4gdHlwZSBkZSBmb3JtYXRpb24nLFxyXG4gICAgICAgICAgICAnY29uZGl0aW9ucyc6ICdWZXVpbGxleiBhY2NlcHRleiBsZXMgY29uZGl0aW9ucyBnw6luw6lyYWxlcyBkXFwndXRpbGlzYXRpb24nLFxyXG4gICAgICAgICAgICAnc2VydmljZSc6ICdWZXVpbGxleiBjaG9pc2lyIHVuIHNlcnZpY2UnLFxyXG4gICAgICAgICAgICAnZm9ybWF0aW9uJzogJ1ZldWlsbGV6IGNob2lzaXIgdW5lIGZvcm1hdGlvbicsXHJcbiAgICAgICAgICAgICdzdGFnZSc6ICdWZXVpbGxleiBjaG9pc2lyIHVuIHR5cGUgZGUgc3RhZ2UnXHJcbiAgICAgICAgfSxcclxuICAgICAgICBlcnJvclBsYWNlbWVudDogZnVuY3Rpb24oZXJyb3IsIGVsZW1lbnQpIHtcclxuICAgICAgICAgICAgaWYgKChlbGVtZW50LmF0dHIoJ3R5cGUnKSA9PSAncmFkaW8nIHx8IGVsZW1lbnQuYXR0cigndHlwZScpID09ICdjaGVja2JveCcpICYmIGVsZW1lbnQuYXR0cignbmFtZScpICE9ICdjb25kaXRpb25zJykge1xyXG4gICAgICAgICAgICBcdGVycm9yLmluc2VydEFmdGVyKGVsZW1lbnQucGFyZW50KCkucGFyZW50KCkpO1xyXG5cclxuICAgICAgICAgICAgfSBlbHNlIGlmKGVsZW1lbnQuYXR0cignbmFtZScpID09ICdjb25kaXRpb25zJyl7XHJcbiAgICAgICAgICAgIFx0ZXJyb3IuaW5zZXJ0QWZ0ZXIoZWxlbWVudC5wYXJlbnQoKSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBlcnJvci5pbnNlcnRBZnRlcihlbGVtZW50KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIC8vIE1ha2Ugc3VyZSB0aGUgZm9ybSBpcyBzdWJtaXR0ZWQgdG8gdGhlIGRlc3RpbmF0aW9uIGRlZmluZWRcclxuICAgICAgICAvLyBpbiB0aGUgXCJhY3Rpb25cIiBhdHRyaWJ1dGUgb2YgdGhlIGZvcm0gd2hlbiB2YWxpZFxyXG4gICAgICAgIHN1Ym1pdEhhbmRsZXI6IGZ1bmN0aW9uKGZvcm0pIHtcclxuICAgICAgICAgICAgZm9ybS5zdWJtaXQoKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxufSIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uICgpIHtcclxuXHRpZiAoJCgnLmhlYWRlcl9tb2JpbGUtbWVudScpLmxlbmd0aCkge1xyXG5cdFx0JCgnLmhlYWRlcl9tb2JpbGUtbWVudScpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0aWYgKCQoJy5oZWFkZXJfbWVudScpLmNzcygnZGlzcGxheScpID09ICdibG9jaycpIHtcclxuXHRcdFx0XHQkKCcuaGVhZGVyX21lbnUnKS5jc3MoJ2Rpc3BsYXknLCAnbm9uZScpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdCQoJy5oZWFkZXJfbWVudScpLmNzcygnZGlzcGxheScsICdibG9jaycpO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdCQod2luZG93KS5vbigncmVzaXplJywgZnVuY3Rpb24gKCkge1xyXG5cdFx0aWYgKCQod2luZG93KS53aWR0aCgpID4gOTkxKSB7XHJcblx0XHRcdGlmICgkKCcuaGVhZGVyX21lbnUnKS5jc3MoJ2Rpc3BsYXknKSA9PSAnbm9uZScpIHtcclxuXHRcdFx0XHQkKCcuaGVhZGVyX21lbnUnKS5jc3MoJ2Rpc3BsYXknLCAnYmxvY2snKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH0pO1xyXG59IiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gKCkge1xyXG5cdGlmICgkKCcuaG9tZS1zbGlkZXInKS5sZW5ndGgpIHtcclxuXHJcbiAgICAgICAgdmFyIHJ0bCA9ICQoJ2h0bWwnKS5hdHRyKCdkaXInKSA9PSAncnRsJztcclxuXHJcblx0XHRpZiAoJCh3aW5kb3cpLndpZHRoKCkgPiA3NjgpIHtcclxuXHJcblx0XHRcdHNldEhlaWdodFNsaWRlcigpO1xyXG4gICAgICAgICAgICBob21lU2xpZGVyKDAsIHJ0bCk7XHJcblxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGhvbWVTbGlkZXIoMCwgcnRsKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgICQod2luZG93KS5vbigncmVzaXplJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBpZiAoJCh3aW5kb3cpLndpZHRoKCkgPiA3NjgpIHtcclxuICAgICAgICAgICAgICAgICQoJy5ob21lLXNsaWRlcicpLm93bENhcm91c2VsKCdkZXN0cm95Jyk7XHJcbiAgICAgICAgICAgICAgICBob21lU2xpZGVyKDAsIHJ0bCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAkKCcuaG9tZS1zbGlkZXInKS5vd2xDYXJvdXNlbCgnZGVzdHJveScpO1xyXG4gICAgICAgICAgICAgICAgaG9tZVNsaWRlcigwLCBydGwpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBzZXRIZWlnaHRTbGlkZXIoKSB7XHJcblx0XHR2YXIgd2luZG93SGVpZ2h0ID0gJCh3aW5kb3cpLmhlaWdodCgpO1xyXG5cdFx0dmFyIHRvcEhlYWRlckhlaWdodCA9ICQoJy50b3AtaGVhZGVyJykuaGVpZ2h0KCk7XHJcblx0XHR2YXIgaGVhZGVySGVpZ2h0ID0gJCgnLmhlYWRlcicpLmhlaWdodCgpO1xyXG5cclxuXHRcdHZhciBzbGlkZXJIZWlnaHQgPSB3aW5kb3dIZWlnaHQgLSB0b3BIZWFkZXJIZWlnaHQgLSBoZWFkZXJIZWlnaHQ7XHJcblxyXG5cdFx0dmFyIHNsaWRlciA9ICQoJy5ob21lLXNsaWRlcicpO1xyXG5cdFx0dmFyIHNsaWRlckl0ZW0gPSAkKCcuaG9tZS1zbGlkZXJfaXRlbScpO1xyXG5cclxuXHRcdHNsaWRlci5jc3MoJ21heC1oZWlnaHQnLCBzbGlkZXJIZWlnaHQpO1xyXG5cdFx0c2xpZGVySXRlbS5jc3MoJ21heC1oZWlnaHQnLCBzbGlkZXJIZWlnaHQpO1xyXG5cdFx0XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBob21lU2xpZGVyKHN0YWdlUGFkZGluZywgcnRsKSB7XHJcblx0XHR2YXIgb3dsID0gJCgnLmhvbWUtc2xpZGVyLm93bC1jYXJvdXNlbCcpLm93bENhcm91c2VsKHtcclxuICAgICAgICAgICAgc3RhZ2VQYWRkaW5nOiBzdGFnZVBhZGRpbmcsXHJcbiAgICAgICAgICAgIG1hcmdpbjogMCxcclxuICAgICAgICAgICAgZG90czogdHJ1ZSxcclxuICAgICAgICAgICAgbmF2OiBmYWxzZSxcclxuICAgICAgICAgICAgbG9vcDogdHJ1ZSxcclxuICAgICAgICAgICAgbmF2U3BlZWQ6IDQwMCxcclxuICAgICAgICAgICAgLy9hdXRvcGxheTogdHJ1ZSxcclxuXHRcdFx0YXV0b3BsYXlUaW1lb3V0OjUwMDAsXHJcbiAgICAgICAgICAgIHJ0bDogcnRsLFxyXG4gICAgICAgICAgICByZXNwb25zaXZlOiB7XHJcbiAgICAgICAgICAgICAgICAwOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaXRlbXM6IDFcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICA3Njg6IHtcclxuICAgICAgICAgICAgICAgIFx0aXRlbXM6IDEsXHJcbiAgICAgICAgICAgICAgICBcdGRvdHNEYXRhOiB0cnVlXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfSk7XHJcblx0fVxyXG59IiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gKCkge1xyXG5cdGlmICgkKCcubG9nby1zbGlkZXInKS5sZW5ndGgpIHtcclxuXHJcbiAgICAgICAgdmFyIHJ0bCA9ICQoJ2h0bWwnKS5hdHRyKCdkaXInKSA9PSAncnRsJztcclxuXHJcblx0XHRpZiAoJCh3aW5kb3cpLndpZHRoKCkgPiA3NjgpIHtcclxuXHRcdFx0bG9nb1NsaWRlcigwLCBydGwpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0bG9nb1NsaWRlcigwLCBydGwpO1xyXG5cdFx0fVxyXG5cclxuXHRcdCQod2luZG93KS5vbigncmVzaXplJywgZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRpZiAoJCh3aW5kb3cpLndpZHRoKCkgPiA3NjgpIHtcclxuXHRcdFx0XHRsb2dvU2xpZGVyKDAsIHJ0bCk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0bG9nb1NsaWRlcigwLCBydGwpO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBsb2dvU2xpZGVyKHN0YWdlUGFkZGluZywgcnRsKSB7XHJcbiAgICAgICAgJCgnLmxvZ28tc2xpZGVyLm93bC1jYXJvdXNlbCcpLm93bENhcm91c2VsKHtcclxuICAgICAgICAgICAgc3RhZ2VQYWRkaW5nOiBzdGFnZVBhZGRpbmcsXHJcbiAgICAgICAgICAgIG1hcmdpbjogNDUsXHJcbiAgICAgICAgICAgIGRvdHM6IGZhbHNlLFxyXG4gICAgICAgICAgICBuYXY6IHRydWUsXHJcbiAgICAgICAgICAgIGxvb3A6IHRydWUsXHJcbiAgICAgICAgICAgIHJ0bDogcnRsLFxyXG4gICAgICAgICAgICByZXNwb25zaXZlOiB7XHJcbiAgICAgICAgICAgICAgICAwOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaXRlbXM6IDIuNVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIDc2ODoge1xyXG4gICAgICAgICAgICAgICAgXHRpdGVtczogNFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIDk5Mjoge1xyXG4gICAgICAgICAgICAgICAgICAgIGl0ZW1zOiA1XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQgZGF0YSBmcm9tICcuLi8uLi9hc3NldHMvanMvZGF0YS5qc29uJ1xyXG5cclxuZXhwb3J0IGxldCBtYXBDb250cm9sID0gZnVuY3Rpb24gKCkge1xyXG4gIGxldCBwcm9jZXNzRGF0YSA9IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICBsZXQgaW5wdXRlZFNlYXJjaCA9ICQoJyNpbnB1dGVkLXNlYXJjaCcpXHJcbiAgICBsZXQgc2VhcmNoUmVzdWx0ID0gJCgnI3NlYXJjaC1yZXN1bHQnKVxyXG4gICAgbGV0IHN1Z2dlc3Rpb25Ib2xkZXIgPSAkKCcjc3VnZ2VzdGlvbnMtaG9sZGVyJylcclxuICAgIGxldCBzZWFyY2hJbnB1dCA9ICQoJyNzZWFyY2gtaW5wdXQnKVxyXG4gICAgbGV0IHN1Z2dlc3Rpb25zQ29udGFpbmVyID0gJCgnI3N1Z2dlc3Rpb25zLWNvbnRhaW5lcicpXHJcbiAgICBsZXQgc2VsZWN0ZWRDb250YWluZXIgPSAkKCcjc2VsZWN0ZWQtY29udGFpbmVyJylcclxuICAgIGxldCBtYXBDb250cm9sQ29udGFpbmVyID0gJCgnLm1hcGNvbnRyb2xfY29udGFpbmVyJylcclxuICAgIGxldCBmaWx0ZXJzID0gJCgnLm1hcGNvbnRyb2xfb3B0aW9ucyA+IC5idG4nKVxyXG4gICAgbGV0IG5lYXJCeUJ0biA9ICQoJy5tYXBjb250cm9sX2lucHV0LWxlZnQnKVxyXG5cclxuICAgIGxldCBzZWxlY3RlZEVsZW1lbnRcclxuXHJcbiAgICBsZXQgc3RhdGUgPSB7XHJcbiAgICAgIHVzZXJJbnB1dDogJycsXHJcbiAgICAgIGZpbHRlcnM6IFtdLFxyXG4gICAgICBmaWx0cmVkRGF0YTogW10sXHJcbiAgICAgIG5lYXJCeURhdGE6IFtdLFxyXG4gICAgICBuZWFyQnk6IGZhbHNlXHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGNoZWNrU3VnZ2VzdGlvbnNTdGF0dXMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIGlmIChzdGF0ZS5maWx0cmVkRGF0YS5sZW5ndGggPD0gMCkge1xyXG4gICAgICAgIG1hcENvbnRyb2xDb250YWluZXIuY3NzKCdoZWlnaHQnLCAnMTg2cHgnKVxyXG4gICAgICAgIHN1Z2dlc3Rpb25zQ29udGFpbmVyLmhpZGUoKVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIG1hcENvbnRyb2xDb250YWluZXIuY3NzKCdoZWlnaHQnLCAnMjQ1cHgnKVxyXG4gICAgICAgIHN1Z2dlc3Rpb25zQ29udGFpbmVyLnNob3coKVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGFwcGx5RmlsdGVycyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgaWYgKCFzdGF0ZS5uZWFyQnkpIHtcclxuICAgICAgICAvLyBmaWx0ZXIgZGF0YSBieSB1c2VyIGlucHV0XHJcbiAgICAgICAgc3RhdGUuZmlsdHJlZERhdGEgPSBkYXRhLmZpbHRlcihlbGVtZW50ID0+IHtcclxuICAgICAgICAgIHJldHVybiAoXHJcbiAgICAgICAgICAgIChlbGVtZW50Lm5hbWUudG9Mb2NhbGVMb3dlckNhc2UoKS5pbmNsdWRlcyhzdGF0ZS51c2VySW5wdXQpIHx8XHJcbiAgICAgICAgICAgICAgZWxlbWVudC5hZGRyZXNzLnRvTG9jYWxlTG93ZXJDYXNlKCkuaW5jbHVkZXMoc3RhdGUudXNlcklucHV0dCkgfHxcclxuICAgICAgICAgICAgICBlbGVtZW50LmNpdHkudG9Mb2NhbGVMb3dlckNhc2UoKS5pbmNsdWRlcyhzdGF0ZS51c2VySW5wdXQpKSAmJlxyXG4gICAgICAgICAgICBzdGF0ZS51c2VySW5wdXQgIT0gJydcclxuICAgICAgICAgIClcclxuICAgICAgICB9KVxyXG5cclxuICAgICAgICAvLyBGaWx0ZXIgZGF0YSBieSB0eXBlXHJcbiAgICAgICAgc3RhdGUuZmlsdGVycy5mb3JFYWNoKGZpbHRlciA9PiB7XHJcbiAgICAgICAgICBzdGF0ZS5maWx0cmVkRGF0YSA9IHN0YXRlLmZpbHRyZWREYXRhLmZpbHRlcihlbGVtZW50ID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQudHlwZSA9PT0gZmlsdGVyXHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgIH0pXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgc3RhdGUuZmlsdHJlZERhdGEgPSBzdGF0ZS5uZWFyQnlEYXRhLm1hcChlbnRyeSA9PiBlbnRyeSlcclxuICAgICAgICAvLyBGaWx0ZXIgZGF0YSBieSB0eXBlXHJcbiAgICAgICAgc3RhdGUuZmlsdGVycy5mb3JFYWNoKGZpbHRlciA9PiB7XHJcbiAgICAgICAgICBzdGF0ZS5maWx0cmVkRGF0YSA9IHN0YXRlLmZpbHRyZWREYXRhLmZpbHRlcihlbGVtZW50ID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQudHlwZSA9PT0gZmlsdGVyXHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgIH0pXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIHJlbmRlciBmaWx0cmVkIGRhdGFcclxuICAgICAgcmVuZGVyKClcclxuICAgIH1cclxuXHJcbiAgICBsZXQgZmlsdGVyQ2hhbmdlcyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgJCh0aGlzKS50b2dnbGVDbGFzcygnYWN0aXZlJykgLy8gY2hhbmdlIHRoZSBzdHlsZSBvZiB0aGUgdGFnXHJcbiAgICAgIHN0YXRlLmZpbHRlcnMgPSBbXVxyXG5cclxuICAgICAgZmlsdGVycy5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpZiAoJCh0aGlzKS5oYXNDbGFzcygnYWN0aXZlJykpIHtcclxuICAgICAgICAgIHN0YXRlLmZpbHRlcnMucHVzaCgkKHRoaXMpLmRhdGEoJ3ZhbHVlJykpXHJcbiAgICAgICAgfVxyXG4gICAgICB9KVxyXG5cclxuICAgICAgYXBwbHlGaWx0ZXJzKClcclxuICAgIH1cclxuXHJcbiAgICBsZXQgaW5wdXRDaGFuZ2VzID0gZnVuY3Rpb24gKGUpIHtcclxuICAgICAgc3RhdGUudXNlcklucHV0ID0gZS50YXJnZXQudmFsdWUudG9Mb2NhbGVMb3dlckNhc2UoKVxyXG4gICAgICBzdGF0ZS5uZWFyQnkgPSBmYWxzZVxyXG4gICAgICBuZWFyQnlCdG4ucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpXHJcbiAgICAgIGFwcGx5RmlsdGVycygpXHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHNob3dTZWxlY3RlZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgbGV0IHNlbGVjdGVkTmFtZSA9ICQodGhpcykuZmluZCgnaDMnKS50ZXh0KClcclxuXHJcbiAgICAgIHNlbGVjdGVkRWxlbWVudCA9IHN0YXRlLmZpbHRyZWREYXRhXHJcbiAgICAgICAgLmZpbHRlcihlbGVtZW50ID0+IGVsZW1lbnQubmFtZSA9PT0gc2VsZWN0ZWROYW1lKVxyXG4gICAgICAgIC5yZWR1Y2UocHJldiA9PiBwcmV2KVxyXG5cclxuICAgICAgbGV0IHNlbGVjdGVkSFRNTCA9IGJ1aWxkTWFwQ2FyZEluZm8oc2VsZWN0ZWRFbGVtZW50KVxyXG5cclxuICAgICAgc2VsZWN0ZWRDb250YWluZXIuaHRtbChzZWxlY3RlZEhUTUwpXHJcbiAgICAgICQoJyNzZWxlY3RlZC1jb250YWluZXItLWNsb3NlJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICByZW5kZXIoKVxyXG4gICAgICB9KVxyXG4gICAgICAkKCcjc2VsZWN0ZWQtY29udGFpbmVyLS1kaXJlY3Rpb24nKS5vbignY2xpY2snLCBkaXNwbGF5RGlyZWN0aW9uKVxyXG4gICAgICBzZWxlY3RlZENvbnRhaW5lci5mYWRlSW4oKVxyXG4gICAgICBzdWdnZXN0aW9uc0NvbnRhaW5lci5oaWRlKClcclxuXHJcbiAgICAgIGFqdXN0Q29udHJvbFNpemUoKSAvLyBhanVzdCBtYXAgY29udHJvbCB0byB0aGUgc2NyZWVuIHNpemVcclxuXHJcbiAgICAgIC8vIGNvbnNvbGUubG9nKHNlbGVjdGVkRWxlbWVudClcclxuXHJcbiAgICAgIHdpbmRvdy5tYXAuc2V0Q2VudGVyKFxyXG4gICAgICAgIG5ldyBnb29nbGUubWFwcy5MYXRMbmcoXHJcbiAgICAgICAgICBzZWxlY3RlZEVsZW1lbnQuY29vcmRzLmdwcy5sYW5nLFxyXG4gICAgICAgICAgc2VsZWN0ZWRFbGVtZW50LmNvb3Jkcy5ncHMubGF0XHJcbiAgICAgICAgKVxyXG4gICAgICApXHJcblxyXG4gICAgICAvLyByZW1vdmUgYW5pbWF0aW9uIGZyb20gYWxsIG1hcmtlcnNcclxuICAgICAgd2luZG93Lm1hcE1hcmtlcnMuZm9yRWFjaChtYXJrZXIgPT4ge1xyXG4gICAgICAgIGlmIChcclxuICAgICAgICAgIG1hcmtlci5wb3NpdGlvbi5sYXQgPT09IHNlbGVjdGVkRWxlbWVudC5jb29yZHMuZ3BzLmxhdCAmJlxyXG4gICAgICAgICAgbWFya2VyLnBvc2l0aW9uLmxhbmcgPT09IHNlbGVjdGVkRWxlbWVudC5jb29yZHMuZ3BzLmxhbmdcclxuICAgICAgICApIHtcclxuICAgICAgICAgIG1hcmtlci5tYXJrZXIuc2V0QW5pbWF0aW9uKGdvb2dsZS5tYXBzLkFuaW1hdGlvbi5CT1VOQ0UpXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIG1hcmtlci5tYXJrZXIuc2V0QW5pbWF0aW9uKG51bGwpXHJcbiAgICAgICAgfVxyXG4gICAgICB9KVxyXG5cclxuICAgICAgd2luZG93Lm1hcC5zZXRab29tKDE2KVxyXG5cclxuICAgICAgLy8gd2luZG93LmlzRGlzcGxheVJvdXRlID0gZmFsc2VcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBkaXNwbGF5RGlyZWN0aW9uIChlKSB7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgICAvLyBjb25zb2xlLmxvZyhzZWxlY3RlZEVsZW1lbnQpXHJcbiAgICAgIGNhbGN1bGF0ZUFuZERpc3BsYXlSb3V0ZShcclxuICAgICAgICB3aW5kb3cubWFwLFxyXG4gICAgICAgIG5ldyBnb29nbGUubWFwcy5MYXRMbmcoXHJcbiAgICAgICAgICBzZWxlY3RlZEVsZW1lbnQuY29vcmRzLmdwcy5sYW5nLFxyXG4gICAgICAgICAgc2VsZWN0ZWRFbGVtZW50LmNvb3Jkcy5ncHMubGF0XHJcbiAgICAgICAgKVxyXG4gICAgICApXHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHJlbmRlciA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgLy8gaGlkZSBzZWxlY3RlZCBjb250YWluZXJcclxuICAgICAgc2VsZWN0ZWRDb250YWluZXIuaGlkZSgpXHJcblxyXG4gICAgICAvLyBDaGVjayB3ZXRoZXIgdG8gZGlzcGxheSBzdWdnZXN0aW9ucyBvZiBub3RcclxuICAgICAgY2hlY2tTdWdnZXN0aW9uc1N0YXR1cygpXHJcblxyXG4gICAgICAvLyB1cGRhdGUgaW5wdXRlZCBzZWFyY2hcclxuICAgICAgaW5wdXRlZFNlYXJjaC50ZXh0KHN0YXRlLnVzZXJJbnB1dClcclxuICAgICAgLy8gdXBkYXRlIHNlYXJjaCBSZXN1bHRcclxuICAgICAgc2VhcmNoUmVzdWx0LnRleHQoYCggJHtzdGF0ZS5maWx0cmVkRGF0YS5sZW5ndGh9IGFnZW5jZXMgdHJvdXbDqWVzIClgKVxyXG5cclxuICAgICAgbGV0IGNvbnRlbnQgPSBzdGF0ZS5maWx0cmVkRGF0YVxyXG4gICAgICAgIC5tYXAoZWxlbWVudCA9PiB7XHJcbiAgICAgICAgICByZXR1cm4gYDxkaXYgY2xhc3M9XCJzdWdnZXN0aW9uc19lbGVtZW50IGQtZmxleCBqdXN0aWZ5LWNvbnRlbnQtYmV0d2VlblwiPlxyXG4gICAgICAgICAgICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDxoMz4ke2VsZW1lbnQubmFtZX08L2gzPlxyXG4gICAgICAgICAgICAgICAgICAgIDxzcGFuPiR7ZWxlbWVudC5hZGRyZXNzfTwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICR7ZWxlbWVudC5kaXN0YW5jZU9yaWdpbiA/ICc8ZGl2PiA8c3Bhbj4nICsgZWxlbWVudC5kaXN0YW5jZU9yaWdpbi50ZXh0ICsgJzwvc3Bhbj48L2Rpdj4nIDogJyd9XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5gXHJcbiAgICAgICAgfSlcclxuICAgICAgICAuam9pbignJylcclxuXHJcbiAgICAgIHN1Z2dlc3Rpb25Ib2xkZXIuaHRtbChjb250ZW50KVxyXG5cclxuICAgICAgYWp1c3RDb250cm9sU2l6ZSgpIC8vIGFqdXN0IG1hcCBjb250cm9sIHRvIHRoZSBzY3JlZW4gc2l6ZVxyXG5cclxuICAgICAgJCgnLnN1Z2dlc3Rpb25zX2VsZW1lbnQnKS5jbGljayhzaG93U2VsZWN0ZWQpXHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZGlzdGFuY2VNYXRyaXggKCkge1xyXG4gICAgICB2YXIgc2VydmljZSA9IG5ldyBnb29nbGUubWFwcy5EaXN0YW5jZU1hdHJpeFNlcnZpY2UoKVxyXG5cclxuICAgICAgcmV0dXJuIGZ1bmN0aW9uIGdldERpc3RhbmNlIChkZXN0aW5hdGlvbikge1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XHJcbiAgICAgICAgICBuYXZpZ2F0b3IuZ2VvbG9jYXRpb24uZ2V0Q3VycmVudFBvc2l0aW9uKGZ1bmN0aW9uIChwb3MpIHtcclxuICAgICAgICAgICAgc2VydmljZS5nZXREaXN0YW5jZU1hdHJpeChcclxuICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBvcmlnaW5zOiBbXHJcbiAgICAgICAgICAgICAgICAgIG5ldyBnb29nbGUubWFwcy5MYXRMbmcoXHJcbiAgICAgICAgICAgICAgICAgICAgcG9zLmNvb3Jkcy5sYXRpdHVkZSxcclxuICAgICAgICAgICAgICAgICAgICBwb3MuY29vcmRzLmxvbmdpdHVkZVxyXG4gICAgICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICAgICAgZGVzdGluYXRpb25zOiBbXHJcbiAgICAgICAgICAgICAgICAgIG5ldyBnb29nbGUubWFwcy5MYXRMbmcoXHJcbiAgICAgICAgICAgICAgICAgICAgZGVzdGluYXRpb24uY29vcmRzLmdwcy5sYW5nLFxyXG4gICAgICAgICAgICAgICAgICAgIGRlc3RpbmF0aW9uLmNvb3Jkcy5ncHMubGF0XHJcbiAgICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgICAgICB0cmF2ZWxNb2RlOiAnRFJJVklORycsXHJcbiAgICAgICAgICAgICAgICB1bml0U3lzdGVtOiBnb29nbGUubWFwcy5Vbml0U3lzdGVtLk1FVFJJQyxcclxuICAgICAgICAgICAgICAgIGF2b2lkSGlnaHdheXM6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgYXZvaWRUb2xsczogZmFsc2VcclxuICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgIGZ1bmN0aW9uIChyZXNwb25zZSwgc3RhdHVzKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoc3RhdHVzICE9PSAnT0snKSB7XHJcbiAgICAgICAgICAgICAgICAgIHJlamVjdCgnc29tZXRoaW5nIHdyb25nJylcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgYWdlbmNlV2l0aERpc3RhbmNlID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShkZXN0aW5hdGlvbikpXHJcblxyXG4gICAgICAgICAgICAgICAgYWdlbmNlV2l0aERpc3RhbmNlWydkaXN0YW5jZU9yaWdpbiddID1cclxuICAgICAgICAgICAgICAgICAgcmVzcG9uc2Uucm93c1swXS5lbGVtZW50c1swXVsnZGlzdGFuY2UnXVxyXG5cclxuICAgICAgICAgICAgICAgIHJlc29sdmUoYWdlbmNlV2l0aERpc3RhbmNlKVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgKVxyXG5cclxuICAgICAgICAgICAgbGV0IGxhdGxuZyA9IG5ldyBnb29nbGUubWFwcy5MYXRMbmcoXHJcbiAgICAgICAgICAgICAgcG9zLmNvb3Jkcy5sYXRpdHVkZSxcclxuICAgICAgICAgICAgICBwb3MuY29vcmRzLmxvbmdpdHVkZVxyXG4gICAgICAgICAgICApXHJcbiAgICAgICAgICAgIGxldCBtYXJrZXIgPSBuZXcgZ29vZ2xlLm1hcHMuTWFya2VyKHtcclxuICAgICAgICAgICAgICBwb3NpdGlvbjogbGF0bG5nXHJcbiAgICAgICAgICAgIH0pXHJcblxyXG4gICAgICAgICAgICBtYXJrZXIuc2V0TWFwKHdpbmRvdy5tYXApXHJcblxyXG4gICAgICAgICAgICB3aW5kb3cubWFwLnNldENlbnRlcihsYXRsbmcpXHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgIH0pXHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBzaG93TmVhckJ5IChlKSB7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxyXG5cclxuICAgICAgbmVhckJ5QnRuLmFkZENsYXNzKCdhbmltYXRlJykgLy8gYWRkIGFuaW1hdGlvbiBjbGFzc1xyXG5cclxuICAgICAgbGV0IGdldERpc3RhbmNlID0gZGlzdGFuY2VNYXRyaXgoKVxyXG5cclxuICAgICAgbGV0IGRpc3RhbmNlUHJvbWlzZXMgPSBbXVxyXG5cclxuICAgICAgZGF0YS5mb3JFYWNoKGFnZW5jZSA9PiB7XHJcbiAgICAgICAgZGlzdGFuY2VQcm9taXNlcy5wdXNoKGdldERpc3RhbmNlKGFnZW5jZSkpXHJcbiAgICAgIH0pXHJcblxyXG4gICAgICBsZXQgZGlzdGFuY2VSZXN1bHRzID0gUHJvbWlzZS5hbGwoZGlzdGFuY2VQcm9taXNlcylcclxuXHJcbiAgICAgIGRpc3RhbmNlUmVzdWx0c1xyXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICBzdGF0ZS5uZWFyQnlEYXRhID0gZGF0YS5zb3J0KChhLCBiKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiBhLmRpc3RhbmNlT3JpZ2luLnZhbHVlIC0gYi5kaXN0YW5jZU9yaWdpbi52YWx1ZVxyXG4gICAgICAgICAgfSlcclxuXHJcbiAgICAgICAgICBzdGF0ZS51c2VySW5wdXQgPSAncHJveGltaXTDqSBkZSB2b3VzJ1xyXG4gICAgICAgICAgc3RhdGUubmVhckJ5ID0gdHJ1ZVxyXG5cclxuICAgICAgICAgIG5lYXJCeUJ0bi5yZW1vdmVDbGFzcygnYW5pbWF0ZScpIC8vIHJlbW92ZSBhbmltYXRpb24gY2xhc3NcclxuICAgICAgICAgIG5lYXJCeUJ0bi5hZGRDbGFzcygnYWN0aXZlJykgLy8gYWN0aXZhdGVcclxuXHJcbiAgICAgICAgICBhcHBseUZpbHRlcnMoKVxyXG4gICAgICAgICAgcmVuZGVyKClcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5jYXRjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICBhbGVydCgnc29tZXRoaW5nIHdyb25nISEnKVxyXG4gICAgICAgIH0pXHJcbiAgICB9XHJcblxyXG4gICAgc2VhcmNoSW5wdXQub24oJ2lucHV0JywgaW5wdXRDaGFuZ2VzKVxyXG4gICAgZmlsdGVycy5vbignY2xpY2snLCBmaWx0ZXJDaGFuZ2VzKVxyXG5cclxuICAgIG5lYXJCeUJ0bi5vbignY2xpY2snLCBzaG93TmVhckJ5KVxyXG4gIH1cclxuXHJcbiAgLy8gJC5nZXRKU09OKCdodHRwOi8vbG9jYWxob3N0OjkwMDAvZGF0YS5qc29uJywgcHJvY2Vzc0RhdGEpXHJcblxyXG4gIHByb2Nlc3NEYXRhKGRhdGEpXHJcbn1cclxuXHJcbmV4cG9ydCBsZXQgYWp1c3RDb250cm9sU2l6ZSA9IGZ1bmN0aW9uICgpIHtcclxuICAvLyBEZWZpbmUgdGhlIGhlaWdodCBvZiB0aGUgbWFwXHJcbiAgY29uc3QgdG9wSGVhZGVySGVpZ2h0ID0gMzAwXHJcbiAgbGV0IG1hcEhlaWdodCA9ICQod2luZG93KS5oZWlnaHQoKSAtIHRvcEhlYWRlckhlaWdodFxyXG5cclxuICBpZiAobWFwSGVpZ2h0IDwgNDAwKSBtYXBIZWlnaHQgPSA0MDBcclxuXHJcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3NlbGVjdGVkLWNvbnRhaW5lcicpLm1heEhlaWdodCA9IGAke21hcEhlaWdodH1weGBcclxuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxyXG4gICAgJyNzdWdnZXN0aW9ucy1jb250YWluZXInXHJcbiAgKS5zdHlsZS5tYXhIZWlnaHQgPSBgJHttYXBIZWlnaHR9cHhgXHJcbn1cclxuXHJcbmV4cG9ydCBsZXQgdG9nZ2xlQ29udHJvbCA9IGZ1bmN0aW9uICgpIHtcclxuICAkKCcubWFwY29udHJvbF90b2dnbGUnKS5jbGljayhmdW5jdGlvbiAoKSB7XHJcbiAgICAkKCcubWFwY29udHJvbCcpLnRvZ2dsZUNsYXNzKCdtYXBjb250cm9sLS1oaWRlJylcclxuICB9KVxyXG59XHJcblxyXG5leHBvcnQgbGV0IGNhbGN1bGF0ZUFuZERpc3BsYXlSb3V0ZSA9IGZ1bmN0aW9uIChtYXAsIGRlc3RpbmF0aW9uKSB7XHJcbiAgdmFyIGRpcmVjdGlvbnNTZXJ2aWNlID0gbmV3IGdvb2dsZS5tYXBzLkRpcmVjdGlvbnNTZXJ2aWNlKClcclxuICB3aW5kb3cuZGlyZWN0aW9uc0Rpc3BsYXkgPVxyXG4gICAgd2luZG93LmRpcmVjdGlvbnNEaXNwbGF5IHx8XHJcbiAgICBuZXcgZ29vZ2xlLm1hcHMuRGlyZWN0aW9uc1JlbmRlcmVyKHtcclxuICAgICAgcHJlc2VydmVWaWV3cG9ydDogdHJ1ZVxyXG4gICAgfSlcclxuICB3aW5kb3cuZGlyZWN0aW9uc0Rpc3BsYXkuc2V0TWFwKG1hcClcclxuXHJcbiAgaWYgKHdpbmRvdy51cGRhdGVSb3V0ZVRpbWVyKSB7XHJcbiAgICBuYXZpZ2F0b3IuZ2VvbG9jYXRpb24uY2xlYXJXYXRjaCh3aW5kb3cudXBkYXRlUm91dGVUaW1lcilcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGVycm9ySGFuZGxlciAoZXJyKSB7XHJcbiAgICBpZiAoZXJyLmNvZGUgPT0gMSkge1xyXG4gICAgICBhbGVydCgnRXJyb3I6IEFjY2VzcyBpcyB0byB5b3VyIGxvY2F0aW9uIGlzIGRlbmllZCEnKVxyXG4gICAgfSBlbHNlIGlmIChlcnIuY29kZSA9PSAyKSB7XHJcbiAgICAgIGFsZXJ0KCdFcnJvcjogUG9zaXRpb24gaXMgdW5hdmFpbGFibGUhJylcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHdhdGNoUG9zaXRpb24gKHBvcykge1xyXG4gICAgZGlyZWN0aW9uc1NlcnZpY2Uucm91dGUoXHJcbiAgICAgIHtcclxuICAgICAgICBvcmlnaW46IG5ldyBnb29nbGUubWFwcy5MYXRMbmcoXHJcbiAgICAgICAgICBwb3MuY29vcmRzLmxhdGl0dWRlLFxyXG4gICAgICAgICAgcG9zLmNvb3Jkcy5sb25naXR1ZGVcclxuICAgICAgICApLFxyXG4gICAgICAgIGRlc3RpbmF0aW9uOiBkZXN0aW5hdGlvbixcclxuICAgICAgICB0cmF2ZWxNb2RlOiAnRFJJVklORydcclxuICAgICAgfSxcclxuICAgICAgZnVuY3Rpb24gKHJlc3BvbnNlLCBzdGF0dXMpIHtcclxuICAgICAgICBpZiAoc3RhdHVzID09PSAnT0snKSB7XHJcbiAgICAgICAgICB3aW5kb3cuZGlyZWN0aW9uc0Rpc3BsYXkuc2V0RGlyZWN0aW9ucyhyZXNwb25zZSlcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCd1cGRhdGVkJylcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgd2luZG93LmFsZXJ0KCdEaXJlY3Rpb25zIHJlcXVlc3QgZmFpbGVkIGR1ZSB0byAnICsgc3RhdHVzKVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgKVxyXG4gIH1cclxuXHJcbiAgd2luZG93LnVwZGF0ZVJvdXRlVGltZXIgPSBuYXZpZ2F0b3IuZ2VvbG9jYXRpb24ud2F0Y2hQb3NpdGlvbihcclxuICAgIHdhdGNoUG9zaXRpb24sXHJcbiAgICBlcnJvckhhbmRsZXJcclxuICApXHJcbn1cclxuXHJcbmV4cG9ydCBsZXQgYnVpbGRNYXBDYXJkSW5mbyA9IGZ1bmN0aW9uIChzZWxlY3RlZEVsZW1lbnQpIHtcclxuICByZXR1cm4gYDxkaXYgY2xhc3M9XCJtb3JlaW5mb19jb250ZW50XCI+XHJcbiAgPGRpdiBjbGFzcz1cIm1vcmVpbmZvX2hlYWRcIj5cclxuICAgIDxoMyBjbGFzcz1cIm1vcmVpbmZvX3RpdGxlXCIgaWQ9XCJpbmZvLW5hbWVcIj4ke3NlbGVjdGVkRWxlbWVudC5uYW1lfTwvaDM+XHJcbiAgICA8cCBjbGFzcz1cIm1vcmVpbmZvX2FkZHJlc3NcIiBpZD1cImluZm8tYWRkcmVzc1wiPiR7c2VsZWN0ZWRFbGVtZW50LmFkZHJlc3N9PC9wPlxyXG4gICAgPGRpdiBjbGFzcz1cIm1vcmVpbmZvX2FjdGlvbnNcIj5cclxuICAgICAgPGEgaHJlZj1cIiNcIiBpZD1cInNlbGVjdGVkLWNvbnRhaW5lci0tY2xvc2VcIj5SRVRPVVJORVI8L2E+XHJcbiAgICAgIDxhIGhyZWY9XCIjXCIgaWQ9XCJzZWxlY3RlZC1jb250YWluZXItLWRpcmVjdGlvblwiID5Hw4lOw4lSRVIgVU4gSVRJTsOJUkFJUkU8L2E+XHJcbiAgICA8L2Rpdj5cclxuICA8L2Rpdj5cclxuICA8ZGl2IGNsYXNzPVwibW9yZWluZm9fYm9keVwiPlxyXG4gICAgPGRpdiBjbGFzcz1cIm1vcmVpbmZvX3NlY3Rpb25cIj5cclxuICAgICAgPGg0PkNvb3Jkb25uw6llczwvaDQ+XHJcbiAgICAgIDxkaXYgY2xhc3M9XCJtb3JlaW5mb19saXN0XCI+XHJcbiAgICAgICAgPGRpdiBjbGFzcz1cIm1vcmVpbmZvX2xpc3QtaXRlbVwiPlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cImxlZnRcIj5cclxuICAgICAgICAgICAgPHNwYW4+RW1haWw8L3NwYW4+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJyaWdodFwiPlxyXG4gICAgICAgICAgICA8c3BhbiBpZD1cImluZm8tZW1haWxcIj4ke3NlbGVjdGVkRWxlbWVudC5jb29yZHMuZW1haWx9PC9zcGFuPlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPGRpdiBjbGFzcz1cIm1vcmVpbmZvX2xpc3QtaXRlbVwiPlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cImxlZnRcIj5cclxuICAgICAgICAgICAgPHNwYW4+VMOpbMOpcGhvbmU8L3NwYW4+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJyaWdodFwiPlxyXG4gICAgICAgICAgICA8c3BhbiBpZD1cImluZm8tcGhvbmVcIj4ke3NlbGVjdGVkRWxlbWVudC5jb29yZHMucGhvbmV9PC9zcGFuPlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPGRpdiBjbGFzcz1cIm1vcmVpbmZvX2xpc3QtaXRlbVwiPlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cImxlZnRcIj5cclxuICAgICAgICAgICAgPHNwYW4+RmF4PC9zcGFuPlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwicmlnaHRcIj5cclxuICAgICAgICAgICAgPHNwYW4gaWQ9XCJpbmZvLWZheFwiPiR7c2VsZWN0ZWRFbGVtZW50LmNvb3Jkcy5mYXh9PC9zcGFuPlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPGRpdiBjbGFzcz1cIm1vcmVpbmZvX2xpc3QtaXRlbVwiPlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cImxlZnRcIj5cclxuICAgICAgICAgICAgPHNwYW4+Q29vcmRzIEdQUzwvc3Bhbj5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cInJpZ2h0XCI+XHJcbiAgICAgICAgICAgIDxzcGFuPlxyXG4gICAgICAgICAgICAgIDxib2xkPlxyXG4gICAgICAgICAgICAgICAgTGF0aXR1ZGVcclxuICAgICAgICAgICAgICA8L2JvbGQ+IDogJHtzZWxlY3RlZEVsZW1lbnQuY29vcmRzLmdwcy5sYXR9IHxcclxuICAgICAgICAgICAgICA8Ym9sZD5cclxuICAgICAgICAgICAgICAgIExvbmdpdHVkZVxyXG4gICAgICAgICAgICAgIDwvYm9sZD4gOiAke3NlbGVjdGVkRWxlbWVudC5jb29yZHMuZ3BzLmxhbmd9IDwvc3Bhbj5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICA8L2Rpdj5cclxuICAgIDwvZGl2PlxyXG4gICAgPGRpdiBjbGFzcz1cIm1vcmVpbmZvX3NlY3Rpb25cIj5cclxuICAgICAgPGg0PkFnZW5jZSBsacOpZTwvaDQ+XHJcbiAgICAgIDxkaXYgY2xhc3M9XCJtb3JlaW5mb19jb250YWluZXJcIj5cclxuICAgICAgICA8aDU+JHtzZWxlY3RlZEVsZW1lbnQuZXh0ZW5zaW9uLm5hbWV9PC9oNT5cclxuICAgICAgICA8cCBjbGFzcz1cIm1vcmVpbmZvX2FkZHJlc3NcIj4ke3NlbGVjdGVkRWxlbWVudC5leHRlbnNpb24uYWRkcmVzc308L3A+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgPC9kaXY+XHJcbiAgICA8ZGl2IGNsYXNzPVwibW9yZWluZm9fc2VjdGlvblwiPlxyXG4gICAgICA8ZGl2IGNsYXNzPVwibW9yZWluZm9fbGlzdFwiPlxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJtb3JlaW5mb19saXN0LWl0ZW1cIj5cclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJsZWZ0XCI+XHJcbiAgICAgICAgICAgIDxzcGFuPkx1bmRpPC9zcGFuPlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwicmlnaHRcIj5cclxuICAgICAgICAgICAgPHNwYW4+JHtzZWxlY3RlZEVsZW1lbnQudGltZXRhYmxlLm1vbmRheX08L3NwYW4+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8ZGl2IGNsYXNzPVwibW9yZWluZm9fbGlzdC1pdGVtXCI+XHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwibGVmdFwiPlxyXG4gICAgICAgICAgICA8c3Bhbj5NYXJkaTwvc3Bhbj5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cInJpZ2h0XCI+XHJcbiAgICAgICAgICAgIDxzcGFuPiR7c2VsZWN0ZWRFbGVtZW50LnRpbWV0YWJsZS50dWVzZGF5fTwvc3Bhbj5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJtb3JlaW5mb19saXN0LWl0ZW1cIj5cclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJsZWZ0XCI+XHJcbiAgICAgICAgICAgIDxzcGFuPk1lcmNyZWRpPC9zcGFuPlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwicmlnaHRcIj5cclxuICAgICAgICAgICAgPHNwYW4+JHtzZWxlY3RlZEVsZW1lbnQudGltZXRhYmxlLndlZG5lc2RheX08L3NwYW4+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8ZGl2IGNsYXNzPVwibW9yZWluZm9fbGlzdC1pdGVtXCI+XHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwibGVmdFwiPlxyXG4gICAgICAgICAgICA8c3Bhbj5KZXVkaTwvc3Bhbj5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cInJpZ2h0XCI+XHJcbiAgICAgICAgICAgIDxzcGFuPiR7c2VsZWN0ZWRFbGVtZW50LnRpbWV0YWJsZS50aHVyc2RheX08L3NwYW4+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8ZGl2IGNsYXNzPVwibW9yZWluZm9fbGlzdC1pdGVtXCI+XHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwibGVmdFwiPlxyXG4gICAgICAgICAgICA8c3Bhbj5WZW5kcmVkaTwvc3Bhbj5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cInJpZ2h0XCI+XHJcbiAgICAgICAgICAgIDxzcGFuPiR7c2VsZWN0ZWRFbGVtZW50LnRpbWV0YWJsZS5mcmlkYXl9PC9zcGFuPlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPGRpdiBjbGFzcz1cIm1vcmVpbmZvX2xpc3QtaXRlbVwiPlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cImxlZnRcIj5cclxuICAgICAgICAgICAgPHNwYW4+U2FtZWRpPC9zcGFuPlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwicmlnaHRcIj5cclxuICAgICAgICAgICAgPHNwYW4+JHtzZWxlY3RlZEVsZW1lbnQudGltZXRhYmxlLnNhdHVyZGF5fTwvc3Bhbj5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJtb3JlaW5mb19saXN0LWl0ZW1cIj5cclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJsZWZ0XCI+XHJcbiAgICAgICAgICAgIDxzcGFuPkRpYW1hbmNoZTwvc3Bhbj5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cInJpZ2h0XCI+XHJcbiAgICAgICAgICAgIDxzcGFuPiR7c2VsZWN0ZWRFbGVtZW50LnRpbWV0YWJsZS5zdW5kYXl9PC9zcGFuPlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgPC9kaXY+XHJcbiAgPC9kaXY+XHJcbjwvZGl2PmBcclxufVxyXG4iLCJpbXBvcnQgeyBidWlsZE1hcENhcmRJbmZvIH0gZnJvbSAnLi4vLi4vY29tcG9uZW50cy9tYXAtY29udHJvbC9pbmRleC5qcydcclxuaW1wb3J0IHsgYWp1c3RDb250cm9sU2l6ZSB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvbWFwLWNvbnRyb2wvaW5kZXguanMnXHJcbmltcG9ydCB7IGNhbGN1bGF0ZUFuZERpc3BsYXlSb3V0ZSB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvbWFwLWNvbnRyb2wvaW5kZXguanMnXHJcbmltcG9ydCBkYXRhIGZyb20gJy4uLy4uL2Fzc2V0cy9qcy9kYXRhLmpzb24nXHJcblxyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiAoKSB7XHJcbiAgbGV0IG1hcENvbnRyb2xDb250YWluZXIgPSAkKCcubWFwY29udHJvbF9jb250YWluZXInKVxyXG4gIGxldCBtYXBDb250cm9sID0gJCgnLm1hcGNvbnRyb2wnKVxyXG4gIGxldCBzZWxlY3RlZENvbnRhaW5lciA9ICQoJyNzZWxlY3RlZC1jb250YWluZXInKVxyXG4gIGxldCBzdWdnZXN0aW9uc0NvbnRhaW5lciA9ICQoJyNzdWdnZXN0aW9ucy1jb250YWluZXInKVxyXG5cclxuICB3aW5kb3cubWFwTWFya2VycyA9IFtdXHJcblxyXG4gIGxldCBiaW5kTWFya2VycyA9IGZ1bmN0aW9uIChtYXAsIGxvY2F0aW9ucykge1xyXG4gICAgbGV0IG1hcmtlciwgbGF0bG5nXHJcblxyXG4gICAgbG9jYXRpb25zLmZvckVhY2goZnVuY3Rpb24gKGxvY2F0aW9uKSB7XHJcbiAgICAgIGxhdGxuZyA9IG5ldyBnb29nbGUubWFwcy5MYXRMbmcoXHJcbiAgICAgICAgbG9jYXRpb24uY29vcmRzLmdwcy5sYW5nLFxyXG4gICAgICAgIGxvY2F0aW9uLmNvb3Jkcy5ncHMubGF0XHJcbiAgICAgIClcclxuXHJcbiAgICAgIHZhciBpY29uID0ge1xyXG4gICAgICAgIHVybDogJ2Fzc2V0cy9pbWcvcGluLnN2ZycsIC8vIHVybFxyXG4gICAgICAgIHNjYWxlZFNpemU6IG5ldyBnb29nbGUubWFwcy5TaXplKDQwLCA0MCksIC8vIHNjYWxlZCBzaXplXHJcbiAgICAgICAgb3JpZ2luOiBuZXcgZ29vZ2xlLm1hcHMuUG9pbnQoMCwgMCksIC8vIG9yaWdpblxyXG4gICAgICAgIGFuY2hvcjogbmV3IGdvb2dsZS5tYXBzLlBvaW50KDIwLCA0MCkgLy8gYW5jaG9yXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIG1hcmtlciA9IG5ldyBnb29nbGUubWFwcy5NYXJrZXIoe1xyXG4gICAgICAgIHBvc2l0aW9uOiBsYXRsbmcsXHJcbiAgICAgICAgaWNvbjogaWNvblxyXG4gICAgICB9KVxyXG5cclxuICAgICAgd2luZG93Lm1hcE1hcmtlcnMucHVzaCh7XHJcbiAgICAgICAgbWFya2VyLFxyXG4gICAgICAgIHBvc2l0aW9uOiB7XHJcbiAgICAgICAgICBsYXQ6IGxvY2F0aW9uLmNvb3Jkcy5ncHMubGF0LFxyXG4gICAgICAgICAgbGFuZzogbG9jYXRpb24uY29vcmRzLmdwcy5sYW5nXHJcbiAgICAgICAgfVxyXG4gICAgICB9KVxyXG5cclxuICAgICAgbWFya2VyLnNldE1hcChtYXApXHJcblxyXG4gICAgICAvLyBiaWRpbmcgdGhlIGNsaWNrIGV2ZW50IHdpdGggZWFjaCBtYXJrZXJcclxuICAgICAgZ29vZ2xlLm1hcHMuZXZlbnQuYWRkTGlzdGVuZXIobWFya2VyLCAnY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgLy8gcmVtb3ZlIGFuaW1hdGlvbiBmcm9tIGFsbCBtYXJrZXJzXHJcbiAgICAgICAgd2luZG93Lm1hcE1hcmtlcnMuZm9yRWFjaCgoeyBtYXJrZXIgfSkgPT4ge1xyXG4gICAgICAgICAgbWFya2VyLnNldEFuaW1hdGlvbihudWxsKVxyXG4gICAgICAgIH0pXHJcblxyXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKHRoaXMpXHJcblxyXG4gICAgICAgIHRoaXMuc2V0QW5pbWF0aW9uKGdvb2dsZS5tYXBzLkFuaW1hdGlvbi5CT1VOQ0UpXHJcbiAgICAgICAgbWFwQ29udHJvbC5yZW1vdmVDbGFzcygnbWFwY29udHJvbC0taGlkZScpXHJcbiAgICAgICAgbWFwQ29udHJvbENvbnRhaW5lci5jc3MoJ2hlaWdodCcsICcyNDVweCcpXHJcbiAgICAgICAgbGV0IHNlbGVjdGVkSFRNTCA9IGJ1aWxkTWFwQ2FyZEluZm8obG9jYXRpb24pXHJcbiAgICAgICAgc2VsZWN0ZWRDb250YWluZXIuaHRtbChzZWxlY3RlZEhUTUwpXHJcbiAgICAgICAgYWp1c3RDb250cm9sU2l6ZSgpIC8vIGFqdXN0IHRoZSBtYXAgY29udHJvbCBzaXplXHJcbiAgICAgICAgJCgnLm1hcGNvbnRyb2xfaW5wdXQtbGVmdCcpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKSAvLyByZW1vdmUgYWN0aXZlIGZyb20gbG9jYWxpc2F0aW9uIGJ0blxyXG4gICAgICAgICQoJyNzZWxlY3RlZC1jb250YWluZXItLWNsb3NlJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgICAgICAgbWFwQ29udHJvbENvbnRhaW5lci5jc3MoJ2hlaWdodCcsICcxODZweCcpXHJcbiAgICAgICAgICBzZWxlY3RlZENvbnRhaW5lci5oaWRlKClcclxuICAgICAgICB9KVxyXG4gICAgICAgICQoJyNzZWxlY3RlZC1jb250YWluZXItLWRpcmVjdGlvbicpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICAgIGNhbGN1bGF0ZUFuZERpc3BsYXlSb3V0ZShcclxuICAgICAgICAgICAgd2luZG93Lm1hcCxcclxuICAgICAgICAgICAgbmV3IGdvb2dsZS5tYXBzLkxhdExuZyhcclxuICAgICAgICAgICAgICBsb2NhdGlvbi5jb29yZHMuZ3BzLmxhbmcsXHJcbiAgICAgICAgICAgICAgbG9jYXRpb24uY29vcmRzLmdwcy5sYXRcclxuICAgICAgICAgICAgKVxyXG4gICAgICAgICAgKVxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgc3VnZ2VzdGlvbnNDb250YWluZXIuaGlkZSgpXHJcbiAgICAgICAgc2VsZWN0ZWRDb250YWluZXIuc2hvdygpXHJcbiAgICAgIH0pXHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgbGV0IGFqdXN0TWFwU2l6ZSA9IGZ1bmN0aW9uIChtYXBIb2xkZXIpIHtcclxuICAgIC8vIERlZmluZSB0aGUgaGVpZ2h0IG9mIHRoZSBtYXBcclxuICAgIGNvbnN0IHRvcEhlYWRlckhlaWdodCA9IDUxXHJcbiAgICBsZXQgbWFwSGVpZ2h0ID0gJCh3aW5kb3cpLmhlaWdodCgpXHJcbiAgICBtYXBIb2xkZXIuc3R5bGUuaGVpZ2h0ID0gYCR7bWFwSGVpZ2h0IC0gdG9wSGVhZGVySGVpZ2h0fXB4YFxyXG4gIH1cclxuICBmdW5jdGlvbiBwcm9jZXNzTWFwIChkYXRhKSB7XHJcbiAgICAvLyBjb25zb2xlLmxvZyhkYXRhKVxyXG4gICAgJC5nZXRTY3JpcHQoXHJcbiAgICAgICdodHRwczovL21hcHMuZ29vZ2xlYXBpcy5jb20vbWFwcy9hcGkvanM/a2V5PUFJemFTeURDV0RfcTVOb0V5VmJsQzFtdFMyYmwwOGt1a3JuekRRcyZyZWdpb249TUEnLFxyXG4gICAgICBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgbGV0IGRlZmF1bHRQcm9wcyA9IHtcclxuICAgICAgICAgIG1hcFR5cGVJZDogZ29vZ2xlLm1hcHMuTWFwVHlwZUlkLlJPQURNQVAsXHJcbiAgICAgICAgICB6b29tOiAxNCxcclxuICAgICAgICAgIG1hcFR5cGVDb250cm9sOiBmYWxzZSxcclxuICAgICAgICAgIGZ1bGxzY3JlZW5Db250cm9sOiBmYWxzZVxyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgbWFwSG9sZGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21hcCcpXHJcbiAgICAgICAgaWYgKG1hcEhvbGRlcikge1xyXG4gICAgICAgICAgYWp1c3RNYXBTaXplKG1hcEhvbGRlcilcclxuXHJcbiAgICAgICAgICBpZiAobmF2aWdhdG9yLmdlb2xvY2F0aW9uKSB7XHJcbiAgICAgICAgICAgIG5hdmlnYXRvci5nZW9sb2NhdGlvbi5nZXRDdXJyZW50UG9zaXRpb24oXHJcbiAgICAgICAgICAgICAgZnVuY3Rpb24gKHBvcykge1xyXG4gICAgICAgICAgICAgICAgdmFyIG1hcFByb3AgPSB7XHJcbiAgICAgICAgICAgICAgICAgIGNlbnRlcjogbmV3IGdvb2dsZS5tYXBzLkxhdExuZyhcclxuICAgICAgICAgICAgICAgICAgICBwb3MuY29vcmRzLmxhdGl0dWRlLFxyXG4gICAgICAgICAgICAgICAgICAgIHBvcy5jb29yZHMubG9uZ2l0dWRlXHJcbiAgICAgICAgICAgICAgICAgICksXHJcbiAgICAgICAgICAgICAgICAgIG1hcFR5cGVJZDogZ29vZ2xlLm1hcHMuTWFwVHlwZUlkLlJPQURNQVAsXHJcbiAgICAgICAgICAgICAgICAgIHpvb206IDE0LFxyXG4gICAgICAgICAgICAgICAgICBtYXBUeXBlQ29udHJvbDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgIGZ1bGxzY3JlZW5Db250cm9sOiBmYWxzZVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHdpbmRvdy5tYXAgPSBuZXcgZ29vZ2xlLm1hcHMuTWFwKG1hcEhvbGRlciwgbWFwUHJvcClcclxuXHJcbiAgICAgICAgICAgICAgICBiaW5kTWFya2Vycyh3aW5kb3cubWFwLCBkYXRhKVxyXG4gICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgZnVuY3Rpb24gZXJyb3JIYW5kbGVyIChlcnIpIHtcclxuICAgICAgICAgICAgICAgIGlmIChlcnIuY29kZSA9PSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgIHdpbmRvdy5tYXAgPSBuZXcgZ29vZ2xlLm1hcHMuTWFwKG1hcEhvbGRlciwgZGVmYXVsdFByb3BzKVxyXG5cclxuICAgICAgICAgICAgICAgICAgd2luZG93Lm1hcC5zZXRDZW50ZXIoXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IGdvb2dsZS5tYXBzLkxhdExuZygzMS43OTE3MDIsIC03LjA5MjYyMDAwMDAwMDAxMSlcclxuICAgICAgICAgICAgICAgICAgKVxyXG5cclxuICAgICAgICAgICAgICAgICAgYmluZE1hcmtlcnMod2luZG93Lm1hcCwgZGF0YSlcclxuXHJcbiAgICAgICAgICAgICAgICAgIGFsZXJ0KCdFcnJvcjogQWNjZXNzIGlzIHRvIHlvdXIgbG9jYXRpb24gaXMgZGVuaWVkIScpXHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGVyci5jb2RlID09IDIpIHtcclxuICAgICAgICAgICAgICAgICAgYWxlcnQoJ0Vycm9yOiBQb3NpdGlvbiBpcyB1bmF2YWlsYWJsZSEnKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgKVxyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgd2luZG93Lm1hcCA9IG5ldyBnb29nbGUubWFwcy5NYXAobWFwSG9sZGVyLCBkZWZhdWx0UHJvcHMpXHJcblxyXG4gICAgICAgICAgICB3aW5kb3cubWFwLnNldENlbnRlcihcclxuICAgICAgICAgICAgICBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKDMxLjc5MTcwMiwgLTcuMDkyNjIwMDAwMDAwMDExKVxyXG4gICAgICAgICAgICApXHJcblxyXG4gICAgICAgICAgICBiaW5kTWFya2Vycyh3aW5kb3cubWFwLCBkYXRhKVxyXG5cclxuICAgICAgICAgICAgYWxlcnQoJ0dlb2xvY2F0aW9uIGlzIG5vdCBzdXBwb3J0ZWQgYnkgdGhpcyBicm93c2VyLicpXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICApXHJcbiAgfVxyXG5cclxuICAvLyAkLmdldEpTT04oJ2h0dHA6Ly9sb2NhbGhvc3Q6OTAwMC9kYXRhLmpzb24nLCBwcm9jZXNzTWFwKVxyXG4gIHByb2Nlc3NNYXAoZGF0YSlcclxuXHJcbiAgJCgnI21hcCcpLmNsaWNrKGZ1bmN0aW9uICgpIHtcclxuICAgICQoJyNzZWFyY2gtaW5wdXQnKS5ibHVyKClcclxuICAgIGNvbnNvbGUubG9nKCdtb3VzZSBkb3duJylcclxuICB9KVxyXG59XHJcbiIsImV4cG9ydCBsZXQgZ3JpZFNldHVwID0gZnVuY3Rpb24gKCkge1xyXG4gIHJldHVybiAkKCcuZ2FsbGVyeS1ncmlkJykubWFzb25yeSh7XHJcbiAgICBpdGVtU2VsZWN0b3I6ICcuZ3JpZC1pdGVtJyxcclxuICAgIGNvbHVtbldpZHRoOiAnLmdyaWQtc2l6ZXInLFxyXG4gICAgcGVyY2VudFBvc2l0aW9uOiB0cnVlXHJcbiAgfSlcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gKCkge1xyXG4gIGxldCB0YWdGaWx0ZXJzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnI21lZGlhY2VudGVyLWRldGFpbC1maWx0ZXJzIGEnKVxyXG4gIGxldCBhbGxGaWx0ZXJCdG4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbWVkaWFjZW50ZXItZGV0YWlsLWZpbHRlci1hbGwnKVxyXG4gIGxldCBtZWRpYUNlbnRlckhvbGRlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNtZWRpYWNlbnRlci1kZXRhaWwtaG9sZGVyJylcclxuXHJcbiAgaWYgKCFtZWRpYUNlbnRlckhvbGRlcikgcmV0dXJuXHJcblxyXG4gIGxldCBzdGF0ZSA9IHtcclxuICAgIGZpbHRlcnM6IFtdLFxyXG4gICAgZGF0YTogW1xyXG4gICAgICB7XHJcbiAgICAgICAgdHlwZTogJ2F1ZGlvJyxcclxuICAgICAgICB0YWdzOiBbJ1JTRScsICdGSU5BTkNFJywgJ0VOVFJFUFJFTkFSSUFUJ10sXHJcbiAgICAgICAgbWVkaWE6ICdhc3NldHMvaW1nL21lZGlhLWltZy5wbmcnXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB0eXBlOiAnaW1hZ2UnLFxyXG4gICAgICAgIHRhZ3M6IFsnUlNFJywgJ0ZJTkFOQ0UnLCAnRU5UUkVQUkVOQVJJQVQnLCAnREVWRUxPUFBFTUVOVCBEVVJBQkxFJ10sXHJcbiAgICAgICAgbWVkaWE6ICdhc3NldHMvaW1nL21lZGlhLWltZy5wbmcnXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB0eXBlOiAndmlkZW8nLFxyXG4gICAgICAgIHRhZ3M6IFsnUlNFJywgJ0ZJTkFOQ0UnLCAnRU5UUkVQUkVOQVJJQVQnLCAnREVWRUxPUFBFTUVOVCBEVVJBQkxFJ10sXHJcbiAgICAgICAgbWVkaWE6ICdhc3NldHMvaW1nL3Jlcy0yLnBuZydcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHR5cGU6ICdhdWRpbycsXHJcbiAgICAgICAgdGFnczogWydSU0UnLCAnREVWRUxPUFBFTUVOVCBEVVJBQkxFJ10sXHJcbiAgICAgICAgbWVkaWE6ICdhc3NldHMvaW1nL21lZGlhLWltZy5wbmcnXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB0eXBlOiAndmlkZW8nLFxyXG4gICAgICAgIHRhZ3M6IFsnUlNFJywgJ0ZJTkFOQ0UnLCAnREVWRUxPUFBFTUVOVCBEVVJBQkxFJ10sXHJcbiAgICAgICAgbWVkaWE6ICdhc3NldHMvaW1nL3Jlcy0yLnBuZydcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHR5cGU6ICdpbWFnZScsXHJcbiAgICAgICAgdGFnczogWydSU0UnLCAnRklOQU5DRScsICdFTlRSRVBSRU5BUklBVCcsICdERVZFTE9QUEVNRU5UIERVUkFCTEUnXSxcclxuICAgICAgICBtZWRpYTogJ2Fzc2V0cy9pbWcvbWVkaWEtaW1nLnBuZydcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHR5cGU6ICdpbWFnZScsXHJcbiAgICAgICAgdGFnczogWydSU0UnXSxcclxuICAgICAgICBtZWRpYTogJ2Fzc2V0cy9pbWcvbWVkaWEtaW1nLnBuZydcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHR5cGU6ICdhdWRpbycsXHJcbiAgICAgICAgdGFnczogWydSU0UnLCAnRklOQU5DRScsICdFTlRSRVBSRU5BUklBVCddLFxyXG4gICAgICAgIG1lZGlhOiAnYXNzZXRzL2ltZy9tZWRpYS1pbWcucG5nJ1xyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgdHlwZTogJ2ltYWdlJyxcclxuICAgICAgICB0YWdzOiBbJ1JTRScsICdGSU5BTkNFJywgJ0VOVFJFUFJFTkFSSUFUJywgJ0RFVkVMT1BQRU1FTlQgRFVSQUJMRSddLFxyXG4gICAgICAgIG1lZGlhOiAnYXNzZXRzL2ltZy9tZWRpYS1pbWcucG5nJ1xyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgdHlwZTogJ3ZpZGVvJyxcclxuICAgICAgICB0YWdzOiBbJ1JTRScsICdGSU5BTkNFJywgJ0VOVFJFUFJFTkFSSUFUJywgJ0RFVkVMT1BQRU1FTlQgRFVSQUJMRSddLFxyXG4gICAgICAgIG1lZGlhOiAnYXNzZXRzL2ltZy9yZXMtMi5wbmcnXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB0eXBlOiAnYXVkaW8nLFxyXG4gICAgICAgIHRhZ3M6IFsnUlNFJywgJ0RFVkVMT1BQRU1FTlQgRFVSQUJMRSddLFxyXG4gICAgICAgIG1lZGlhOiAnYXNzZXRzL2ltZy9tZWRpYS1pbWcucG5nJ1xyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgdHlwZTogJ3ZpZGVvJyxcclxuICAgICAgICB0YWdzOiBbJ1JTRScsICdGSU5BTkNFJywgJ0RFVkVMT1BQRU1FTlQgRFVSQUJMRSddLFxyXG4gICAgICAgIG1lZGlhOiAnYXNzZXRzL2ltZy9yZXMtMi5wbmcnXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB0eXBlOiAnaW1hZ2UnLFxyXG4gICAgICAgIHRhZ3M6IFsnUlNFJywgJ0ZJTkFOQ0UnLCAnRU5UUkVQUkVOQVJJQVQnLCAnREVWRUxPUFBFTUVOVCBEVVJBQkxFJ10sXHJcbiAgICAgICAgbWVkaWE6ICdhc3NldHMvaW1nL21lZGlhLWltZy5wbmcnXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB0eXBlOiAnaW1hZ2UnLFxyXG4gICAgICAgIHRhZ3M6IFsnUlNFJ10sXHJcbiAgICAgICAgbWVkaWE6ICdhc3NldHMvaW1nL21lZGlhLWltZy5wbmcnXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB0eXBlOiAnYXVkaW8nLFxyXG4gICAgICAgIHRhZ3M6IFsnUlNFJywgJ0ZJTkFOQ0UnLCAnRU5UUkVQUkVOQVJJQVQnXSxcclxuICAgICAgICBtZWRpYTogJ2Fzc2V0cy9pbWcvbWVkaWEtaW1nLnBuZydcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHR5cGU6ICdpbWFnZScsXHJcbiAgICAgICAgdGFnczogWydSU0UnLCAnRklOQU5DRScsICdFTlRSRVBSRU5BUklBVCcsICdERVZFTE9QUEVNRU5UIERVUkFCTEUnXSxcclxuICAgICAgICBtZWRpYTogJ2Fzc2V0cy9pbWcvbWVkaWEtaW1nLnBuZydcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHR5cGU6ICd2aWRlbycsXHJcbiAgICAgICAgdGFnczogWydSU0UnLCAnRklOQU5DRScsICdFTlRSRVBSRU5BUklBVCcsICdERVZFTE9QUEVNRU5UIERVUkFCTEUnXSxcclxuICAgICAgICBtZWRpYTogJ2Fzc2V0cy9pbWcvcmVzLTIucG5nJ1xyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgdHlwZTogJ2F1ZGlvJyxcclxuICAgICAgICB0YWdzOiBbJ1JTRScsICdERVZFTE9QUEVNRU5UIERVUkFCTEUnXSxcclxuICAgICAgICBtZWRpYTogJ2Fzc2V0cy9pbWcvbWVkaWEtaW1nLnBuZydcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHR5cGU6ICd2aWRlbycsXHJcbiAgICAgICAgdGFnczogWydSU0UnLCAnRklOQU5DRScsICdERVZFTE9QUEVNRU5UIERVUkFCTEUnXSxcclxuICAgICAgICBtZWRpYTogJ2Fzc2V0cy9pbWcvcmVzLTIucG5nJ1xyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgdHlwZTogJ2ltYWdlJyxcclxuICAgICAgICB0YWdzOiBbJ1JTRScsICdGSU5BTkNFJywgJ0VOVFJFUFJFTkFSSUFUJywgJ0RFVkVMT1BQRU1FTlQgRFVSQUJMRSddLFxyXG4gICAgICAgIG1lZGlhOiAnYXNzZXRzL2ltZy9tZWRpYS1pbWcucG5nJ1xyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgdHlwZTogJ2ltYWdlJyxcclxuICAgICAgICB0YWdzOiBbJ1JTRSddLFxyXG4gICAgICAgIG1lZGlhOiAnYXNzZXRzL2ltZy9tZWRpYS1pbWcucG5nJ1xyXG4gICAgICB9XHJcbiAgICBdXHJcbiAgfVxyXG5cclxuICBsZXQgJGdyaWRcclxuXHJcbiAgZnVuY3Rpb24gY2xlYW5UYWcgKHRhZ0ZpbHRlcikge1xyXG4gICAgdGFnRmlsdGVyID0gdGFnRmlsdGVyLnRyaW0oKS50b0xvd2VyQ2FzZSgpXHJcbiAgICBpZiAodGFnRmlsdGVyWzBdID09ICcjJykge1xyXG4gICAgICByZXR1cm4gdGFnRmlsdGVyLnNsaWNlKDEpXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRhZ0ZpbHRlclxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gYXBwbHlGaWx0ZXJzICgpIHtcclxuICAgICQoJy5nYWxsZXJ5LWdyaWQgPiAuZ3JpZC1pdGVtJykuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgIGxldCBub3RGb3VuZCA9IHRydWVcclxuICAgICAgJCh0aGlzKS5maW5kKCcuZ2FsbGVyeS1ncmlkX3RhZ3MgPiBhJykuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKFxyXG4gICAgICAgICAgc3RhdGUuZmlsdGVycy5pbmNsdWRlcygkKHRoaXMpLnRleHQoKS50cmltKCkuc2xpY2UoMSkudG9Mb3dlckNhc2UoKSlcclxuICAgICAgICApIHtcclxuICAgICAgICAgIG5vdEZvdW5kID0gZmFsc2VcclxuICAgICAgICB9XHJcbiAgICAgIH0pXHJcbiAgICAgIGlmIChub3RGb3VuZCkge1xyXG4gICAgICAgICQodGhpcykuaGlkZSgpXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgJCh0aGlzKS5zaG93KClcclxuICAgICAgfVxyXG4gICAgICBjb25zb2xlLmxvZyhub3RGb3VuZClcclxuICAgICAgJGdyaWQubWFzb25yeSgnbGF5b3V0JylcclxuICAgIH0pXHJcblxyXG4gICAgaWYgKHN0YXRlLmZpbHRlcnMubGVuZ3RoIDw9IDApIHtcclxuICAgICAgJCgnLmdhbGxlcnktZ3JpZCA+IC5ncmlkLWl0ZW0nKS5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAkKHRoaXMpLnNob3coKVxyXG4gICAgICAgICRncmlkLm1hc29ucnkoJ2xheW91dCcpXHJcbiAgICAgIH0pXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBjaGFuZ2VGaWx0ZXJzIChlKSB7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KClcclxuXHJcbiAgICB0aGlzLmNsYXNzTGlzdC50b2dnbGUoJ2FjdGl2ZScpXHJcblxyXG4gICAgc3RhdGUuZmlsdGVycyA9IFtdXHJcblxyXG4gICAgJCgnI21lZGlhY2VudGVyLWRldGFpbC1maWx0ZXJzIGEnKS5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgaWYgKCQodGhpcykuaGFzQ2xhc3MoJ2FjdGl2ZScpKSB7XHJcbiAgICAgICAgc3RhdGUuZmlsdGVycy5wdXNoKGNsZWFuVGFnKCQodGhpcykudGV4dCgpKSlcclxuICAgICAgfVxyXG4gICAgfSlcclxuXHJcbiAgICBpZiAoc3RhdGUuZmlsdGVycy5sZW5ndGggPiAwKSB7XHJcbiAgICAgIGFsbEZpbHRlckJ0bi5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgYWxsRmlsdGVyQnRuLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpXHJcbiAgICB9XHJcblxyXG4gICAgYXBwbHlGaWx0ZXJzKClcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGluaXQgKCkge1xyXG4gICAgbGV0IG5ld0l0ZW1zID0gc3RhdGUuZGF0YS5tYXAocG9zdCA9PiB7XHJcbiAgICAgIGlmIChwb3N0LnR5cGUgPT0gJ2F1ZGlvJykge1xyXG4gICAgICAgIHJldHVybiBgPGRpdiBjbGFzcz1cImdyaWQtaXRlbVwiPlxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJnYWxsZXJ5LWdyaWRfZWxlbWVudCBnYWxsZXJ5LWdyaWRfZWxlbWVudC0tZW1wdHlcIj5cclxuICAgICAgICAgICAgPGEgY2xhc3M9XCJzd2lwZWJveCBzd2lwZWJveC0tYXVkaW9cIiBocmVmPVwiJHtwb3N0Lm1lZGlhfVwiPlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNvbnRlbnRcIj48L2Rpdj5cclxuICAgICAgICAgICAgPC9hPlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZ2FsbGVyeS1ncmlkX3RhZ3NcIj5cclxuICAgICAgICAgICAgICAgIDxhIGhyZWY9XCIjXCIgY2xhc3M9XCJidG4gYnRuLS10YWcgbWItcyBtci1zXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgI0lOU1RJVFVUSU9OTkVMTEVcclxuICAgICAgICAgICAgICAgIDwvYT5cclxuICAgICAgICAgICAgICAgIDxhIGhyZWY9XCIjXCIgY2xhc3M9XCJidG4gYnRuLS10YWcgbWItcyBtci1zXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgI1BBUlRJQ1VMSUVSU1xyXG4gICAgICAgICAgICAgICAgPC9hPlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8L2Rpdj5cclxuICAgIDwvZGl2PmBcclxuICAgICAgfSBlbHNlIGlmIChwb3N0LnR5cGUgPT0gJ3ZpZGVvJykge1xyXG4gICAgICAgIHJldHVybiBgPGRpdiBjbGFzcz1cImdyaWQtaXRlbVwiPlxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJnYWxsZXJ5LWdyaWRfZWxlbWVudCBnYWxsZXJ5LWdyaWRfZWxlbWVudC0tMlwiPlxyXG4gICAgICAgICAgICA8YSBjbGFzcz1cInN3aXBlYm94IHN3aXBlYm94LS12aWRlb1wiIGhyZWY9XCIke3Bvc3QubWVkaWF9XCI+XHJcbiAgICAgICAgICAgICAgICA8aW1nIHNyYz1cIiR7cG9zdC5tZWRpYX1cIiBhbHQ9XCJcIj5cclxuICAgICAgICAgICAgPC9hPlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZ2FsbGVyeS1ncmlkX3RhZ3NcIj5cclxuICAgICAgICAgICAgICAgIDxhIGhyZWY9XCIjXCIgY2xhc3M9XCJidG4gYnRuLS10YWcgbWItcyBtci1zXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgI0lOU1RJVFVUSU9OTkVMTEVcclxuICAgICAgICAgICAgICAgIDwvYT5cclxuICAgICAgICAgICAgICAgIDxhIGhyZWY9XCIjXCIgY2xhc3M9XCJidG4gYnRuLS10YWcgbWItcyBtci1zXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgI1BBUlRJQ1VMSUVSU1xyXG4gICAgICAgICAgICAgICAgPC9hPlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8L2Rpdj5cclxuICAgIDwvZGl2PmBcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICByZXR1cm4gYDxkaXYgY2xhc3M9XCJncmlkLWl0ZW1cIj5cclxuICAgICAgICA8ZGl2IGNsYXNzPVwiZ2FsbGVyeS1ncmlkX2VsZW1lbnQgZ2FsbGVyeS1ncmlkX2VsZW1lbnQtLTJcIj5cclxuICAgICAgICAgICAgPGEgY2xhc3M9XCJzd2lwZWJveCBzd2lwZWJveC0taW1nXCIgaHJlZj1cIiR7cG9zdC5tZWRpYX1cIj5cclxuICAgICAgICAgICAgICAgIDxpbWcgc3JjPVwiJHtwb3N0Lm1lZGlhfVwiIGFsdD1cIlwiPlxyXG4gICAgICAgICAgICA8L2E+XHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJnYWxsZXJ5LWdyaWRfdGFnc1wiPlxyXG4gICAgICAgICAgICAke3Bvc3QudGFnc1xyXG4gICAgICAgICAgLm1hcCh0YWcgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gYDxhIGhyZWY9XCIjXCIgY2xhc3M9XCJidG4gYnRuLS10YWcgbWItcyBtci1zXCI+XHJcbiAgICAgICAgICAgICAgIyR7dGFnfVxyXG4gICAgICAgICAgICA8L2E+YFxyXG4gICAgICAgICAgfSlcclxuICAgICAgICAgIC5qb2luKCcnKX1cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICA8L2Rpdj5gXHJcbiAgICAgIH1cclxuICAgIH0pXHJcblxyXG4gICAgbWVkaWFDZW50ZXJIb2xkZXIuaW5uZXJIVE1MID0gW1xyXG4gICAgICAnPGRpdiBjbGFzcz1cImdyaWQtc2l6ZXJcIj48L2Rpdj4nLFxyXG4gICAgICAuLi5uZXdJdGVtc1xyXG4gICAgXS5qb2luKCcnKVxyXG5cclxuICAgICQod2luZG93KS5vbignbG9hZCcsICgpID0+IHtcclxuICAgICAgJGdyaWQgPSBncmlkU2V0dXAoKVxyXG4gICAgfSlcclxuXHJcbiAgICAvLyBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgIC8vICAgJGdyaWQgPSBncmlkU2V0dXAoKVxyXG4gICAgLy8gICBjb25zb2xlLmxvZygnd2UgYXJlIGluJylcclxuICAgIC8vIH0sIDMwMDApXHJcbiAgfVxyXG5cclxuICBpbml0KClcclxuXHJcbiAgYWxsRmlsdGVyQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICAgIGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgc3RhdGUuZmlsdGVycyA9IFtdXHJcbiAgICAkKCcjbWVkaWFjZW50ZXItZGV0YWlsLWZpbHRlcnMgYScpLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKCcuYWN0aXZlJylcclxuICAgIH0pXHJcbiAgICB0aGlzLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpXHJcbiAgICBhcHBseUZpbHRlcnMoKVxyXG4gIH0pXHJcblxyXG4gICQoJyNtZWRpYWNlbnRlci1kZXRhaWwtZmlsdGVycyBhJykuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAkKHRoaXMpLm9uKCdjbGljaycsIGNoYW5nZUZpbHRlcnMpXHJcbiAgfSlcclxufVxyXG4iLCJpbXBvcnQgRGF0ZUZpbHRlciBmcm9tICcuLi8uLi9jb21wb25lbnRzL2RhdGUtZmlsdGVyL2luZGV4LmpzJ1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gKCkge1xyXG4gIGxldCB0YWdGaWx0ZXJzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnI21lZGlhY2VudGVyLWZpbHRlcnMgYScpXHJcbiAgbGV0IG1lZGlhY2VudGVySG9sZGVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21lZGlhY2VudGVyLWhvbGRlcicpXHJcbiAgbGV0IHN0YXJ0RGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zdGFydCcpXHJcbiAgbGV0IGVuZERhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuZW5kJylcclxuICBsZXQgYWxsRmlsdGVyQnRuID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21lZGlhY2VudGVyLWZpbHRlci1hbGwnKVxyXG5cclxuICBpZiAodGFnRmlsdGVycy5sZW5ndGggPD0gMCB8fCAhbWVkaWFjZW50ZXJIb2xkZXIpIHJldHVyblxyXG5cclxuICBsZXQgc3RhdGUgPSB7XHJcbiAgICBmaWx0ZXJzOiBbXSxcclxuICAgIGRhdGVGaWx0ZXI6IHtcclxuICAgICAgZnJvbTogJycsXHJcbiAgICAgIHRvOiAnJ1xyXG4gICAgfSxcclxuICAgIG9yZGVyOiAnZGVzYycsXHJcbiAgICBtYXg6IDMsXHJcbiAgICBkYXRhOiBbXHJcbiAgICAgIHtcclxuICAgICAgICB0YWdzOiBbJ1JTRScsICdGSU5BTkNFJywgJ0VOVFJFUFJFTkFSSUFUJ10sXHJcbiAgICAgICAgZGF0ZTogJzIxLzA3LzIwMTcnLFxyXG4gICAgICAgIHRpdGxlOiAnSElTVE9JUkVTIFBPUFVMQUlSRVMnLFxyXG4gICAgICAgIGNvbnRlbnQ6IGBMYSBjYW1wYWduZSDigJxIaXN0b2lyZXMgcG9wdWxhaXJlc+KAnSBhZG9wdGUgdW5lIGTDqW1hcmNoZSBlbmNvcmUgcGx1cyBwcm9jaGUgZGVzIHByw6lvY2N1cGF0aW9ucyBkZXMgZ2VucyA6IGNlIHNvbnQgZGVzIGhpc3RvaXJlc1xyXG4gICAgICAgICAgICAgICAgcsOpZWxsZXMgZGUgTWFyb2NhaW5zIGlzc3VzIGRlIHRvdXRlcyBsZXMgY2xhc3NlcyBzb2NpYWxlcyBldCBxdWkgb250IHLDqXVzc2kgw6AgYXR0ZWluZHJlIGxldXJzIG9iamVjdGlmcyBkYW5zXHJcbiAgICAgICAgICAgICAgICBkaWZmw6lyZW50cyBzZWN0ZXVycyBkZSBsYSB2aWUgZ3LDomNlIGF1IHNvdXRpZW4gZGUgbGV1ciBiYW5xdWUuYCxcclxuICAgICAgICBpbWFnZTogJ2Fzc2V0cy9pbWcvbWVkaWEtaW1nLnBuZydcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHRpdGxlOiAnSElTVE9JUkVTIFBPUFVMQUlSRVMnLFxyXG4gICAgICAgIHRhZ3M6IFsnUlNFJ10sXHJcbiAgICAgICAgZGF0ZTogJzI5LzA3LzIwMTcnLFxyXG4gICAgICAgIGNvbnRlbnQ6IGBMYSBjYW1wYWduZSDigJxIaXN0b2lyZXMgcG9wdWxhaXJlc+KAnSBhZG9wdGUgdW5lIGTDqW1hcmNoZSBlbmNvcmUgcGx1cyBwcm9jaGUgZGVzIHByw6lvY2N1cGF0aW9ucyBkZXMgZ2VucyA6IGNlIHNvbnQgZGVzIGhpc3RvaXJlc1xyXG4gICAgICAgIHLDqWVsbGVzIGRlIE1hcm9jYWlucyBpc3N1cyBkZSB0b3V0ZXMgbGVzIGNsYXNzZXMgc29jaWFsZXMgZXQgcXVpIG9udCByw6l1c3NpIMOgIGF0dGVpbmRyZSBsZXVycyBvYmplY3RpZnMgZGFuc1xyXG4gICAgICAgIGRpZmbDqXJlbnRzIHNlY3RldXJzIGRlIGxhIHZpZSBncsOiY2UgYXUgc291dGllbiBkZSBsZXVyIGJhbnF1ZS5gLFxyXG4gICAgICAgIGltYWdlOiAnYXNzZXRzL2ltZy9tZWRpYS1pbWcucG5nJ1xyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgdGFnczogWydSU0UnLCAnRU5UUkVQUkVOQVJJQVQnXSxcclxuICAgICAgICBkYXRlOiAnMjIvMDcvMjAxNycsXHJcbiAgICAgICAgdGl0bGU6ICdISVNUT0lSRVMgUE9QVUxBSVJFUycsXHJcbiAgICAgICAgY29udGVudDogYExhIGNhbXBhZ25lIOKAnEhpc3RvaXJlcyBwb3B1bGFpcmVz4oCdIGFkb3B0ZSB1bmUgZMOpbWFyY2hlIGVuY29yZSBwbHVzIHByb2NoZSBkZXMgcHLDqW9jY3VwYXRpb25zIGRlcyBnZW5zIDogY2Ugc29udCBkZXMgaGlzdG9pcmVzXHJcbiAgICAgICAgICAgICAgICByw6llbGxlcyBkZSBNYXJvY2FpbnMgaXNzdXMgZGUgdG91dGVzIGxlcyBjbGFzc2VzIHNvY2lhbGVzIGV0IHF1aSBvbnQgcsOpdXNzaSDDoCBhdHRlaW5kcmUgbGV1cnMgb2JqZWN0aWZzIGRhbnNcclxuICAgICAgICAgICAgICAgIGRpZmbDqXJlbnRzIHNlY3RldXJzIGRlIGxhIHZpZSBncsOiY2UgYXUgc291dGllbiBkZSBsZXVyIGJhbnF1ZS5gLFxyXG4gICAgICAgIGltYWdlOiAnYXNzZXRzL2ltZy9tZWRpYS1pbWcucG5nJ1xyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgdGFnczogWydSU0UnLCAnREVWRUxPUFBFTUVOVCBEVVJBQkxFJ10sXHJcbiAgICAgICAgZGF0ZTogJzIzLzA3LzIwMTcnLFxyXG4gICAgICAgIHRpdGxlOiAnSElTVE9JUkVTIFBPUFVMQUlSRVMnLFxyXG4gICAgICAgIGNvbnRlbnQ6IGBMYSBjYW1wYWduZSDigJxIaXN0b2lyZXMgcG9wdWxhaXJlc+KAnSBhZG9wdGUgdW5lIGTDqW1hcmNoZSBlbmNvcmUgcGx1cyBwcm9jaGUgZGVzIHByw6lvY2N1cGF0aW9ucyBkZXMgZ2VucyA6IGNlIHNvbnQgZGVzIGhpc3RvaXJlc1xyXG4gICAgICAgICAgICAgICAgcsOpZWxsZXMgZGUgTWFyb2NhaW5zIGlzc3VzIGRlIHRvdXRlcyBsZXMgY2xhc3NlcyBzb2NpYWxlcyBldCBxdWkgb250IHLDqXVzc2kgw6AgYXR0ZWluZHJlIGxldXJzIG9iamVjdGlmcyBkYW5zXHJcbiAgICAgICAgICAgICAgICBkaWZmw6lyZW50cyBzZWN0ZXVycyBkZSBsYSB2aWUgZ3LDomNlIGF1IHNvdXRpZW4gZGUgbGV1ciBiYW5xdWUuYCxcclxuICAgICAgICBpbWFnZTogJ2Fzc2V0cy9pbWcvbWVkaWEtaW1nLnBuZydcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHRhZ3M6IFsnUlNFJ10sXHJcbiAgICAgICAgZGF0ZTogJzIxLzA3LzIwMTcnLFxyXG4gICAgICAgIHRpdGxlOiAnSElTVE9JUkVTIFBPUFVMQUlSRVMnLFxyXG4gICAgICAgIGNvbnRlbnQ6IGBMYSBjYW1wYWduZSDigJxIaXN0b2lyZXMgcG9wdWxhaXJlc+KAnSBhZG9wdGUgdW5lIGTDqW1hcmNoZSBlbmNvcmUgcGx1cyBwcm9jaGUgZGVzIHByw6lvY2N1cGF0aW9ucyBkZXMgZ2VucyA6IGNlIHNvbnQgZGVzIGhpc3RvaXJlc1xyXG4gICAgICAgICAgICAgICAgcsOpZWxsZXMgZGUgTWFyb2NhaW5zIGlzc3VzIGRlIHRvdXRlcyBsZXMgY2xhc3NlcyBzb2NpYWxlcyBldCBxdWkgb250IHLDqXVzc2kgw6AgYXR0ZWluZHJlIGxldXJzIG9iamVjdGlmcyBkYW5zXHJcbiAgICAgICAgICAgICAgICBkaWZmw6lyZW50cyBzZWN0ZXVycyBkZSBsYSB2aWUgZ3LDomNlIGF1IHNvdXRpZW4gZGUgbGV1ciBiYW5xdWUuYCxcclxuICAgICAgICBpbWFnZTogJ2Fzc2V0cy9pbWcvbWVkaWEtaW1nLnBuZydcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHRhZ3M6IFsnUlNFJywgJ0ZJTkFOQ0UnXSxcclxuICAgICAgICBkYXRlOiAnMjQvMDcvMjAxNycsXHJcbiAgICAgICAgdGl0bGU6ICdISVNUT0lSRVMgUE9QVUxBSVJFUycsXHJcbiAgICAgICAgY29udGVudDogYExhIGNhbXBhZ25lIOKAnEhpc3RvaXJlcyBwb3B1bGFpcmVz4oCdIGFkb3B0ZSB1bmUgZMOpbWFyY2hlIGVuY29yZSBwbHVzIHByb2NoZSBkZXMgcHLDqW9jY3VwYXRpb25zIGRlcyBnZW5zIDogY2Ugc29udCBkZXMgaGlzdG9pcmVzXHJcbiAgICAgICAgICAgICAgICByw6llbGxlcyBkZSBNYXJvY2FpbnMgaXNzdXMgZGUgdG91dGVzIGxlcyBjbGFzc2VzIHNvY2lhbGVzIGV0IHF1aSBvbnQgcsOpdXNzaSDDoCBhdHRlaW5kcmUgbGV1cnMgb2JqZWN0aWZzIGRhbnNcclxuICAgICAgICAgICAgICAgIGRpZmbDqXJlbnRzIHNlY3RldXJzIGRlIGxhIHZpZSBncsOiY2UgYXUgc291dGllbiBkZSBsZXVyIGJhbnF1ZS5gLFxyXG4gICAgICAgIGltYWdlOiAnYXNzZXRzL2ltZy9tZWRpYS1pbWcucG5nJ1xyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgdGFnczogWydSU0UnLCAnRklOQU5DRSddLFxyXG4gICAgICAgIGRhdGU6ICcyNS8wNy8yMDE3JyxcclxuICAgICAgICB0aXRsZTogJ0hJU1RPSVJFUyBQT1BVTEFJUkVTJyxcclxuICAgICAgICBjb250ZW50OiBgTGEgY2FtcGFnbmUg4oCcSGlzdG9pcmVzIHBvcHVsYWlyZXPigJ0gYWRvcHRlIHVuZSBkw6ltYXJjaGUgZW5jb3JlIHBsdXMgcHJvY2hlIGRlcyBwcsOpb2NjdXBhdGlvbnMgZGVzIGdlbnMgOiBjZSBzb250IGRlcyBoaXN0b2lyZXNcclxuICAgICAgICAgICAgICAgIHLDqWVsbGVzIGRlIE1hcm9jYWlucyBpc3N1cyBkZSB0b3V0ZXMgbGVzIGNsYXNzZXMgc29jaWFsZXMgZXQgcXVpIG9udCByw6l1c3NpIMOgIGF0dGVpbmRyZSBsZXVycyBvYmplY3RpZnMgZGFuc1xyXG4gICAgICAgICAgICAgICAgZGlmZsOpcmVudHMgc2VjdGV1cnMgZGUgbGEgdmllIGdyw6JjZSBhdSBzb3V0aWVuIGRlIGxldXIgYmFucXVlLmAsXHJcbiAgICAgICAgaW1hZ2U6ICdhc3NldHMvaW1nL21lZGlhLWltZy5wbmcnXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB0YWdzOiBbJ1JTRSddLFxyXG4gICAgICAgIGRhdGU6ICcyNi8wNy8yMDE3JyxcclxuICAgICAgICB0aXRsZTogJ0hJU1RPSVJFUyBQT1BVTEFJUkVTJyxcclxuICAgICAgICBjb250ZW50OiBgTGEgY2FtcGFnbmUg4oCcSGlzdG9pcmVzIHBvcHVsYWlyZXPigJ0gYWRvcHRlIHVuZSBkw6ltYXJjaGUgZW5jb3JlIHBsdXMgcHJvY2hlIGRlcyBwcsOpb2NjdXBhdGlvbnMgZGVzIGdlbnMgOiBjZSBzb250IGRlcyBoaXN0b2lyZXNcclxuICAgICAgICAgICAgICAgIHLDqWVsbGVzIGRlIE1hcm9jYWlucyBpc3N1cyBkZSB0b3V0ZXMgbGVzIGNsYXNzZXMgc29jaWFsZXMgZXQgcXVpIG9udCByw6l1c3NpIMOgIGF0dGVpbmRyZSBsZXVycyBvYmplY3RpZnMgZGFuc1xyXG4gICAgICAgICAgICAgICAgZGlmZsOpcmVudHMgc2VjdGV1cnMgZGUgbGEgdmllIGdyw6JjZSBhdSBzb3V0aWVuIGRlIGxldXIgYmFucXVlLmAsXHJcbiAgICAgICAgaW1hZ2U6ICdhc3NldHMvaW1nL21lZGlhLWltZy5wbmcnXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB0YWdzOiBbJ1JTRScsICdGSU5BTkNFJ10sXHJcbiAgICAgICAgZGF0ZTogJzIxLzA3LzIwMTcnLFxyXG4gICAgICAgIHRpdGxlOiAnSElTVE9JUkVTIFBPUFVMQUlSRVMnLFxyXG4gICAgICAgIGNvbnRlbnQ6IGBMYSBjYW1wYWduZSDigJxIaXN0b2lyZXMgcG9wdWxhaXJlc+KAnSBhZG9wdGUgdW5lIGTDqW1hcmNoZSBlbmNvcmUgcGx1cyBwcm9jaGUgZGVzIHByw6lvY2N1cGF0aW9ucyBkZXMgZ2VucyA6IGNlIHNvbnQgZGVzIGhpc3RvaXJlc1xyXG4gICAgICAgICAgICAgICAgcsOpZWxsZXMgZGUgTWFyb2NhaW5zIGlzc3VzIGRlIHRvdXRlcyBsZXMgY2xhc3NlcyBzb2NpYWxlcyBldCBxdWkgb250IHLDqXVzc2kgw6AgYXR0ZWluZHJlIGxldXJzIG9iamVjdGlmcyBkYW5zXHJcbiAgICAgICAgICAgICAgICBkaWZmw6lyZW50cyBzZWN0ZXVycyBkZSBsYSB2aWUgZ3LDomNlIGF1IHNvdXRpZW4gZGUgbGV1ciBiYW5xdWUuYCxcclxuICAgICAgICBpbWFnZTogJ2Fzc2V0cy9pbWcvbWVkaWEtaW1nLnBuZydcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHRhZ3M6IFsnUlNFJywgJ0ZJTkFOQ0UnXSxcclxuICAgICAgICBkYXRlOiAnMjEvMDgvMjAxNycsXHJcbiAgICAgICAgdGl0bGU6ICdISVNUT0lSRVMgUE9QVUxBSVJFUycsXHJcbiAgICAgICAgY29udGVudDogYExhIGNhbXBhZ25lIOKAnEhpc3RvaXJlcyBwb3B1bGFpcmVz4oCdIGFkb3B0ZSB1bmUgZMOpbWFyY2hlIGVuY29yZSBwbHVzIHByb2NoZSBkZXMgcHLDqW9jY3VwYXRpb25zIGRlcyBnZW5zIDogY2Ugc29udCBkZXMgaGlzdG9pcmVzXHJcbiAgICAgICAgICAgICAgICByw6llbGxlcyBkZSBNYXJvY2FpbnMgaXNzdXMgZGUgdG91dGVzIGxlcyBjbGFzc2VzIHNvY2lhbGVzIGV0IHF1aSBvbnQgcsOpdXNzaSDDoCBhdHRlaW5kcmUgbGV1cnMgb2JqZWN0aWZzIGRhbnNcclxuICAgICAgICAgICAgICAgIGRpZmbDqXJlbnRzIHNlY3RldXJzIGRlIGxhIHZpZSBncsOiY2UgYXUgc291dGllbiBkZSBsZXVyIGJhbnF1ZS5gLFxyXG4gICAgICAgIGltYWdlOiAnYXNzZXRzL2ltZy9tZWRpYS1pbWcucG5nJ1xyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgdGFnczogWydSU0UnXSxcclxuICAgICAgICBkYXRlOiAnMjIvMDgvMjAxNicsXHJcbiAgICAgICAgdGl0bGU6ICdISVNUT0lSRVMgUE9QVUxBSVJFUycsXHJcbiAgICAgICAgY29udGVudDogYExhIGNhbXBhZ25lIOKAnEhpc3RvaXJlcyBwb3B1bGFpcmVz4oCdIGFkb3B0ZSB1bmUgZMOpbWFyY2hlIGVuY29yZSBwbHVzIHByb2NoZSBkZXMgcHLDqW9jY3VwYXRpb25zIGRlcyBnZW5zIDogY2Ugc29udCBkZXMgaGlzdG9pcmVzXHJcbiAgICAgICAgICAgICAgICByw6llbGxlcyBkZSBNYXJvY2FpbnMgaXNzdXMgZGUgdG91dGVzIGxlcyBjbGFzc2VzIHNvY2lhbGVzIGV0IHF1aSBvbnQgcsOpdXNzaSDDoCBhdHRlaW5kcmUgbGV1cnMgb2JqZWN0aWZzIGRhbnNcclxuICAgICAgICAgICAgICAgIGRpZmbDqXJlbnRzIHNlY3RldXJzIGRlIGxhIHZpZSBncsOiY2UgYXUgc291dGllbiBkZSBsZXVyIGJhbnF1ZS5gLFxyXG4gICAgICAgIGltYWdlOiAnYXNzZXRzL2ltZy9tZWRpYS1pbWcucG5nJ1xyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgdGFnczogWydSU0UnLCAnRklOQU5DRSddLFxyXG4gICAgICAgIGRhdGU6ICcyMS8wOS8yMDE3JyxcclxuICAgICAgICB0aXRsZTogJ0hJU1RPSVJFUyBQT1BVTEFJUkVTJyxcclxuICAgICAgICBjb250ZW50OiBgTGEgY2FtcGFnbmUg4oCcSGlzdG9pcmVzIHBvcHVsYWlyZXPigJ0gYWRvcHRlIHVuZSBkw6ltYXJjaGUgZW5jb3JlIHBsdXMgcHJvY2hlIGRlcyBwcsOpb2NjdXBhdGlvbnMgZGVzIGdlbnMgOiBjZSBzb250IGRlcyBoaXN0b2lyZXNcclxuICAgICAgICAgICAgICAgIHLDqWVsbGVzIGRlIE1hcm9jYWlucyBpc3N1cyBkZSB0b3V0ZXMgbGVzIGNsYXNzZXMgc29jaWFsZXMgZXQgcXVpIG9udCByw6l1c3NpIMOgIGF0dGVpbmRyZSBsZXVycyBvYmplY3RpZnMgZGFuc1xyXG4gICAgICAgICAgICAgICAgZGlmZsOpcmVudHMgc2VjdGV1cnMgZGUgbGEgdmllIGdyw6JjZSBhdSBzb3V0aWVuIGRlIGxldXIgYmFucXVlLmAsXHJcbiAgICAgICAgaW1hZ2U6ICdhc3NldHMvaW1nL21lZGlhLWltZy5wbmcnXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB0YWdzOiBbJ1JTRScsICdGSU5BTkNFJ10sXHJcbiAgICAgICAgZGF0ZTogJzIxLzEwLzIwMTcnLFxyXG4gICAgICAgIHRpdGxlOiAnSElTVE9JUkVTIFBPUFVMQUlSRVMnLFxyXG4gICAgICAgIGNvbnRlbnQ6IGBMYSBjYW1wYWduZSDigJxIaXN0b2lyZXMgcG9wdWxhaXJlc+KAnSBhZG9wdGUgdW5lIGTDqW1hcmNoZSBlbmNvcmUgcGx1cyBwcm9jaGUgZGVzIHByw6lvY2N1cGF0aW9ucyBkZXMgZ2VucyA6IGNlIHNvbnQgZGVzIGhpc3RvaXJlc1xyXG4gICAgICAgICAgICAgICAgcsOpZWxsZXMgZGUgTWFyb2NhaW5zIGlzc3VzIGRlIHRvdXRlcyBsZXMgY2xhc3NlcyBzb2NpYWxlcyBldCBxdWkgb250IHLDqXVzc2kgw6AgYXR0ZWluZHJlIGxldXJzIG9iamVjdGlmcyBkYW5zXHJcbiAgICAgICAgICAgICAgICBkaWZmw6lyZW50cyBzZWN0ZXVycyBkZSBsYSB2aWUgZ3LDomNlIGF1IHNvdXRpZW4gZGUgbGV1ciBiYW5xdWUuYCxcclxuICAgICAgICBpbWFnZTogJ2Fzc2V0cy9pbWcvbWVkaWEtaW1nLnBuZydcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHRhZ3M6IFsnUlNFJywgJ0ZJTkFOQ0UnXSxcclxuICAgICAgICBkYXRlOiAnMjEvMDcvMjAxOCcsXHJcbiAgICAgICAgdGl0bGU6ICdISVNUT0lSRVMgUE9QVUxBSVJFUycsXHJcbiAgICAgICAgY29udGVudDogYExhIGNhbXBhZ25lIOKAnEhpc3RvaXJlcyBwb3B1bGFpcmVz4oCdIGFkb3B0ZSB1bmUgZMOpbWFyY2hlIGVuY29yZSBwbHVzIHByb2NoZSBkZXMgcHLDqW9jY3VwYXRpb25zIGRlcyBnZW5zIDogY2Ugc29udCBkZXMgaGlzdG9pcmVzXHJcbiAgICAgICAgICAgICAgICByw6llbGxlcyBkZSBNYXJvY2FpbnMgaXNzdXMgZGUgdG91dGVzIGxlcyBjbGFzc2VzIHNvY2lhbGVzIGV0IHF1aSBvbnQgcsOpdXNzaSDDoCBhdHRlaW5kcmUgbGV1cnMgb2JqZWN0aWZzIGRhbnNcclxuICAgICAgICAgICAgICAgIGRpZmbDqXJlbnRzIHNlY3RldXJzIGRlIGxhIHZpZSBncsOiY2UgYXUgc291dGllbiBkZSBsZXVyIGJhbnF1ZS5gLFxyXG4gICAgICAgIGltYWdlOiAnYXNzZXRzL2ltZy9tZWRpYS1pbWcucG5nJ1xyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgdGFnczogWydSU0UnLCAnRklOQU5DRSddLFxyXG4gICAgICAgIGRhdGU6ICcyMS8wNy8yMDE4JyxcclxuICAgICAgICB0aXRsZTogJ0hJU1RPSVJFUyBQT1BVTEFJUkVTJyxcclxuICAgICAgICBjb250ZW50OiBgTGEgY2FtcGFnbmUg4oCcSGlzdG9pcmVzIHBvcHVsYWlyZXPigJ0gYWRvcHRlIHVuZSBkw6ltYXJjaGUgZW5jb3JlIHBsdXMgcHJvY2hlIGRlcyBwcsOpb2NjdXBhdGlvbnMgZGVzIGdlbnMgOiBjZSBzb250IGRlcyBoaXN0b2lyZXNcclxuICAgICAgICAgICAgICAgIHLDqWVsbGVzIGRlIE1hcm9jYWlucyBpc3N1cyBkZSB0b3V0ZXMgbGVzIGNsYXNzZXMgc29jaWFsZXMgZXQgcXVpIG9udCByw6l1c3NpIMOgIGF0dGVpbmRyZSBsZXVycyBvYmplY3RpZnMgZGFuc1xyXG4gICAgICAgICAgICAgICAgZGlmZsOpcmVudHMgc2VjdGV1cnMgZGUgbGEgdmllIGdyw6JjZSBhdSBzb3V0aWVuIGRlIGxldXIgYmFucXVlLmAsXHJcbiAgICAgICAgaW1hZ2U6ICdhc3NldHMvaW1nL21lZGlhLWltZy5wbmcnXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB0YWdzOiBbJ1JTRScsICdGSU5BTkNFJ10sXHJcbiAgICAgICAgZGF0ZTogJzIxLzA3LzIwMTknLFxyXG4gICAgICAgIHRpdGxlOiAnSElTVE9JUkVTIFBPUFVMQUlSRVMnLFxyXG4gICAgICAgIGNvbnRlbnQ6IGBMYSBjYW1wYWduZSDigJxIaXN0b2lyZXMgcG9wdWxhaXJlc+KAnSBhZG9wdGUgdW5lIGTDqW1hcmNoZSBlbmNvcmUgcGx1cyBwcm9jaGUgZGVzIHByw6lvY2N1cGF0aW9ucyBkZXMgZ2VucyA6IGNlIHNvbnQgZGVzIGhpc3RvaXJlc1xyXG4gICAgICAgICAgICAgICAgcsOpZWxsZXMgZGUgTWFyb2NhaW5zIGlzc3VzIGRlIHRvdXRlcyBsZXMgY2xhc3NlcyBzb2NpYWxlcyBldCBxdWkgb250IHLDqXVzc2kgw6AgYXR0ZWluZHJlIGxldXJzIG9iamVjdGlmcyBkYW5zXHJcbiAgICAgICAgICAgICAgICBkaWZmw6lyZW50cyBzZWN0ZXVycyBkZSBsYSB2aWUgZ3LDomNlIGF1IHNvdXRpZW4gZGUgbGV1ciBiYW5xdWUuYCxcclxuICAgICAgICBpbWFnZTogJ2Fzc2V0cy9pbWcvbWVkaWEtaW1nLnBuZydcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHRhZ3M6IFsnUlNFJywgJ0ZJTkFOQ0UnXSxcclxuICAgICAgICBkYXRlOiAnMjEvMDcvMjAyMCcsXHJcbiAgICAgICAgdGl0bGU6ICdISVNUT0lSRVMgUE9QVUxBSVJFUycsXHJcbiAgICAgICAgY29udGVudDogYExhIGNhbXBhZ25lIOKAnEhpc3RvaXJlcyBwb3B1bGFpcmVz4oCdIGFkb3B0ZSB1bmUgZMOpbWFyY2hlIGVuY29yZSBwbHVzIHByb2NoZSBkZXMgcHLDqW9jY3VwYXRpb25zIGRlcyBnZW5zIDogY2Ugc29udCBkZXMgaGlzdG9pcmVzXHJcbiAgICAgICAgICAgICAgICByw6llbGxlcyBkZSBNYXJvY2FpbnMgaXNzdXMgZGUgdG91dGVzIGxlcyBjbGFzc2VzIHNvY2lhbGVzIGV0IHF1aSBvbnQgcsOpdXNzaSDDoCBhdHRlaW5kcmUgbGV1cnMgb2JqZWN0aWZzIGRhbnNcclxuICAgICAgICAgICAgICAgIGRpZmbDqXJlbnRzIHNlY3RldXJzIGRlIGxhIHZpZSBncsOiY2UgYXUgc291dGllbiBkZSBsZXVyIGJhbnF1ZS5gLFxyXG4gICAgICAgIGltYWdlOiAnYXNzZXRzL2ltZy9tZWRpYS1pbWcucG5nJ1xyXG4gICAgICB9XHJcbiAgICBdXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBjbGVhblRhZyAodGFnRmlsdGVyKSB7XHJcbiAgICB0YWdGaWx0ZXIgPSB0YWdGaWx0ZXIudG9Mb3dlckNhc2UoKVxyXG4gICAgaWYgKHRhZ0ZpbHRlclswXSA9PSAnIycpIHtcclxuICAgICAgdGFnRmlsdGVyID0gdGFnRmlsdGVyLnNsaWNlKDEpXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRhZ0ZpbHRlclxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gbWFrZURhdGVPYmplY3QgKGRhdGVTdHJpbmcpIHtcclxuICAgIGxldCBbZGF5LCBtb250aCwgeWVhcl0gPSBkYXRlU3RyaW5nLnNwbGl0KCcvJylcclxuXHJcbiAgICByZXR1cm4gbmV3IERhdGUoeWVhciwgbW9udGggLSAxLCBkYXkpXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBhcHBseUZpbHRlcnMgKCkge1xyXG4gICAgbGV0IGRhdGEgPSBzdGF0ZS5kYXRhXHJcbiAgICBpZiAoc3RhdGUuZmlsdGVycy5sZW5ndGggPiAwKSB7XHJcbiAgICAgIGRhdGEgPSBkYXRhLmZpbHRlcihwb3N0ID0+IHtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHN0YXRlLmZpbHRlcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgIGlmIChwb3N0LnRhZ3MuaW5jbHVkZXMoc3RhdGUuZmlsdGVyc1tpXS50b1VwcGVyQ2FzZSgpKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmFsc2VcclxuICAgICAgfSlcclxuICAgIH1cclxuXHJcbiAgICBpZiAoc3RhdGUuZGF0ZUZpbHRlci5mcm9tICYmIHN0YXRlLmRhdGVGaWx0ZXIudG8pIHtcclxuICAgICAgZGF0YSA9IGRhdGEuZmlsdGVyKHBvc3QgPT4ge1xyXG4gICAgICAgIGlmIChcclxuICAgICAgICAgIG1ha2VEYXRlT2JqZWN0KHBvc3QuZGF0ZSkgLSBtYWtlRGF0ZU9iamVjdChzdGF0ZS5kYXRlRmlsdGVyLmZyb20pID49XHJcbiAgICAgICAgICAgIDAgJiZcclxuICAgICAgICAgIG1ha2VEYXRlT2JqZWN0KHBvc3QuZGF0ZSkgLSBtYWtlRGF0ZU9iamVjdChzdGF0ZS5kYXRlRmlsdGVyLnRvKSA8PSAwXHJcbiAgICAgICAgKSB7XHJcbiAgICAgICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICAgIH0pXHJcbiAgICB9XHJcblxyXG4gICAgZGF0YSA9IGRhdGEuc29ydCgoYSwgYikgPT4ge1xyXG4gICAgICByZXR1cm4gc3RhdGUub3JkZXIgPT0gJ2Rlc2MnXHJcbiAgICAgICAgPyBtYWtlRGF0ZU9iamVjdChiLmRhdGUpIC0gbWFrZURhdGVPYmplY3QoYS5kYXRlKVxyXG4gICAgICAgIDogbWFrZURhdGVPYmplY3QoYS5kYXRlKSAtIG1ha2VEYXRlT2JqZWN0KGIuZGF0ZSlcclxuICAgIH0pXHJcblxyXG4gICAgc2hvd1NlbGVjdGVkKGRhdGEpXHJcbiAgfVxyXG4gIGZ1bmN0aW9uIGNoYW5nZUZpbHRlcnMgKGUpIHtcclxuICAgIGUucHJldmVudERlZmF1bHQoKVxyXG5cclxuICAgIHRoaXMuY2xhc3NMaXN0LnRvZ2dsZSgnYWN0aXZlJylcclxuXHJcbiAgICBzdGF0ZS5maWx0ZXJzID0gW11cclxuXHJcbiAgICB0YWdGaWx0ZXJzLmZvckVhY2goZnVuY3Rpb24gKHRhZykge1xyXG4gICAgICBpZiAoJCh0YWcpLmhhc0NsYXNzKCdhY3RpdmUnKSkge1xyXG4gICAgICAgIHN0YXRlLmZpbHRlcnMucHVzaChjbGVhblRhZyh0YWcuaW5uZXJUZXh0KSlcclxuICAgICAgfVxyXG4gICAgfSlcclxuXHJcbiAgICBpZiAoc3RhdGUuZmlsdGVycy5sZW5ndGggPiAwKSB7XHJcbiAgICAgIGFsbEZpbHRlckJ0bi5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgYWxsRmlsdGVyQnRuLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpXHJcbiAgICB9XHJcblxyXG4gICAgYXBwbHlGaWx0ZXJzKClcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHNob3dTZWxlY3RlZCAoZGF0YSkge1xyXG4gICAgbGV0IHNlbGVjdGVkRGF0YSA9IGRhdGEuc2xpY2UoMCwgc3RhdGUubWF4ICogMylcclxuXHJcbiAgICBjb25zb2xlLmxvZyhkYXRhLmxlbmd0aClcclxuICAgIGNvbnNvbGUubG9nKHNlbGVjdGVkRGF0YS5sZW5ndGgpXHJcblxyXG4gICAgaWYgKHNlbGVjdGVkRGF0YS5sZW5ndGggPj0gZGF0YS5sZW5ndGgpIHtcclxuICAgICAgJCgnI21vcmUtbWVkaWFjZW50ZXInKS5oaWRlKClcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICQoJyNtb3JlLW1lZGlhY2VudGVyJykuc2hvdygpXHJcbiAgICB9XHJcblxyXG4gICAgcmVuZGVyKHNlbGVjdGVkRGF0YSlcclxuICB9XHJcblxyXG4gIGFwcGx5RmlsdGVycygpXHJcblxyXG4gICQoJyNtb3JlLW1lZGlhY2VudGVyJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICAgIGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgc3RhdGUubWF4KytcclxuICAgIGFwcGx5RmlsdGVycygpXHJcblxyXG4gICAgdGhpcy5zY3JvbGxJbnRvVmlldyh7XHJcbiAgICAgIGJlaGF2aW9yOiAnc21vb3RoJyxcclxuICAgICAgaW5saW5lOiAnZW5kJ1xyXG4gICAgfSlcclxuICAgIGlmIChzdGF0ZS5tYXggKyAxID4gc3RhdGUuZGF0YS5sZW5ndGggLyAzKSAkKHRoaXMpLmhpZGUoKVxyXG4gIH0pXHJcblxyXG4gIGZ1bmN0aW9uIHJlbmRlciAoZGF0YSkge1xyXG4gICAgbWVkaWFjZW50ZXJIb2xkZXIuaW5uZXJIVE1MID0gZGF0YVxyXG4gICAgICAubWFwKChwb3N0LCBpbmRleCkgPT4ge1xyXG4gICAgICAgIGlmIChpbmRleCAlIDIgPT09IDApIHtcclxuICAgICAgICAgIHJldHVybiBgPGRpdiBjbGFzcz1cIm1lZGlhLWNhcmQgbXktOCBcIj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwicm93XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxhIGNsYXNzPVwiY29sLW1kLTUgbWVkaWEtY2FyZF9faW1nc2lkZVwiIGhyZWY9XCIvZ2JwLWZyb250L21lZGlhY2VudGVyLWRldGFpbC5odG1sXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aW1nIGNsYXNzPVwibWVkaWEtY2FyZF9faW1nXCIgc3JjPVwiJHtwb3N0LmltYWdlfVwiIGFsdD1cIm1lZGlhIGltYWdlXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvYT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNvbC1tZC03IG1lZGlhLWNhcmRfX2NvbnRlbnRzaWRlIFwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNhcmQtbWVkaWFfX3RhZyBcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICR7cG9zdC50YWdzXHJcbiAgICAgICAgICAgIC5tYXAoXHJcbiAgICAgICAgICAgICAgdGFnID0+XHJcbiAgICAgICAgICAgICAgICBgPGEgY2xhc3M9XCJidG4gYnRuLS10YWcgYnRuLS1vcmFuZ2UgYWN0aXZlIG1yLTFcIiBocmVmPVwiL2dicC1mcm9udC9tZWRpYWNlbnRlci5odG1sXCI+ICMke3RhZ308L2E+YFxyXG4gICAgICAgICAgICApXHJcbiAgICAgICAgICAgIC5qb2luKCcnKX1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGgyIGNsYXNzPVwibWVkaWEtY2FyZF9fdGl0bGVcIj4ke3Bvc3QudGl0bGV9PC9oMj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwIGNsYXNzPVwibWVkaWEtY2FyZF9fY29udGVudFwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICR7cG9zdC5jb250ZW50fVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9wPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm1lZGlhLWNhcmRfX2Zvb3RlclwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjYXJkLWZvb3Rlcl9fbWV0YWRhdGFcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHN0cm9uZyBjbGFzcz1cImNhcmQtZm9vdGVyX19kYXRldGl0bGVcIj5EYXRlIGRlIGxhbmNlbWVudDwvc3Ryb25nPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImNhcmQtZm9vdGVyX19kYXRlXCI+JHtwb3N0LmRhdGV9PC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjYXJkLWZvb3Rlcl9fYWN0aW9uXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxhIGhyZWY9XCIvZ2JwLWZyb250L21lZGlhY2VudGVyLWRldGFpbC5odG1sXCI+RMOJQ09VVlJJUjwvYT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDwvZGl2PmBcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgcmV0dXJuIGA8ZGl2IGNsYXNzPVwibWVkaWEtY2FyZCBtZWRpYS1jYXJkLS1yZXZlcnNlIG15LThcIj5cclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJyb3dcIj5cclxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY29sLW1kLTcgbWVkaWEtY2FyZF9fY29udGVudHNpZGVcIj5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNhcmQtbWVkaWFfX3RhZyBcIj5cclxuICAgICAgICAgICAgICAgICAgJHtwb3N0LnRhZ3NcclxuICAgICAgICAgICAgLm1hcChcclxuICAgICAgICAgICAgICB0YWcgPT5cclxuICAgICAgICAgICAgICAgIGA8YSBjbGFzcz1cImJ0biBidG4tLXRhZyBidG4tLW9yYW5nZSBhY3RpdmUgbXItMVwiIGhyZWY9XCIvZ2JwLWZyb250L21lZGlhY2VudGVyLmh0bWxcIj4gIyR7dGFnfTwvYT5gXHJcbiAgICAgICAgICAgIClcclxuICAgICAgICAgICAgLmpvaW4oJycpfVxyXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPGgyIGNsYXNzPVwibWVkaWEtY2FyZF9fdGl0bGVcIj4ke3Bvc3QudGl0bGV9PC9oMj5cclxuICAgICAgICAgICAgICAgICAgPHAgY2xhc3M9XCJtZWRpYS1jYXJkX19jb250ZW50XCI+XHJcbiAgICAgICAgICAgICAgICAgICR7cG9zdC5jb250ZW50fVxyXG4gICAgICAgICAgICAgICAgICA8L3A+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtZWRpYS1jYXJkX19mb290ZXJcIj5cclxuICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjYXJkLWZvb3Rlcl9fbWV0YWRhdGFcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICA8c3Ryb25nIGNsYXNzPVwiY2FyZC1mb290ZXJfX2RhdGV0aXRsZVwiPkRhdGUgZGUgbGFuY2VtZW50PC9zdHJvbmc+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJjYXJkLWZvb3Rlcl9fZGF0ZVwiPiR7cG9zdC5kYXRlfTwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNhcmQtZm9vdGVyX19hY3Rpb25cIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICA8YSBocmVmPVwiL2dicC1mcm9udC9tZWRpYWNlbnRlci1kZXRhaWwuaHRtbFwiPkTDiUNPVVZSSVI8L2E+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPGEgY2xhc3M9XCJjb2wtbWQtNSBtZWRpYS1jYXJkX19pbWdzaWRlXCIgaHJlZj1cIi9nYnAtZnJvbnQvbWVkaWFjZW50ZXItZGV0YWlsLmh0bWxcIj5cclxuICAgICAgICAgICAgICAgICAgPGltZyBjbGFzcz1cIm1lZGlhLWNhcmRfX2ltZ1wiIHNyYz1cIiR7cG9zdC5pbWFnZX1cIiBhbHQ9XCJtZWRpYSBpbWFnZVwiPlxyXG4gICAgICAgICAgICAgIDwvYT5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICA8L2Rpdj5gXHJcbiAgICAgICAgfVxyXG4gICAgICB9KVxyXG4gICAgICAuam9pbignJylcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGRhdGVGb3JtYXQgKGRhdGUpIHtcclxuICAgIHJldHVybiBgMS8ke2RhdGUubW9udGgoKSArIDF9LyR7ZGF0ZS55ZWFyKCl9YFxyXG4gIH1cclxuXHJcbiAgbGV0IHN0YXJ0RmlsdGVyID0gbmV3IERhdGVGaWx0ZXIoc3RhcnREYXRlLCBmYWxzZSwgZnVuY3Rpb24gKHN0YXJ0KSB7XHJcbiAgICBzdGF0ZS5kYXRlRmlsdGVyLmZyb20gPSBkYXRlRm9ybWF0KHN0YXJ0KVxyXG4gICAgYXBwbHlGaWx0ZXJzKClcclxuICB9KVxyXG4gIHN0YXJ0RmlsdGVyLmluaXQoKVxyXG5cclxuICBsZXQgZW5kRmlsdGVyID0gbmV3IERhdGVGaWx0ZXIoZW5kRGF0ZSwgdHJ1ZSwgZnVuY3Rpb24gKGVuZCkge1xyXG4gICAgc3RhdGUuZGF0ZUZpbHRlci50byA9IGRhdGVGb3JtYXQoZW5kKVxyXG4gICAgYXBwbHlGaWx0ZXJzKClcclxuICB9KVxyXG4gIGVuZEZpbHRlci5pbml0KClcclxuXHJcbiAgJCgnI21lZGlhY2VudGVyLXNlbGVjdC1maWx0ZXInKS5vbignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xyXG4gICAgbGV0IHNlbGVjdGVkID0gJCgnI21lZGlhY2VudGVyLXNlbGVjdC1maWx0ZXInKVxyXG4gICAgICAubmV4dCgpXHJcbiAgICAgIC5maW5kKCcuY3VycmVudCcpXHJcbiAgICAgIC50ZXh0KClcclxuICAgIHNlbGVjdGVkID0gc2VsZWN0ZWQudG9Mb3dlckNhc2UoKVxyXG5cclxuICAgIC8vIGNvbnNvbGUubG9nKHNlbGVjdGVkKVxyXG5cclxuICAgICQoJyNkYXRlLWZpbHRlcicpLmFkZENsYXNzKCdkLWZsZXgnKVxyXG4gICAgJCgnI2RhdGUtZmlsdGVyJykuc2hvdygpXHJcblxyXG4gICAgaWYgKHNlbGVjdGVkICE9PSAncMOpcmlvZGUnKSB7XHJcbiAgICAgICQoJyNkYXRlLWZpbHRlcicpLnJlbW92ZUNsYXNzKCdkLWZsZXgnKVxyXG4gICAgICAkKCcjZGF0ZS1maWx0ZXInKS5oaWRlKClcclxuICAgICAgc3RhdGUub3JkZXIgPSAnZGVzYydcclxuICAgICAgc3RhdGUuZGF0ZUZpbHRlci5mcm9tID0gJydcclxuICAgICAgc3RhdGUuZGF0ZUZpbHRlci50byA9ICcnXHJcbiAgICAgIHN0YXJ0RmlsdGVyLmNsZWFyKClcclxuICAgICAgZW5kRmlsdGVyLmNsZWFyKClcclxuICAgIH1cclxuXHJcbiAgICBpZiAoc2VsZWN0ZWQgPT09ICdwbHVzIGFuY2llbnMnKSB7XHJcbiAgICAgIHN0YXRlLm9yZGVyID0gJ2FzYydcclxuICAgICAgYXBwbHlGaWx0ZXJzKClcclxuICAgIH0gZWxzZSBpZiAoc2VsZWN0ZWQgPT09ICdwbHVzIHLDqWNlbnRzJykge1xyXG4gICAgICBhcHBseUZpbHRlcnMoKVxyXG4gICAgICBzdGF0ZS5vcmRlciA9ICdkZXNjJ1xyXG4gICAgfVxyXG4gIH0pXHJcblxyXG4gIGFsbEZpbHRlckJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgIHN0YXRlLmZpbHRlcnMgPSBbXVxyXG4gICAgdGFnRmlsdGVycy5mb3JFYWNoKHRhZyA9PiB7XHJcbiAgICAgIHRhZy5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKVxyXG4gICAgfSlcclxuICAgIHRoaXMuY2xhc3NMaXN0LmFkZCgnYWN0aXZlJylcclxuICAgIGFwcGx5RmlsdGVycygpXHJcbiAgfSlcclxuICB0YWdGaWx0ZXJzLmZvckVhY2godGFnID0+IHtcclxuICAgIHRhZy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGNoYW5nZUZpbHRlcnMpXHJcbiAgfSlcclxufVxyXG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiAoKSB7XHJcbiAgdmFyIHNsaWRlckluZGV4XHJcblxyXG4gIGlmICgkKCcubm9zLWJhbnF1ZXMnKS5sZW5ndGgpIHtcclxuICAgIGhhbmRsZUV2ZW50TGlzdGVuZXJzKClcclxuICB9XHJcblxyXG4gIGlmICgkKCcubm9zLWJhbnF1ZXMgLm93bC1jYXJvdXNlbCcpLmxlbmd0aCkge1xyXG4gICAgdmFyIHJ0bCA9ICQoJ2h0bWwnKS5hdHRyKCdkaXInKSA9PSAncnRsJ1xyXG5cclxuICAgIGlmICgkKHdpbmRvdykud2lkdGgoKSA+IDc2OCkge1xyXG4gICAgICAkKCcubm9zLWJhbnF1ZXMgLm93bC1jYXJvdXNlbCcpLm93bENhcm91c2VsKCdkZXN0cm95JylcclxuICAgICAgYmFucXVlc1NsaWRlcigwLCBydGwpXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAkKCcubm9zLWJhbnF1ZXMgLm93bC1jYXJvdXNlbCcpLm93bENhcm91c2VsKCdkZXN0cm95JylcclxuICAgICAgYmFucXVlc1NsaWRlcigwLCBydGwpXHJcbiAgICB9XHJcblxyXG4gICAgJCh3aW5kb3cpLm9uKCdyZXNpemUnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIGlmICgkKHdpbmRvdykud2lkdGgoKSA+IDc2OCkge1xyXG4gICAgICAgICQoJy5ub3MtYmFucXVlcyAub3dsLWNhcm91c2VsJykub3dsQ2Fyb3VzZWwoJ2Rlc3Ryb3knKVxyXG4gICAgICAgIGJhbnF1ZXNTbGlkZXIoMCwgcnRsKVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgICQoJy5ub3MtYmFucXVlcyAub3dsLWNhcm91c2VsJykub3dsQ2Fyb3VzZWwoJ2Rlc3Ryb3knKVxyXG4gICAgICAgIGJhbnF1ZXNTbGlkZXIoMCwgcnRsKVxyXG4gICAgICB9XHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gcmVtb3ZlSGFzaCAoKSB7XHJcbiAgICBoaXN0b3J5LnB1c2hTdGF0ZShcclxuICAgICAgJycsXHJcbiAgICAgIGRvY3VtZW50LnRpdGxlLFxyXG4gICAgICB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUgKyB3aW5kb3cubG9jYXRpb24uc2VhcmNoXHJcbiAgICApXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBiYW5xdWVzU2xpZGVyIChzdGFnZVBhZGRpbmcsIHJ0bCkge1xyXG4gICAgdmFyIG93bCA9ICQoJy5ub3MtYmFucXVlcyAub3dsLWNhcm91c2VsJykub3dsQ2Fyb3VzZWwoe1xyXG4gICAgICBzdGFnZVBhZGRpbmc6IHN0YWdlUGFkZGluZyxcclxuICAgICAgbWFyZ2luOiAwLFxyXG4gICAgICBkb3RzOiB0cnVlLFxyXG4gICAgICBuYXY6IHRydWUsXHJcbiAgICAgIGxvb3A6IHRydWUsXHJcbiAgICAgIFVSTGhhc2hMaXN0ZW5lcjogdHJ1ZSxcclxuICAgICAgbmF2U3BlZWQ6IDEwMDAsXHJcbiAgICAgIHJ0bDogcnRsLFxyXG4gICAgICByZXNwb25zaXZlOiB7XHJcbiAgICAgICAgMDoge1xyXG4gICAgICAgICAgaXRlbXM6IDFcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0pXHJcblxyXG4gICAgb3dsLm9uKCdkcmFnLm93bC5jYXJvdXNlbCcsIGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICBpZiAoZXZlbnQucmVsYXRlZFRhcmdldFsnX2RyYWcnXVsnZGlyZWN0aW9uJ10pIHtcclxuICAgICAgICB2YXIgaW5kZXhCZWZvcmVDaGFuZ2UgPSBldmVudC5wYWdlLmluZGV4XHJcblxyXG4gICAgICAgIHNsaWRlckluZGV4ID0gaW5kZXhCZWZvcmVDaGFuZ2VcclxuICAgICAgfVxyXG4gICAgfSlcclxuXHJcbiAgICBvd2wub24oJ2RyYWdnZWQub3dsLmNhcm91c2VsJywgZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICAgIHZhciBpbmRleEFmdGVyQ2hhbmdlID0gZXZlbnQucGFnZS5pbmRleFxyXG5cclxuICAgICAgaWYgKGV2ZW50LnJlbGF0ZWRUYXJnZXRbJ19kcmFnJ11bJ2RpcmVjdGlvbiddKSB7XHJcbiAgICAgICAgaWYgKGluZGV4QWZ0ZXJDaGFuZ2UgIT09IHNsaWRlckluZGV4KSB7XHJcbiAgICAgICAgICBpZiAoZXZlbnQucmVsYXRlZFRhcmdldFsnX2RyYWcnXVsnZGlyZWN0aW9uJ10gPT09ICdsZWZ0Jykge1xyXG4gICAgICAgICAgICBuZXh0KClcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHByZXYoKVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gY29uc29sZS5sb2coZXZlbnQpXHJcbiAgICB9KVxyXG5cclxuICAgICQoJy5vd2wtbmV4dCcpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgbmV4dCgpXHJcbiAgICB9KVxyXG5cclxuICAgICQoJy5vd2wtcHJldicpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgcHJldigpXHJcbiAgICB9KVxyXG5cclxuICAgIGZ1bmN0aW9uIG5leHQgKCkge1xyXG4gICAgICB2YXIgY3VycmVudEl0ZW0gPSAkKCcubm9zLWJhbnF1ZXNfbGlua3MgLml0ZW0uYWN0aXZlJylcclxuXHJcbiAgICAgIGN1cnJlbnRJdGVtLnJlbW92ZUNsYXNzKCdhY3RpdmUnKVxyXG5cclxuICAgICAgaWYgKGN1cnJlbnRJdGVtLmlzKCc6bGFzdC1jaGlsZCcpKSB7XHJcbiAgICAgICAgJCgnLm5vcy1iYW5xdWVzX2xpbmtzIC5pdGVtOmZpcnN0LWNoaWxkJykuYWRkQ2xhc3MoJ2FjdGl2ZScpXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgY3VycmVudEl0ZW0ubmV4dCgpLmFkZENsYXNzKCdhY3RpdmUnKVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcHJldiAoKSB7XHJcbiAgICAgIHZhciBjdXJyZW50SXRlbSA9ICQoJy5ub3MtYmFucXVlc19saW5rcyAuaXRlbS5hY3RpdmUnKVxyXG5cclxuICAgICAgY3VycmVudEl0ZW0ucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpXHJcblxyXG4gICAgICBpZiAoY3VycmVudEl0ZW0uaXMoJzpmaXJzdC1jaGlsZCcpKSB7XHJcbiAgICAgICAgJCgnLm5vcy1iYW5xdWVzX2xpbmtzIC5pdGVtOmxhc3QtY2hpbGQnKS5hZGRDbGFzcygnYWN0aXZlJylcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBjdXJyZW50SXRlbS5wcmV2KCkuYWRkQ2xhc3MoJ2FjdGl2ZScpXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGhhbmRsZUV2ZW50TGlzdGVuZXJzICgpIHtcclxuICAgICQoJy5ub3MtYmFucXVlc19saW5rcyAuaXRlbTpmaXJzdC1jaGlsZCcpLmFkZENsYXNzKCdhY3RpdmUnKVxyXG5cclxuICAgICQoJy5ub3MtYmFucXVlc19saW5rcyAuaXRlbScpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgICB2YXIgY2xpY2tlZEl0ZW0gPSAkKHRoaXMpXHJcblxyXG4gICAgICBpZiAoIWNsaWNrZWRJdGVtLmhhc0NsYXNzKCdhY3RpdmUnKSkge1xyXG4gICAgICAgICQoJy5ub3MtYmFucXVlc19saW5rcyAuaXRlbS5hY3RpdmUnKS5yZW1vdmVDbGFzcygnYWN0aXZlJylcclxuICAgICAgICBjbGlja2VkSXRlbS5hZGRDbGFzcygnYWN0aXZlJylcclxuICAgICAgfVxyXG5cclxuICAgICAgdmFyIGNsaWNrZWRJbmRleCA9IGNsaWNrZWRJdGVtLmRhdGEoJ2luZGV4JylcclxuXHJcbiAgICAgICQoJy5ub3MtYmFucXVlcyAub3dsLWNhcm91c2VsJykudHJpZ2dlcigndG8ub3dsLmNhcm91c2VsJywgY2xpY2tlZEluZGV4KVxyXG4gICAgfSlcclxuICB9XHJcbn1cclxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gKCkge1xyXG4gIGxldCBzZWFyY2hJbnB1dCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNwb3B1cC1zZWFyY2gtaW5wdXQnKVxyXG4gIGxldCB0YWdGaWx0ZXJzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLnBvcHVwLXNlYXJjaF90YWcnKVxyXG4gIGxldCBhbGxGaWx0ZXJCdG4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucG9wdXAtc2VhcmNoX3RhZy0tYWxsJylcclxuXHJcbiAgaWYgKCFzZWFyY2hJbnB1dCkgcmV0dXJuXHJcblxyXG4gIGxldCBzdGF0ZSA9IHtcclxuICAgIHNlYXJjaDogJycsXHJcbiAgICBmaWx0ZXJzOiBbXSxcclxuICAgIGRhdGE6IFtcclxuICAgICAge1xyXG4gICAgICAgIGNhdGVnb3J5OiAnQUNUVUFMSVRFUycsXHJcbiAgICAgICAgdGFnczogWydhcnRpY2xlcycsICd2aWRlb3MnXSxcclxuICAgICAgICB0ZXh0OiAnTG9yZW0xIGlwc3VtIGRvbG9yIHNldCBhbWV0J1xyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgY2F0ZWdvcnk6ICdBQ1RVQUxJVEVTJyxcclxuICAgICAgICB0YWdzOiBbJ2FydGljbGVzJywgJ3ZpZGVvcyddLFxyXG4gICAgICAgIHRleHQ6ICdMb3JlbTIgaXBzdW0gZG9sb3Igc2V0IGFtZXQnXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBjYXRlZ29yeTogJ0FDVFVBTElURVMnLFxyXG4gICAgICAgIHRhZ3M6IFsnYXJ0aWNsZXMnLCAndmlkZW9zJywgJ2ltYWdlcyddLFxyXG4gICAgICAgIHRleHQ6ICdMb3JlbTEgaXBzdW0gZG9sb3Igc2V0IGFtZXQnXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBjYXRlZ29yeTogJ0FDVFVBTElURVMnLFxyXG4gICAgICAgIHRhZ3M6IFsnYXJ0aWNsZXMnLCAndmlkZW9zJ10sXHJcbiAgICAgICAgdGV4dDogJ0xvcmVtMyBpcHN1bSBkb2xvciBzZXQgYW1ldCdcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIGNhdGVnb3J5OiAnQ09NTVVOSVFVw4lTJyxcclxuICAgICAgICB0YWdzOiBbJ2FydGljbGVzJywgJ3ZpZGVvcycsICdpbWFnZXMnXSxcclxuICAgICAgICB0ZXh0OiAnTG9yZW0xIGlwc3VtIGRvbG9yIHNldCBhbWV0J1xyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgY2F0ZWdvcnk6ICdDT01NVU5JUVXDiVMnLFxyXG4gICAgICAgIHRhZ3M6IFsnYXJ0aWNsZXMnLCAndmlkZW9zJ10sXHJcbiAgICAgICAgdGV4dDogJ0xvcmVtMSBpcHN1bSBkb2xvciBzZXQgYW1ldCdcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIGNhdGVnb3J5OiAnQ09NTVVOSVFVw4lTJyxcclxuICAgICAgICB0YWdzOiBbJ2FydGljbGVzJywgJ3ZpZGVvcycsICdpbWFnZXMnXSxcclxuICAgICAgICB0ZXh0OiAnTG9yZW0yIGlwc3VtIGRvbG9yIHNldCBhbWV0J1xyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgY2F0ZWdvcnk6ICdDT01NVU5JUVXDiVMnLFxyXG4gICAgICAgIHRhZ3M6IFsnYXJ0aWNsZXMnLCAndmlkZW9zJ10sXHJcbiAgICAgICAgdGV4dDogJ0xvcmVtMSBpcHN1bSBkb2xvciBzZXQgYW1ldCdcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIGNhdGVnb3J5OiAnQ09NTVVOSVFVw4lTJyxcclxuICAgICAgICB0YWdzOiBbJ2FydGljbGVzJywgJ3ZpZGVvcyddLFxyXG4gICAgICAgIHRleHQ6ICdMb3JlbTMgaXBzdW0gZG9sb3Igc2V0IGFtZXQnXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBjYXRlZ29yeTogJ1BSRVNTRScsXHJcbiAgICAgICAgdGFnczogWydhcnRpY2xlcycsICd2aWRlb3MnLCAnaW1hZ2VzJ10sXHJcbiAgICAgICAgdGV4dDogJ0xvcmVtMiBpcHN1bSBkb2xvciBzZXQgYW1ldCdcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIGNhdGVnb3J5OiAnUFJFU1NFJyxcclxuICAgICAgICB0YWdzOiBbJ2FydGljbGVzJywgJ3ZpZGVvcyddLFxyXG4gICAgICAgIHRleHQ6ICdMb3JlbTEgaXBzdW0gZG9sb3Igc2V0IGFtZXQnXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBjYXRlZ29yeTogJ1BSRVNTRScsXHJcbiAgICAgICAgdGFnczogWydhcnRpY2xlcycsICd2aWRlb3MnXSxcclxuICAgICAgICB0ZXh0OiAnTG9yZW0zIGlwc3VtIGRvbG9yIHNldCBhbWV0J1xyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgY2F0ZWdvcnk6ICdDT01QQUdORVMgUFVCJyxcclxuICAgICAgICB0YWdzOiBbJ2FydGljbGVzJywgJ3ZpZGVvcycsICdpbWFnZXMnXSxcclxuICAgICAgICB0ZXh0OiAnTG9yZW0yIGlwc3VtIGRvbG9yIHNldCBhbWV0J1xyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgY2F0ZWdvcnk6ICdDT01QQUdORVMgUFVCJyxcclxuICAgICAgICB0YWdzOiBbJ2FydGljbGVzJywgJ3ZpZGVvcyddLFxyXG4gICAgICAgIHRleHQ6ICdMb3JlbTEgaXBzdW0gZG9sb3Igc2V0IGFtZXQnXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBjYXRlZ29yeTogJ1JBUFBPUlRTIEZJTkFOQ0lFUlMnLFxyXG4gICAgICAgIHRhZ3M6IFsnYXJ0aWNsZXMnLCAndmlkZW9zJ10sXHJcbiAgICAgICAgdGV4dDogJ0xvcmVtMyBpcHN1bSBkb2xvciBzZXQgYW1ldCdcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIGNhdGVnb3J5OiAnUkFQUE9SVFMgRklOQU5DSUVSUycsXHJcbiAgICAgICAgdGFnczogWydhcnRpY2xlcycsICd2aWRlb3MnLCAnaW1hZ2VzJ10sXHJcbiAgICAgICAgdGV4dDogJ0xvcmVtMiBpcHN1bSBkb2xvciBzZXQgYW1ldCdcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIGNhdGVnb3J5OiAnUkFQUE9SVFMgRklOQU5DSUVSUycsXHJcbiAgICAgICAgdGFnczogWydhcnRpY2xlcycsICd2aWRlb3MnXSxcclxuICAgICAgICB0ZXh0OiAnTG9yZW0xIGlwc3VtIGRvbG9yIHNldCBhbWV0J1xyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgY2F0ZWdvcnk6ICdSQVBQT1JUUyBGSU5BTkNJRVJTJyxcclxuICAgICAgICB0YWdzOiBbJ2FydGljbGVzJywgJ3ZpZGVvcyddLFxyXG4gICAgICAgIHRleHQ6ICdMb3JlbTMgaXBzdW0gZG9sb3Igc2V0IGFtZXQnXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBjYXRlZ29yeTogJ0FVVFJFUycsXHJcbiAgICAgICAgdGFnczogWydhcnRpY2xlcycsICd2aWRlb3MnLCAnaW1hZ2VzJ10sXHJcbiAgICAgICAgdGV4dDogJ0xvcmVtMiBpcHN1bSBkb2xvciBzZXQgYW1ldCdcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIGNhdGVnb3J5OiAnQVVUUkVTJyxcclxuICAgICAgICB0YWdzOiBbJ2FydGljbGVzJywgJ3ZpZGVvcyddLFxyXG4gICAgICAgIHRleHQ6ICdMb3JlbTEgaXBzdW0gZG9sb3Igc2V0IGFtZXQnXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBjYXRlZ29yeTogJ0FVVFJFUycsXHJcbiAgICAgICAgdGFnczogWydhcnRpY2xlcycsICd2aWRlb3MnXSxcclxuICAgICAgICB0ZXh0OiAnTG9yZW0zIGlwc3VtIGRvbG9yIHNldCBhbWV0J1xyXG4gICAgICB9XHJcbiAgICBdXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBjbGVhblRhZyAodGFnRmlsdGVyKSB7XHJcbiAgICB0YWdGaWx0ZXIgPSB0YWdGaWx0ZXIudHJpbSgpLnRvTG93ZXJDYXNlKClcclxuICAgIGlmICh0YWdGaWx0ZXJbMF0gPT0gJyMnKSB7XHJcbiAgICAgIHRhZ0ZpbHRlciA9IHRhZ0ZpbHRlci5zbGljZSgxKVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0YWdGaWx0ZXJcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIG1hdGNoVGFncyAodGFncywgZmlsdGVycykge1xyXG4gICAgcmV0dXJuIHRhZ3Muc29tZSh0YWcgPT4ge1xyXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGZpbHRlcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBpZiAodGFnLmluY2x1ZGVzKGZpbHRlcnNbaV0pKSByZXR1cm4gdHJ1ZVxyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gZmFsc2VcclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBjaGVja1NlYXJjaFJlc3VsdCAoKSB7XHJcbiAgICBpZiAoc3RhdGUuc2VhcmNoKSB7XHJcbiAgICAgICQoJy5wb3B1cC1zZWFyY2hfcmVzdWx0Jykuc2hvdygpXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAkKCcucG9wdXAtc2VhcmNoX3Jlc3VsdCcpLmhpZGUoKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gYXBwbHlGaWx0ZXJzICgpIHtcclxuICAgIGxldCBkYXRhID0gc3RhdGUuZGF0YVxyXG5cclxuICAgIGlmIChzdGF0ZS5zZWFyY2gpIHtcclxuICAgICAgZGF0YSA9IGRhdGFcclxuICAgICAgICAuZmlsdGVyKHBvc3QgPT4ge1xyXG4gICAgICAgICAgaWYgKFxyXG4gICAgICAgICAgICBwb3N0LnRleHQudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzdGF0ZS5zZWFyY2gudG9Mb3dlckNhc2UoKSkgJiZcclxuICAgICAgICAgICAgKG1hdGNoVGFncyhwb3N0LnRhZ3MsIHN0YXRlLmZpbHRlcnMpIHx8IHN0YXRlLmZpbHRlcnMubGVuZ3RoIDw9IDApXHJcbiAgICAgICAgICApIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWVcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLm1hcChwb3N0ID0+IHtcclxuICAgICAgICAgIGxldCByZWdleHAgPSBuZXcgUmVnRXhwKGAoJHtzdGF0ZS5zZWFyY2h9KWAsICdpJylcclxuXHJcbiAgICAgICAgICBsZXQgdGV4dCA9IHBvc3QudGV4dC5yZXBsYWNlKHJlZ2V4cCwgJzxzcGFuIGNsYXNzPVwiZm91bmRcIiA+JDE8L3NwYW4+JylcclxuXHJcbiAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBjYXRlZ29yeTogcG9zdC5jYXRlZ29yeSxcclxuICAgICAgICAgICAgdGFnczogWy4uLnBvc3QudGFnc10sXHJcbiAgICAgICAgICAgIHRleHQ6IHRleHRcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG4gICAgfVxyXG5cclxuICAgIGNoZWNrU2VhcmNoUmVzdWx0KClcclxuXHJcbiAgICByZW5kZXIoZGF0YSlcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGZpbHRlckFuZE1hcCAoZWxlbSwgZGF0YSwgY2F0ZWdvcnkpIHtcclxuICAgIGxldCBmb3VuZFJlc3VsdCA9IGRhdGFcclxuICAgICAgLmZpbHRlcihwb3N0ID0+IHtcclxuICAgICAgICBpZiAocG9zdC5jYXRlZ29yeSA9PT0gJ0NPTU1VTklRVcOJUycpIHJldHVybiB0cnVlXHJcblxyXG4gICAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgICB9KVxyXG4gICAgICAubWFwKHBvc3QgPT4ge1xyXG4gICAgICAgIGxldCB0ZXh0ID0gcG9zdC50ZXh0XHJcbiAgICAgICAgcmV0dXJuIGA8bGkgY2xhc3M9XCJpdGVtXCI+XHJcbiAgICAgICAgICAgICAgPGEgaHJlZj1cIi9nYnAtZnJvbnQvbmV3cy1kZXRhaWwuaHRtbFwiPlxyXG4gICAgICAgICAgICAgICAgICAke3RleHR9XHJcbiAgICAgICAgICAgICAgPC9hPlxyXG4gICAgICAgICAgPC9saT5gXHJcbiAgICAgIH0pXHJcblxyXG4gICAgZWxlbS5maW5kKCd1bCcpLmh0bWwoZm91bmRSZXN1bHQuam9pbignJykpXHJcbiAgICBlbGVtLmZpbmQoJy5wb3B1cC1tZW51X2xlbmd0aCcpLnRleHQoZm91bmRSZXN1bHQubGVuZ3RoKVxyXG4gICAgaWYgKGZvdW5kUmVzdWx0Lmxlbmd0aCA8PSAwKSB7XHJcbiAgICAgIGVsZW0uZmluZCgnLml0ZW0tcGx1cycpLmhpZGUoKVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgZWxlbS5maW5kKCcuaXRlbS1wbHVzJykuc2hvdygpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiByZW5kZXIgKGRhdGEpIHtcclxuICAgIC8vIGNvbnNvbGUubG9nKGRhdGEpXHJcblxyXG4gICAgLy8gQ09NTVVOSVFVw4lTXHJcbiAgICBmaWx0ZXJBbmRNYXAoJCgnI3NlYXJjaC1jb21tdW5pcXVlcycpLCBkYXRhLCAnQ09NTVVOSVFVw4lTJylcclxuICAgIC8vIEFDVFVBTElURVNcclxuICAgIGZpbHRlckFuZE1hcCgkKCcjc2VhcmNoLWFjdHVhbGl0ZXMnKSwgZGF0YSwgJ0FDVFVBTElURVMnKVxyXG4gICAgLy8gUkFQUE9SVFMgRklOQU5DSUVSU1xyXG4gICAgZmlsdGVyQW5kTWFwKCQoJyNzZWFyY2gtcmFwcG9ydHMnKSwgZGF0YSwgJ1JBUFBPUlRTIEZJTkFOQ0lFUlMnKVxyXG4gICAgLy8gQVVUUkVTXHJcbiAgICBmaWx0ZXJBbmRNYXAoJCgnI3NlYXJjaC1hdXRyZXMnKSwgZGF0YSwgJ0FVVFJFUycpXHJcbiAgICAvLyBQUkVTU0VcclxuICAgIGZpbHRlckFuZE1hcCgkKCcjc2VhcmNoLXByZXNzZScpLCBkYXRhLCAnUFJFU1NFJylcclxuICAgIC8vIENPTVBBR05FUyBQVUJcclxuICAgIGZpbHRlckFuZE1hcCgkKCcjc2VhcmNoLWNvbXBhZ25lcycpLCBkYXRhLCAnQ09NUEFHTkVTIFBVQicpXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBjaGFuZ2VGaWx0ZXJzIChlKSB7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KClcclxuXHJcbiAgICB0aGlzLmNsYXNzTGlzdC50b2dnbGUoJ2FjdGl2ZScpXHJcblxyXG4gICAgc3RhdGUuZmlsdGVycyA9IFtdXHJcblxyXG4gICAgdGFnRmlsdGVycy5mb3JFYWNoKGZ1bmN0aW9uICh0YWcpIHtcclxuICAgICAgaWYgKCQodGFnKS5oYXNDbGFzcygnYWN0aXZlJykpIHtcclxuICAgICAgICBzdGF0ZS5maWx0ZXJzLnB1c2goY2xlYW5UYWcodGFnLmlubmVyVGV4dCkpXHJcbiAgICAgIH1cclxuICAgIH0pXHJcblxyXG4gICAgLy8gY29uc29sZS5sb2coc3RhdGUuZmlsdGVycylcclxuXHJcbiAgICBpZiAoc3RhdGUuZmlsdGVycy5sZW5ndGggPiAwKSB7XHJcbiAgICAgIGFsbEZpbHRlckJ0bi5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgYWxsRmlsdGVyQnRuLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpXHJcbiAgICB9XHJcblxyXG4gICAgYXBwbHlGaWx0ZXJzKClcclxuICB9XHJcblxyXG4gIGFsbEZpbHRlckJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgIHN0YXRlLmZpbHRlcnMgPSBbXVxyXG4gICAgdGFnRmlsdGVycy5mb3JFYWNoKHRhZyA9PiB7XHJcbiAgICAgIHRhZy5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKVxyXG4gICAgfSlcclxuICAgIHRoaXMuY2xhc3NMaXN0LmFkZCgnYWN0aXZlJylcclxuICAgIGFwcGx5RmlsdGVycygpXHJcbiAgfSlcclxuXHJcbiAgdGFnRmlsdGVycy5mb3JFYWNoKHRhZyA9PiB7XHJcbiAgICB0YWcuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBjaGFuZ2VGaWx0ZXJzKVxyXG4gIH0pXHJcblxyXG4gIHNlYXJjaElucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgZnVuY3Rpb24gKCkge1xyXG4gICAgc3RhdGUuc2VhcmNoID0gdGhpcy52YWx1ZVxyXG4gICAgYXBwbHlGaWx0ZXJzKClcclxuICB9KVxyXG59XHJcbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uICgpIHtcclxuICBpZiAoJCgnLmhlYWRlcl9zZWFyY2gnKS5sZW5ndGgpIHtcclxuICAgIGFkZEV2ZW50TGlzdGVuZXJzKClcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGFkZEV2ZW50TGlzdGVuZXJzICgpIHtcclxuICAgICQoJy5oZWFkZXJfc2VhcmNoLXBvcCwgLmhlYWRlcl9tb2JpbGUtc2VhcmNoJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAkKCcucGFnZS1jb250ZW50JykuYWRkQ2xhc3MoJ2Qtbm9uZScpXHJcbiAgICAgICQoJy5wb3B1cC1zZWFyY2gnKS5yZW1vdmVDbGFzcygnZC1ub25lJylcclxuICAgIH0pXHJcblxyXG4gICAgJCgnLmNsb3NlLXdyYXBwZXInKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICQoJy5wYWdlLWNvbnRlbnQnKS5yZW1vdmVDbGFzcygnZC1ub25lJylcclxuICAgICAgJCgnLnBvcHVwLXNlYXJjaCcpLmFkZENsYXNzKCdkLW5vbmUnKVxyXG4gICAgfSlcclxuICB9XHJcbn1cclxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gKCkge1xyXG5cdGlmKCQoJy5zd2lwZWJveC0tdmlkZW8nKS5sZW5ndGgpIHtcclxuXHRcdGFkZEV2ZW50TGlzdGVuZXJzKCk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBhZGRFdmVudExpc3RlbmVycyAoKSB7XHJcblx0XHQkKCcuc3dpcGVib3gtLXZpZGVvJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG5cdFx0XHQkKCcucGFnZS1jb250ZW50JykuYWRkQ2xhc3MoJ2Qtbm9uZScpO1xyXG5cdFx0XHQkKCcucG9wdXAtdmlkZW8nKS5yZW1vdmVDbGFzcygnZC1ub25lJyk7XHJcblx0XHR9KTtcclxuXHJcblx0XHQkKCcuY2xvc2Utd3JhcHBlcicpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0JCgnLnBhZ2UtY29udGVudCcpLnJlbW92ZUNsYXNzKCdkLW5vbmUnKTtcclxuXHRcdFx0JCgnLnBvcHVwLXZpZGVvX3NlY3Rpb24gaWZyYW1lJykucmVtb3ZlKCk7XHJcblx0XHRcdCQoJy5wb3B1cC12aWRlbycpLmFkZENsYXNzKCdkLW5vbmUnKTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdCQoJy5zd2lwZWJveC0tdmlkZW8nKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG5cdFx0XHR2YXIgeXRiSWQgPSAkKHRoaXMpLmF0dHIoJ2hyZWYnKTtcclxuXHJcblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcclxuXHRcdFx0cGxheVZpZGVvKHl0YklkKTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdCQoJy5wb3B1cC12aWRlb19zbGlkZXIgLnN3aXBlYm94LS12aWRlbycpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcblx0XHRcdHZhciB5dGJJZCA9ICQodGhpcykuYXR0cignaHJlZicpO1xyXG5cclxuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHRwbGF5VmlkZW8oeXRiSWQpO1xyXG5cdFx0fSk7XHJcblxyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gcGxheVZpZGVvKHl0YklkKSB7XHJcblx0XHRcclxuXHJcblx0XHR2YXIgaHRtbCA9IGA8aWZyYW1lICB3aWR0aD1cIjEwMCVcIiBoZWlnaHQ9XCI0MDBcIiBcclxuXHRcdFx0XHRcdFx0c3JjPVwiaHR0cHM6Ly93d3cueW91dHViZS5jb20vZW1iZWQvJHt5dGJJZH0/YXV0b3BsYXk9MVwiIFxyXG5cdFx0XHRcdFx0XHRmcmFtZWJvcmRlcj1cIjBcIiBhbGxvdz1cImF1dG9wbGF5OyBlbmNyeXB0ZWQtbWVkaWFcIiBhbGxvd2Z1bGxzY3JlZW4+PC9pZnJhbWU+YDtcclxuXHJcblx0XHQkKCcucG9wdXAtdmlkZW9fc2VjdGlvbiBpZnJhbWUnKS5yZW1vdmUoKTtcclxuXHJcblx0XHQkKCcucG9wdXAtdmlkZW9fc2VjdGlvbicpLnByZXBlbmQoaHRtbCk7XHJcblx0fVxyXG5cclxuXHQvLyBjYXJvdXNlbCB2aWRlb1xyXG5cdGlmKCQoJy5wb3B1cC12aWRlb19zbGlkZXInKS5sZW5ndGgpIHtcclxuXHJcblx0XHR2YXIgcnRsID0gJCgnaHRtbCcpLmF0dHIoJ2RpcicpID09ICdydGwnO1xyXG5cclxuXHRcdGlmICgkKHdpbmRvdykud2lkdGgoKSA+IDc2OCkge1xyXG5cdFx0XHRwb3B1cFZpZGVvU2xpZGVyKDAsIHJ0bCk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRwb3B1cFZpZGVvU2xpZGVyKDIwLCBydGwpO1xyXG5cdFx0fVxyXG5cclxuXHRcdCQod2luZG93KS5vbigncmVzaXplJywgZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRpZiAoJCh3aW5kb3cpLndpZHRoKCkgPiA3NjgpIHtcclxuXHRcdFx0XHRwb3B1cFZpZGVvU2xpZGVyKDAsIHJ0bCk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0cG9wdXBWaWRlb1NsaWRlcigyMCwgcnRsKTtcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBwb3B1cFZpZGVvU2xpZGVyKHN0YWdlUGFkZGluZywgcnRsKSB7XHJcbiAgICAgICAgJCgnLnBvcHVwLXZpZGVvX3NsaWRlci5vd2wtY2Fyb3VzZWwnKS5vd2xDYXJvdXNlbCh7XHJcbiAgICAgICAgICAgIHN0YWdlUGFkZGluZzogc3RhZ2VQYWRkaW5nLFxyXG4gICAgICAgICAgICBtYXJnaW46IDEwLFxyXG4gICAgICAgICAgICBkb3RzOiBmYWxzZSxcclxuICAgICAgICAgICAgbmF2OiBmYWxzZSxcclxuICAgICAgICAgICAgbG9vcDogZmFsc2UsXHJcbiAgICAgICAgICAgIHJ0bDogcnRsLFxyXG4gICAgICAgICAgICByZXNwb25zaXZlOiB7XHJcbiAgICAgICAgICAgICAgICAwOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaXRlbXM6IDFcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICA3Njg6IHtcclxuICAgICAgICAgICAgICAgIFx0aXRlbXM6IDVcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufSIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uICgpIHtcclxuICBpZiAoJCgnLnB1Yi1zbGlkZXInKS5sZW5ndGgpIHtcclxuICAgIGlmICgkKHdpbmRvdykud2lkdGgoKSA+IDk5MSkge1xyXG4gICAgICBhcnRpY2xlU2xpZGVyKDApXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBhcnRpY2xlU2xpZGVyKDApXHJcbiAgICB9XHJcblxyXG4gICAgJCh3aW5kb3cpLm9uKCdyZXNpemUnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIGlmICgkKHdpbmRvdykud2lkdGgoKSA+IDk5MSkge1xyXG4gICAgICAgIGFydGljbGVTbGlkZXIoMClcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBhcnRpY2xlU2xpZGVyKDApXHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBhcnRpY2xlU2xpZGVyIChzdGFnZVBhZGRpbmcpIHtcclxuICAgICQoJy5wdWItc2xpZGVyLm93bC1jYXJvdXNlbCcpLm93bENhcm91c2VsKHtcclxuICAgICAgc3RhZ2VQYWRkaW5nOiBzdGFnZVBhZGRpbmcsXHJcbiAgICAgIG1hcmdpbjogMTgsXHJcbiAgICAgIGRvdHM6IHRydWUsXHJcbiAgICAgIG5hdjogdHJ1ZSxcclxuICAgICAgbG9vcDogdHJ1ZSxcclxuICAgICAgcmVzcG9uc2l2ZToge1xyXG4gICAgICAgIDA6IHtcclxuICAgICAgICAgIGl0ZW1zOiAxXHJcbiAgICAgICAgfSxcclxuICAgICAgICA5OTI6IHtcclxuICAgICAgICAgIGl0ZW1zOiAxXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9KVxyXG4gIH1cclxufVxyXG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiAoKSB7XHJcbiAgbGV0IHRhZ0ZpbHRlcnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcjcmVzdWx0LWZpbHRlcnMgYScpXHJcbiAgbGV0IGFsbEZpbHRlckJ0biA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNyZXN1bHQtZmlsdGVyLWFsbCcpXHJcbiAgbGV0IGFjdWFsaXRlc0hvbGRlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNyZXN1bHQtYWN1YWxpdGVzLWhvbGRlcicpXHJcblxyXG4gIGlmICghYWN1YWxpdGVzSG9sZGVyKSByZXR1cm5cclxuXHJcbiAgbGV0IHN0YXRlID0ge1xyXG4gICAgZmlsdGVyczogW10sXHJcbiAgICBzZWFyY2g6ICcnLFxyXG4gICAgdHlwZTogJ2RvY3VtZW50cycsXHJcbiAgICBkYXRhOiB7XHJcbiAgICAgIGFjdHVhbGl0ZXM6IFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICB0eXBlOiAnYXJ0aWNsZS1pbWcnLFxyXG4gICAgICAgICAgdGFnczogWydSU0UnLCAnRklOQU5DRScsICdFTlRSRVBSRU5BUklBVCddLFxyXG4gICAgICAgICAgZGF0ZTogJzIxLzA3LzIwMTcnLFxyXG4gICAgICAgICAgdGl0bGU6ICd1bmUgYW1iaWFuY2UgZmVzdGl2ZSBldCBmYW1pbGlhbGUgcXVlIHPigJllc3QgZMOpcm91bMOpJyxcclxuICAgICAgICAgIGNvbnRlbnQ6ICdMZSBHcm91cGUgQkNQLCBhY3RldXIgcGFuYWZyaWNhaW4gZGUgcsOpZsOpcmVuY2UsIGV0IGxhIFNvY2nDqXTDqSBGaW5hVG5jacOocmUgSW50ZXJuYXRpb25hbGUgKElGQykuLi4nLFxyXG4gICAgICAgICAgaW1hZ2U6ICdhc3NldHMvaW1nL2FjdHUtMi5wbmcnXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICB0eXBlOiAnYXJ0aWNsZScsXHJcbiAgICAgICAgICB0YWdzOiBbJ1JTRScsICdFTlRSRVBSRU5BUklBVCddLFxyXG4gICAgICAgICAgZGF0ZTogJzIyLzA3LzIwMTcnLFxyXG4gICAgICAgICAgdGl0bGU6ICd1bmUgYW1iaWFuY2UgZmVzdGl2ZSBldCBmYW1pbGlhbGUgcXVlIHPigJllc3QgZMOpcm91bMOpJyxcclxuICAgICAgICAgIGNvbnRlbnQ6ICdMZSBHcm91cGUgQkNQLCBhY3RldXIgcGFuYWZyaWNhaW4gZGUgcsOpZsOpcmVuY2UsIGV0IGxhIFNvY2nDqXTDqSBGaW5hVG5jacOocmUgSW50ZXJuYXRpb25hbGUgKElGQykuLi4nXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICB0eXBlOiAnYXJ0aWNsZScsXHJcbiAgICAgICAgICB0YWdzOiBbJ1JTRScsICdERVZFTE9QUEVNRU5UIERVUkFCTEUnXSxcclxuICAgICAgICAgIGRhdGU6ICcyMy8wNy8yMDE3JyxcclxuICAgICAgICAgIHRpdGxlOiAndW5lIGFtYmlhbmNlIGZlc3RpdmUgZXQgZmFtaWxpYWxlIHF1ZSBz4oCZZXN0IGTDqXJvdWzDqScsXHJcbiAgICAgICAgICBjb250ZW50OiAnTGUgR3JvdXBlIEJDUCwgYWN0ZXVyIHBhbmFmcmljYWluIGRlIHLDqWbDqXJlbmNlLCBldCBsYSBTb2Npw6l0w6kgRmluYVRuY2nDqHJlIEludGVybmF0aW9uYWxlIChJRkMpLi4uJ1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgdHlwZTogJ2FydGljbGUnLFxyXG4gICAgICAgICAgdGFnczogWydSU0UnXSxcclxuICAgICAgICAgIGRhdGU6ICcyMS8wNy8yMDE3JyxcclxuICAgICAgICAgIHRpdGxlOiAndW5lIGFtYmlhbmNlIGZlc3RpdmUgZXQgZmFtaWxpYWxlIHF1ZSBz4oCZZXN0IGTDqXJvdWzDqScsXHJcbiAgICAgICAgICBjb250ZW50OiAnTGUgR3JvdXBlIEJDUCwgYWN0ZXVyIHBhbmFmcmljYWluIGRlIHLDqWbDqXJlbmNlLCBldCBsYSBTb2Npw6l0w6kgRmluYVRuY2nDqHJlIEludGVybmF0aW9uYWxlIChJRkMpLi4uJ1xyXG4gICAgICAgIH1cclxuICAgICAgXSxcclxuICAgICAgY29tbXVuaXF1ZXM6IFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICB0YWdzOiBbJ1JTRScsICdGSU5BTkNFJ10sXHJcbiAgICAgICAgICBkYXRlOiAnMjEvMDcvMjAxOCcsXHJcbiAgICAgICAgICB0aXRsZTogJ0xlIEdyb3VwZSBCQ1AgbGFuY2UgbGEgcHJlbWnDqHJlIGJhbnF1ZSBtYXJvY2FpbmUgZMOpZGnDqWUgw6AgbOKAmWFjdGl2aXTDqSDigJx0aXRyZXPigJ0nLFxyXG4gICAgICAgICAgc2l6ZTogNDUwLFxyXG4gICAgICAgICAgdHlwZTogJ3BkZidcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIHRhZ3M6IFsnUlNFJywgJ0ZJTkFOQ0UnXSxcclxuICAgICAgICAgIGRhdGU6ICcyMS8wNy8yMDE4JyxcclxuICAgICAgICAgIHRpdGxlOiAnTGUgR3JvdXBlIEJDUCBsYW5jZSBsYSBwcmVtacOocmUgYmFucXVlIG1hcm9jYWluZSBkw6lkacOpZSDDoCBs4oCZYWN0aXZpdMOpIOKAnHRpdHJlc+KAnScsXHJcbiAgICAgICAgICBzaXplOiA0NTAsXHJcbiAgICAgICAgICB0eXBlOiAncGRmJ1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgdGFnczogWydSU0UnLCAnRklOQU5DRSddLFxyXG4gICAgICAgICAgZGF0ZTogJzIxLzA3LzIwMTknLFxyXG4gICAgICAgICAgdGl0bGU6ICdMZSBHcm91cGUgQkNQIGxhbmNlIGxhIHByZW1pw6hyZSBiYW5xdWUgbWFyb2NhaW5lIGTDqWRpw6llIMOgIGzigJlhY3Rpdml0w6kg4oCcdGl0cmVz4oCdJyxcclxuICAgICAgICAgIHNpemU6IDQ1MCxcclxuICAgICAgICAgIHR5cGU6ICdwZGYnXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICB0YWdzOiBbJ1JTRScsICdGSU5BTkNFJ10sXHJcbiAgICAgICAgICBkYXRlOiAnMjEvMDcvMjAyMCcsXHJcbiAgICAgICAgICB0aXRsZTogJ0xlIEdyb3VwZSBCQ1AgbGFuY2UgbGEgcHJlbWnDqHJlIGJhbnF1ZSBtYXJvY2FpbmUgZMOpZGnDqWUgw6AgbOKAmWFjdGl2aXTDqSDigJx0aXRyZXPigJ0nLFxyXG4gICAgICAgICAgc2l6ZTogNDUwLFxyXG4gICAgICAgICAgdHlwZTogJ3BkZidcclxuICAgICAgICB9XHJcbiAgICAgIF0sXHJcbiAgICAgIGNvbXBhZ25lczogW1xyXG4gICAgICAgIHtcclxuICAgICAgICAgIHRhZ3M6IFsnUlNFJywgJ0ZJTkFOQ0UnXSxcclxuICAgICAgICAgIGRhdGU6ICcyMS8wNy8yMDE4JyxcclxuICAgICAgICAgIHRpdGxlOiAnSElTVE9JUkVTIFBPUFVMQUlSRVMnLFxyXG4gICAgICAgICAgY29udGVudDogYExhIGNhbXBhZ25lIOKAnEhpc3RvaXJlcyBwb3B1bGFpcmVz4oCdIGFkb3B0ZSB1bmUgZMOpbWFyY2hlIGVuY29yZSBwbHVzIHByb2NoZSBkZXMgcHLDqW9jY3VwYXRpb25zIGRlcyBnZW5zIDogY2Ugc29udCBkZXMgaGlzdG9pcmVzXHJcbiAgICAgICAgICAgICAgICByw6llbGxlcyBkZSBNYXJvY2FpbnMgaXNzdXMgZGUgdG91dGVzIGxlcyBjbGFzc2VzIHNvY2lhbGVzIGV0IHF1aSBvbnQgcsOpdXNzaSDDoCBhdHRlaW5kcmUgbGV1cnMgb2JqZWN0aWZzIGRhbnNcclxuICAgICAgICAgICAgICAgIGRpZmbDqXJlbnRzIHNlY3RldXJzIGRlIGxhIHZpZSBncsOiY2UgYXUgc291dGllbiBkZSBsZXVyIGJhbnF1ZS5gLFxyXG4gICAgICAgICAgaW1hZ2U6ICdhc3NldHMvaW1nL21lZGlhLWltZy5wbmcnXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICB0YWdzOiBbJ1JTRScsICdGSU5BTkNFJ10sXHJcbiAgICAgICAgICBkYXRlOiAnMjEvMDcvMjAxOCcsXHJcbiAgICAgICAgICB0aXRsZTogJ0hJU1RPSVJFUyBQT1BVTEFJUkVTJyxcclxuICAgICAgICAgIGNvbnRlbnQ6IGBMYSBjYW1wYWduZSDigJxIaXN0b2lyZXMgcG9wdWxhaXJlc+KAnSBhZG9wdGUgdW5lIGTDqW1hcmNoZSBlbmNvcmUgcGx1cyBwcm9jaGUgZGVzIHByw6lvY2N1cGF0aW9ucyBkZXMgZ2VucyA6IGNlIHNvbnQgZGVzIGhpc3RvaXJlc1xyXG4gICAgICAgICAgICAgICAgcsOpZWxsZXMgZGUgTWFyb2NhaW5zIGlzc3VzIGRlIHRvdXRlcyBsZXMgY2xhc3NlcyBzb2NpYWxlcyBldCBxdWkgb250IHLDqXVzc2kgw6AgYXR0ZWluZHJlIGxldXJzIG9iamVjdGlmcyBkYW5zXHJcbiAgICAgICAgICAgICAgICBkaWZmw6lyZW50cyBzZWN0ZXVycyBkZSBsYSB2aWUgZ3LDomNlIGF1IHNvdXRpZW4gZGUgbGV1ciBiYW5xdWUuYCxcclxuICAgICAgICAgIGltYWdlOiAnYXNzZXRzL2ltZy9tZWRpYS1pbWcucG5nJ1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgdGFnczogWydSU0UnLCAnRklOQU5DRSddLFxyXG4gICAgICAgICAgZGF0ZTogJzIxLzA3LzIwMTknLFxyXG4gICAgICAgICAgdGl0bGU6ICdISVNUT0lSRVMgUE9QVUxBSVJFUycsXHJcbiAgICAgICAgICBjb250ZW50OiBgTGEgY2FtcGFnbmUg4oCcSGlzdG9pcmVzIHBvcHVsYWlyZXPigJ0gYWRvcHRlIHVuZSBkw6ltYXJjaGUgZW5jb3JlIHBsdXMgcHJvY2hlIGRlcyBwcsOpb2NjdXBhdGlvbnMgZGVzIGdlbnMgOiBjZSBzb250IGRlcyBoaXN0b2lyZXNcclxuICAgICAgICAgICAgICAgIHLDqWVsbGVzIGRlIE1hcm9jYWlucyBpc3N1cyBkZSB0b3V0ZXMgbGVzIGNsYXNzZXMgc29jaWFsZXMgZXQgcXVpIG9udCByw6l1c3NpIMOgIGF0dGVpbmRyZSBsZXVycyBvYmplY3RpZnMgZGFuc1xyXG4gICAgICAgICAgICAgICAgZGlmZsOpcmVudHMgc2VjdGV1cnMgZGUgbGEgdmllIGdyw6JjZSBhdSBzb3V0aWVuIGRlIGxldXIgYmFucXVlLmAsXHJcbiAgICAgICAgICBpbWFnZTogJ2Fzc2V0cy9pbWcvbWVkaWEtaW1nLnBuZydcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIHRhZ3M6IFsnUlNFJywgJ0ZJTkFOQ0UnXSxcclxuICAgICAgICAgIGRhdGU6ICcyMS8wNy8yMDIwJyxcclxuICAgICAgICAgIHRpdGxlOiAnSElTVE9JUkVTIFBPUFVMQUlSRVMnLFxyXG4gICAgICAgICAgY29udGVudDogYExhIGNhbXBhZ25lIOKAnEhpc3RvaXJlcyBwb3B1bGFpcmVz4oCdIGFkb3B0ZSB1bmUgZMOpbWFyY2hlIGVuY29yZSBwbHVzIHByb2NoZSBkZXMgcHLDqW9jY3VwYXRpb25zIGRlcyBnZW5zIDogY2Ugc29udCBkZXMgaGlzdG9pcmVzXHJcbiAgICAgICAgICAgICAgICByw6llbGxlcyBkZSBNYXJvY2FpbnMgaXNzdXMgZGUgdG91dGVzIGxlcyBjbGFzc2VzIHNvY2lhbGVzIGV0IHF1aSBvbnQgcsOpdXNzaSDDoCBhdHRlaW5kcmUgbGV1cnMgb2JqZWN0aWZzIGRhbnNcclxuICAgICAgICAgICAgICAgIGRpZmbDqXJlbnRzIHNlY3RldXJzIGRlIGxhIHZpZSBncsOiY2UgYXUgc291dGllbiBkZSBsZXVyIGJhbnF1ZS5gLFxyXG4gICAgICAgICAgaW1hZ2U6ICdhc3NldHMvaW1nL21lZGlhLWltZy5wbmcnXHJcbiAgICAgICAgfVxyXG4gICAgICBdXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBhcHBseUZpbHRlcnMgKCkge1xyXG4gICAgJCgnLmhlYWRlci1zZWN0aW9uX3NlYXJjaC1yZXN1bHQnKS50ZXh0KHN0YXRlLnNlYXJjaClcclxuXHJcbiAgICBsZXQgZGF0YSA9IHN0YXRlLmRhdGFcclxuICAgIGlmIChzdGF0ZS5maWx0ZXJzLmxlbmd0aCA+IDApIHtcclxuICAgICAgZGF0YS5hY3R1YWxpdGVzID0gc3RhdGUuZGF0YS5hY3R1YWxpdGVzLmZpbHRlcihwb3N0ID0+IHtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHN0YXRlLmZpbHRlcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgIGlmIChwb3N0LnRhZ3MuaW5jbHVkZXMoc3RhdGUuZmlsdGVyc1tpXS50b1VwcGVyQ2FzZSgpKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmFsc2VcclxuICAgICAgfSlcclxuICAgIH1cclxuICAgIHJlbmRlcihkYXRhKVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gcmVuZGVyIChkYXRhKSB7fVxyXG5cclxuICBmdW5jdGlvbiBjbGVhblRhZyAodGFnRmlsdGVyKSB7XHJcbiAgICB0YWdGaWx0ZXIgPSB0YWdGaWx0ZXIudHJpbSgpLnRvTG93ZXJDYXNlKClcclxuICAgIGlmICh0YWdGaWx0ZXJbMF0gPT0gJyMnKSB7XHJcbiAgICAgIHJldHVybiB0YWdGaWx0ZXIuc2xpY2UoMSlcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGFnRmlsdGVyXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBjaGFuZ2VGaWx0ZXJzIChlKSB7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KClcclxuXHJcbiAgICB0aGlzLmNsYXNzTGlzdC50b2dnbGUoJ2FjdGl2ZScpXHJcblxyXG4gICAgc3RhdGUuZmlsdGVycyA9IFtdXHJcblxyXG4gICAgdGFnRmlsdGVycy5mb3JFYWNoKGZ1bmN0aW9uICh0YWcpIHtcclxuICAgICAgaWYgKCQodGFnKS5oYXNDbGFzcygnYWN0aXZlJykpIHtcclxuICAgICAgICBzdGF0ZS5maWx0ZXJzLnB1c2goY2xlYW5UYWcodGFnLmlubmVyVGV4dCkpXHJcbiAgICAgIH1cclxuICAgIH0pXHJcblxyXG4gICAgaWYgKHN0YXRlLmZpbHRlcnMubGVuZ3RoID4gMCkge1xyXG4gICAgICBhbGxGaWx0ZXJCdG4uY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJylcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGFsbEZpbHRlckJ0bi5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKVxyXG4gICAgfVxyXG5cclxuICAgIGFwcGx5RmlsdGVycygpXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBzdWJtaXRGb3JtIChlKSB7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgIHN0YXRlLnNlYXJjaCA9ICQoJyNyZXN1bHQtc2VhcmNoJykudmFsKClcclxuICAgIGFwcGx5RmlsdGVycygpXHJcbiAgfVxyXG5cclxuICBhbGxGaWx0ZXJCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICBzdGF0ZS5maWx0ZXJzID0gW11cclxuICAgIHRhZ0ZpbHRlcnMuZm9yRWFjaCh0YWcgPT4ge1xyXG4gICAgICB0YWcuY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJylcclxuICAgIH0pXHJcbiAgICB0aGlzLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpXHJcbiAgICBhcHBseUZpbHRlcnMoKVxyXG4gIH0pXHJcblxyXG4gIHRhZ0ZpbHRlcnMuZm9yRWFjaCh0YWcgPT4ge1xyXG4gICAgdGFnLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgY2hhbmdlRmlsdGVycylcclxuICB9KVxyXG5cclxuICAkKCcjcmVzdWx0LXNlbGVjdC10eXBlJykub24oJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHtcclxuICAgIHN0YXRlLnR5cGUgPSAkKHRoaXMpLm5leHQoKS5maW5kKCcuY3VycmVudCcpLnRleHQoKS50b0xvd2VyQ2FzZSgpXHJcbiAgICBhcHBseUZpbHRlcnMoKVxyXG4gIH0pXHJcblxyXG4gICQoJyNyZXN1bHQtc2VhcmNoLWJ0bicpLm9uKCdjbGljaycsIHN1Ym1pdEZvcm0pXHJcbiAgJCgnI3NlYXJjaC1mb3JtJykub24oJ3N1Ym1pdCcsIHN1Ym1pdEZvcm0pXHJcbn1cclxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gKCkge1xyXG5cdCQoJ3NlbGVjdC5uaWNlLXNlbGVjdCcpLm5pY2VTZWxlY3QoKTtcclxufSIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uICgpIHtcclxuXHRpZiAoJCgnLnN3aXBlYm94JykubGVuZ3RoKSB7XHJcblx0XHQvLyQoJy5zd2lwZWJveCcpLnN3aXBlYm94KCk7XHJcblx0fVxyXG5cdFxyXG59IiwiZXhwb3J0IGZ1bmN0aW9uIHRyYWNrZXIgKGNhbGxiYWNrKSB7XHJcbiAgbGV0IGVsbW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RpbWVsaW5lLXNlbGVjdG9yJylcclxuXHJcbiAgaWYgKCFlbG1udCkgcmV0dXJuIG51bGxcclxuXHJcbiAgbGV0IGRvdHMgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdsaW5lX2RvdCcpXHJcblxyXG4gIGNvbnN0IFNJWkUgPSAxMTQwIC8vIHNldCB0aGUgd2lkdGggb2YgdGhlIHRyYWNrZXJcclxuXHJcbiAgbGV0IHN0ZXAgPSBTSVpFIC8gZG90cy5sZW5ndGhcclxuICBjb25zdCBCTE9DS1NJWkUgPSBzdGVwXHJcblxyXG4gICQoJy5saW5lX2RvdCcpLmNzcygnd2lkdGgnLCBzdGVwICsgJ3B4JylcclxuICAkKCcjdGltZWxpbmUtc2VsZWN0b3InKS5jc3MoJ2xlZnQnLCBzdGVwIC8gMiAtIDIwICsgJ3B4JylcclxuICAkKCcudGltZWxpbmVfbGluZSAuY29udGFpbmVyJykuYXBwZW5kKFxyXG4gICAgJzxkaXYgY2xhc3M9XCJ0aW1lbGluZV9saW5lLXByb2dyZXNzXCI+PGRpdiBjbGFzcz1cInRpbWVsaW5lX2xpbmUtZmlsbFwiPjwvZGl2PjwvZGl2PidcclxuICApXHJcbiAgJCgnLnRpbWVsaW5lX2xpbmUtcHJvZ3Jlc3MnKS5jc3MoJ3dpZHRoJywgU0laRSAtIEJMT0NLU0laRSArICdweCcpXHJcblxyXG4gIGxldCBwb3MxID0gMCwgcG9zMyA9IDAsIHBvc2l0aW9uID0gMFxyXG4gIGVsbW50Lm9ubW91c2Vkb3duID0gZHJhZ01vdXNlRG93blxyXG5cclxuICBmdW5jdGlvbiBkcmFnTW91c2VEb3duIChlKSB7XHJcbiAgICBlID0gZSB8fCB3aW5kb3cuZXZlbnRcclxuICAgIC8vIGdldCB0aGUgbW91c2UgY3Vyc29yIHBvc2l0aW9uIGF0IHN0YXJ0dXA6XHJcbiAgICBwb3MzID0gZS5jbGllbnRYXHJcbiAgICBkb2N1bWVudC5vbm1vdXNldXAgPSBjbG9zZURyYWdFbGVtZW50XHJcbiAgICAvLyBjYWxsIGEgZnVuY3Rpb24gd2hlbmV2ZXIgdGhlIGN1cnNvciBtb3ZlczpcclxuICAgIGRvY3VtZW50Lm9ubW91c2Vtb3ZlID0gZWxlbWVudERyYWdcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGVsZW1lbnREcmFnIChlKSB7XHJcbiAgICBlID0gZSB8fCB3aW5kb3cuZXZlbnRcclxuICAgIC8vIGNhbGN1bGF0ZSB0aGUgbmV3IGN1cnNvciBwb3NpdGlvbjpcclxuICAgIHBvczEgPSBwb3MzIC0gZS5jbGllbnRYXHJcbiAgICBwb3MzID0gZS5jbGllbnRYXHJcbiAgICAvLyBzZXQgdGhlIGVsZW1lbnQncyBuZXcgcG9zaXRpb246XHJcbiAgICBsZXQgbmV3UG9zaXRpb24gPSBlbG1udC5vZmZzZXRMZWZ0IC0gcG9zMVxyXG4gICAgaWYgKFxyXG4gICAgICBuZXdQb3NpdGlvbiA+PSBCTE9DS1NJWkUgLyAyIC0gMjAgJiZcclxuICAgICAgbmV3UG9zaXRpb24gPCBTSVpFIC0gQkxPQ0tTSVpFIC8gMiAtIDIwXHJcbiAgICApIHtcclxuICAgICAgZWxtbnQuc3R5bGUubGVmdCA9IG5ld1Bvc2l0aW9uICsgJ3B4J1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgZG9jdW1lbnQub25tb3VzZXVwID0gY2xvc2VEcmFnRWxlbWVudFxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gc2V0UHJvcGVyUG9zaXRpb24gKCkge1xyXG4gICAgcG9zaXRpb24gPSBNYXRoLnJvdW5kKChwYXJzZUZsb2F0KGVsbW50LnN0eWxlLmxlZnQpIC0gNTApIC8gc3RlcClcclxuICAgIGxldCBuZXdQb3NpdGlvbiA9IHBvc2l0aW9uICogQkxPQ0tTSVpFICsgQkxPQ0tTSVpFIC8gMiAtIDIwXHJcbiAgICBlbG1udC5zdHlsZS5sZWZ0ID0gbmV3UG9zaXRpb24gKyAncHgnXHJcbiAgICB1cGRhdGVBY3RpdmVEb3RzKClcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHVwZGF0ZUFjdGl2ZURvdHMgKCkge1xyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkb3RzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIGRvdHNbaV0uY2xhc3NMaXN0LnJlbW92ZSgnbGluZV9kb3QtLWFjdGl2ZScpXHJcbiAgICB9XHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHBvc2l0aW9uOyBpKyspIHtcclxuICAgICAgZG90c1tpXS5jbGFzc0xpc3QuYWRkKCdsaW5lX2RvdC0tYWN0aXZlJylcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGVQcm9ncmVzcygpXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiB1cGRhdGVQcm9ncmVzcyAoKSB7XHJcbiAgICBsZXQgd2lkdGggPSBwb3NpdGlvbiAqIEJMT0NLU0laRVxyXG4gICAgJCgnLnRpbWVsaW5lX2xpbmUtZmlsbCcpLmNzcygnd2lkdGgnLCB3aWR0aCArICdweCcpXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBjbG9zZURyYWdFbGVtZW50ICgpIHtcclxuICAgIHNldFByb3BlclBvc2l0aW9uKClcclxuICAgIGNhbGxiYWNrKHBvc2l0aW9uICsgMSlcclxuICAgIC8qIHN0b3AgbW92aW5nIHdoZW4gbW91c2UgYnV0dG9uIGlzIHJlbGVhc2VkOiAqL1xyXG4gICAgZG9jdW1lbnQub25tb3VzZXVwID0gbnVsbFxyXG4gICAgZG9jdW1lbnQub25tb3VzZW1vdmUgPSBudWxsXHJcbiAgfVxyXG5cclxuICBBcnJheS5wcm90b3R5cGUuZm9yRWFjaC5jYWxsKGRvdHMsIGZ1bmN0aW9uIChkb3QsIGluZGV4KSB7XHJcbiAgICBkb3QuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHVwZGF0ZVBvc2l0aW9uKGluZGV4KVxyXG4gICAgICBjYWxsYmFjayhwb3NpdGlvbiArIDEpXHJcbiAgICB9KVxyXG4gIH0pXHJcblxyXG4gIGZ1bmN0aW9uIHVwZGF0ZVBvc2l0aW9uIChwb3NpdGlvbikge1xyXG4gICAgZWxtbnQuc3R5bGUubGVmdCA9IHBvc2l0aW9uICogQkxPQ0tTSVpFICsgJ3B4J1xyXG4gICAgc2V0UHJvcGVyUG9zaXRpb24oKVxyXG4gIH1cclxuICByZXR1cm4gdXBkYXRlUG9zaXRpb25cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gKCkge1xyXG4gIGxldCBkYXRhID0ge1xyXG4gICAgcGVyaW9kczogW1xyXG4gICAgICB7XHJcbiAgICAgICAgeWVhcjogMjAxOCxcclxuICAgICAgICBhY3Rpb25zOiB7XHJcbiAgICAgICAgICBsZWZ0OiBbXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICBkYXRlOiAnMTEtMDEtMjAxOCcsXHJcbiAgICAgICAgICAgICAgY29udGVudDogJ0xvcmVtIGlwc3VtIGRvbG9yIHNpdCBhbWV0IGNvbnNlY3RldHVyIGFkaXBpc2ljaW5nIGVsaXQuIERpZ25pc3NpbW9zLCBzdXNjaXBpdCEnXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICBkYXRlOiAnMTEtMDItMjAxOCcsXHJcbiAgICAgICAgICAgICAgY29udGVudDogJ0xvcmVtIGlwc3VtIGRvbG9yIHNpdCBhbWV0IGNvbnNlY3RldHVyIGFkaXBpc2ljaW5nIGVsaXQuIERpZ25pc3NpbW9zLCBzdXNjaXBpdCEnXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICBkYXRlOiAnMTEtMDMtMjAxOCcsXHJcbiAgICAgICAgICAgICAgdGl0bGU6ICdESVNUSU5DVElPTlM8YnI+ICZUUk9QSMOJRVMnLFxyXG4gICAgICAgICAgICAgIGNvbnRlbnQ6IGA8c3BhbiBjbGFzcz1cInRpbWVsaW5lX2NhcmRfc21hbGx0aXRsZVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBBZnJpY2FuIEJhbmtlciBBd2FyZHMgMjAxNVxyXG4gICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICAgICAgVHJvcGjDqWUgwqsgQmFucXVlIEFmcmljYWluZSBkZSBs4oCZQW5uw6llIMK7IGTDqWNlcm7DqSBhdSBHcm91cGUgQmFucXVlIENlbnRyYWxlIFBvcHVsYWlyZSBUcm9waMOpZSDCqyBJbmNsdXNpb24gRmluYW5jacOocmUgwrsgcmVtcG9ydMOpXHJcbiAgICAgICAgICAgICAgICAgICAgICBwYXIgbGEgZmlsaWFsZSBBdHRhd2ZpcSBNaWNyby1GaW5hbmNlLiBDYXJ0ZXNcclxuICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwidGltZWxpbmVfY2FyZF9zbWFsbHRpdGxlXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIEFmcmlxdWUgQXdhcmRzIDIwMTVcclxuICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgICAgIE9idGVudGlvbiBkdSB0cm9waMOpZSDCqyBCZXN0IElubm92YXRpdmUgQ2FyZCBQcm9ncmFtbWUgwrsgYXR0cmlidcOpIMOgIMKrIEdsb2JhbENhcmQgwrssIHVuZSBjYXJ0ZSBtb27DqXRpcXVlIHByw6lwYXnDqWUgZGVzdGluw6llXHJcbiAgICAgICAgICAgICAgICAgICAgICBhdXggdm95YWdldXJzIGRlIHBhc3NhZ2UgYXUgTWFyb2MgZXQgcXVpIGNvbnN0aXR1ZSB1biBtb3llbiBkZSBzdWJzdGl0dXRpb24gw6AgbGEgbW9ubmFpZSBmaWR1Y2lhaXJlLlxyXG4gICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJ0aW1lbGluZV9jYXJkX3NtYWxsdGl0bGVcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgTW9yb2NjbyBNYXN0ZXJDYXJkIEN1c3RvbWVycyBNZWV0aW5ncyAyMDE1XHJcbiAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgICAgICBMZSBHcm91cGUgQmFucXVlIENlbnRyYWxlIFBvcHVsYWlyZSBhIHJlbXBvcnTDqSDDoCBjZXR0ZSBvY2Nhc2lvbiBsZSB0cm9waMOpZSBkZSBjaGFtcGlvbiBuYXRpb25hbCBk4oCZYWN0aXZhdGlvbiBkZXMgY2FydGVzIGRlXHJcbiAgICAgICAgICAgICAgICAgICAgICBwYWllbWVudCBUUEUgwqsgUG9zIFVzYWdlIEFjdGl2YXRpb24gQ2hhbXBpb24gwrsuYFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICBdLFxyXG4gICAgICAgICAgcmlnaHQ6IFtcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgIGRhdGU6ICcxMS0wMy0yMDE4JyxcclxuICAgICAgICAgICAgICBjb250ZW50OiAnTG9yZW0gaXBzdW0gZG9sb3Igc2l0IGFtZXQgY29uc2VjdGV0dXIgYWRpcGlzaWNpbmcgZWxpdC4gRGlnbmlzc2ltb3MsIHN1c2NpcGl0IScsXHJcbiAgICAgICAgICAgICAgbWVkaWE6ICdhc3NldHMvaW1nL3Jlcy0yLnBuZydcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgIGRhdGU6ICcxMS0wMy0yMDE4JyxcclxuICAgICAgICAgICAgICBjb250ZW50OiAnTG9yZW0gaXBzdW0gZG9sb3Igc2l0IGFtZXQgY29uc2VjdGV0dXIgYWRpcGlzaWNpbmcgZWxpdC4gRGlnbmlzc2ltb3MsIHN1c2NpcGl0IScsXHJcbiAgICAgICAgICAgICAgbWVkaWE6ICdhc3NldHMvaW1nL2V4cGxvcmVyLW1ldGllcnMyLnBuZydcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgXVxyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHllYXI6IDIwMTcsXHJcbiAgICAgICAgYWN0aW9uczoge1xyXG4gICAgICAgICAgbGVmdDogW1xyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgZGF0ZTogJzExLTAxLTIwMTgnLFxyXG4gICAgICAgICAgICAgIGNvbnRlbnQ6ICdMb3JlbSBpcHN1bSBkb2xvciBzaXQgYW1ldCBjb25zZWN0ZXR1ciBhZGlwaXNpY2luZyBlbGl0LiBEaWduaXNzaW1vcywgc3VzY2lwaXQhJ1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgZGF0ZTogJzExLTAyLTIwMTgnLFxyXG4gICAgICAgICAgICAgIGNvbnRlbnQ6ICdMb3JlbSBpcHN1bSBkb2xvciBzaXQgYW1ldCBjb25zZWN0ZXR1ciBhZGlwaXNpY2luZyBlbGl0LiBEaWduaXNzaW1vcywgc3VzY2lwaXQhJ1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgZGF0ZTogJzExLTAzLTIwMTgnLFxyXG4gICAgICAgICAgICAgIHRpdGxlOiAnRElTVElOQ1RJT05TPGJyPiAmVFJPUEjDiUVTJyxcclxuICAgICAgICAgICAgICBjb250ZW50OiBgPHNwYW4gY2xhc3M9XCJ0aW1lbGluZV9jYXJkX3NtYWxsdGl0bGVcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgQWZyaWNhbiBCYW5rZXIgQXdhcmRzIDIwMTVcclxuICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgICAgIFRyb3Bow6llIMKrIEJhbnF1ZSBBZnJpY2FpbmUgZGUgbOKAmUFubsOpZSDCuyBkw6ljZXJuw6kgYXUgR3JvdXBlIEJhbnF1ZSBDZW50cmFsZSBQb3B1bGFpcmUgVHJvcGjDqWUgwqsgSW5jbHVzaW9uIEZpbmFuY2nDqHJlIMK7IHJlbXBvcnTDqVxyXG4gICAgICAgICAgICAgICAgICAgICAgcGFyIGxhIGZpbGlhbGUgQXR0YXdmaXEgTWljcm8tRmluYW5jZS4gQ2FydGVzXHJcbiAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInRpbWVsaW5lX2NhcmRfc21hbGx0aXRsZVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBBZnJpcXVlIEF3YXJkcyAyMDE1XHJcbiAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgICAgICBPYnRlbnRpb24gZHUgdHJvcGjDqWUgwqsgQmVzdCBJbm5vdmF0aXZlIENhcmQgUHJvZ3JhbW1lIMK7IGF0dHJpYnXDqSDDoCDCqyBHbG9iYWxDYXJkIMK7LCB1bmUgY2FydGUgbW9uw6l0aXF1ZSBwcsOpcGF5w6llIGRlc3RpbsOpZVxyXG4gICAgICAgICAgICAgICAgICAgICAgYXV4IHZveWFnZXVycyBkZSBwYXNzYWdlIGF1IE1hcm9jIGV0IHF1aSBjb25zdGl0dWUgdW4gbW95ZW4gZGUgc3Vic3RpdHV0aW9uIMOgIGxhIG1vbm5haWUgZmlkdWNpYWlyZS5cclxuICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwidGltZWxpbmVfY2FyZF9zbWFsbHRpdGxlXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIE1vcm9jY28gTWFzdGVyQ2FyZCBDdXN0b21lcnMgTWVldGluZ3MgMjAxNVxyXG4gICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICAgICAgTGUgR3JvdXBlIEJhbnF1ZSBDZW50cmFsZSBQb3B1bGFpcmUgYSByZW1wb3J0w6kgw6AgY2V0dGUgb2NjYXNpb24gbGUgdHJvcGjDqWUgZGUgY2hhbXBpb24gbmF0aW9uYWwgZOKAmWFjdGl2YXRpb24gZGVzIGNhcnRlcyBkZVxyXG4gICAgICAgICAgICAgICAgICAgICAgcGFpZW1lbnQgVFBFIMKrIFBvcyBVc2FnZSBBY3RpdmF0aW9uIENoYW1waW9uIMK7LmBcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgXSxcclxuICAgICAgICAgIHJpZ2h0OiBbXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICBkYXRlOiAnMTEtMDMtMjAxOCcsXHJcbiAgICAgICAgICAgICAgY29udGVudDogJ0xvcmVtIGlwc3VtIGRvbG9yIHNpdCBhbWV0IGNvbnNlY3RldHVyIGFkaXBpc2ljaW5nIGVsaXQuIERpZ25pc3NpbW9zLCBzdXNjaXBpdCEnLFxyXG4gICAgICAgICAgICAgIG1lZGlhOiAnYXNzZXRzL2ltZy9yZXMtMi5wbmcnXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICBkYXRlOiAnMTEtMDMtMjAxOCcsXHJcbiAgICAgICAgICAgICAgY29udGVudDogJ0xvcmVtIGlwc3VtIGRvbG9yIHNpdCBhbWV0IGNvbnNlY3RldHVyIGFkaXBpc2ljaW5nIGVsaXQuIERpZ25pc3NpbW9zLCBzdXNjaXBpdCEnLFxyXG4gICAgICAgICAgICAgIG1lZGlhOiAnYXNzZXRzL2ltZy9leHBsb3Jlci1tZXRpZXJzMi5wbmcnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIF1cclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB5ZWFyOiAyMDE2LFxyXG4gICAgICAgIGFjdGlvbnM6IHtcclxuICAgICAgICAgIGxlZnQ6IFtcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgIGRhdGU6ICcxMS0wMS0yMDE4JyxcclxuICAgICAgICAgICAgICBjb250ZW50OiAnTG9yZW0gaXBzdW0gZG9sb3Igc2l0IGFtZXQgY29uc2VjdGV0dXIgYWRpcGlzaWNpbmcgZWxpdC4gRGlnbmlzc2ltb3MsIHN1c2NpcGl0ISdcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgIGRhdGU6ICcxMS0wMi0yMDE4JyxcclxuICAgICAgICAgICAgICBjb250ZW50OiAnTG9yZW0gaXBzdW0gZG9sb3Igc2l0IGFtZXQgY29uc2VjdGV0dXIgYWRpcGlzaWNpbmcgZWxpdC4gRGlnbmlzc2ltb3MsIHN1c2NpcGl0ISdcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgIGRhdGU6ICcxMS0wMy0yMDE4JyxcclxuICAgICAgICAgICAgICB0aXRsZTogJ0RJU1RJTkNUSU9OUzxicj4gJlRST1BIw4lFUycsXHJcbiAgICAgICAgICAgICAgY29udGVudDogYDxzcGFuIGNsYXNzPVwidGltZWxpbmVfY2FyZF9zbWFsbHRpdGxlXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIEFmcmljYW4gQmFua2VyIEF3YXJkcyAyMDE1XHJcbiAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgICAgICBUcm9waMOpZSDCqyBCYW5xdWUgQWZyaWNhaW5lIGRlIGzigJlBbm7DqWUgwrsgZMOpY2VybsOpIGF1IEdyb3VwZSBCYW5xdWUgQ2VudHJhbGUgUG9wdWxhaXJlIFRyb3Bow6llIMKrIEluY2x1c2lvbiBGaW5hbmNpw6hyZSDCuyByZW1wb3J0w6lcclxuICAgICAgICAgICAgICAgICAgICAgIHBhciBsYSBmaWxpYWxlIEF0dGF3ZmlxIE1pY3JvLUZpbmFuY2UuIENhcnRlc1xyXG4gICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJ0aW1lbGluZV9jYXJkX3NtYWxsdGl0bGVcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgQWZyaXF1ZSBBd2FyZHMgMjAxNVxyXG4gICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICAgICAgT2J0ZW50aW9uIGR1IHRyb3Bow6llIMKrIEJlc3QgSW5ub3ZhdGl2ZSBDYXJkIFByb2dyYW1tZSDCuyBhdHRyaWJ1w6kgw6AgwqsgR2xvYmFsQ2FyZCDCuywgdW5lIGNhcnRlIG1vbsOpdGlxdWUgcHLDqXBhecOpZSBkZXN0aW7DqWVcclxuICAgICAgICAgICAgICAgICAgICAgIGF1eCB2b3lhZ2V1cnMgZGUgcGFzc2FnZSBhdSBNYXJvYyBldCBxdWkgY29uc3RpdHVlIHVuIG1veWVuIGRlIHN1YnN0aXR1dGlvbiDDoCBsYSBtb25uYWllIGZpZHVjaWFpcmUuXHJcbiAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInRpbWVsaW5lX2NhcmRfc21hbGx0aXRsZVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBNb3JvY2NvIE1hc3RlckNhcmQgQ3VzdG9tZXJzIE1lZXRpbmdzIDIwMTVcclxuICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgICAgIExlIEdyb3VwZSBCYW5xdWUgQ2VudHJhbGUgUG9wdWxhaXJlIGEgcmVtcG9ydMOpIMOgIGNldHRlIG9jY2FzaW9uIGxlIHRyb3Bow6llIGRlIGNoYW1waW9uIG5hdGlvbmFsIGTigJlhY3RpdmF0aW9uIGRlcyBjYXJ0ZXMgZGVcclxuICAgICAgICAgICAgICAgICAgICAgIHBhaWVtZW50IFRQRSDCqyBQb3MgVXNhZ2UgQWN0aXZhdGlvbiBDaGFtcGlvbiDCuy5gXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIF0sXHJcbiAgICAgICAgICByaWdodDogW1xyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgZGF0ZTogJzExLTAzLTIwMTgnLFxyXG4gICAgICAgICAgICAgIGNvbnRlbnQ6ICdMb3JlbSBpcHN1bSBkb2xvciBzaXQgYW1ldCBjb25zZWN0ZXR1ciBhZGlwaXNpY2luZyBlbGl0LiBEaWduaXNzaW1vcywgc3VzY2lwaXQhJyxcclxuICAgICAgICAgICAgICBtZWRpYTogJ2Fzc2V0cy9pbWcvcmVzLTIucG5nJ1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgZGF0ZTogJzExLTAzLTIwMTgnLFxyXG4gICAgICAgICAgICAgIGNvbnRlbnQ6ICdMb3JlbSBpcHN1bSBkb2xvciBzaXQgYW1ldCBjb25zZWN0ZXR1ciBhZGlwaXNpY2luZyBlbGl0LiBEaWduaXNzaW1vcywgc3VzY2lwaXQhJyxcclxuICAgICAgICAgICAgICBtZWRpYTogJ2Fzc2V0cy9pbWcvZXhwbG9yZXItbWV0aWVyczIucG5nJ1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICBdXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgeWVhcjogMjAxNSxcclxuICAgICAgICBhY3Rpb25zOiB7XHJcbiAgICAgICAgICBsZWZ0OiBbXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICBkYXRlOiAnMTEtMDEtMjAxOCcsXHJcbiAgICAgICAgICAgICAgY29udGVudDogJ0xvcmVtIGlwc3VtIGRvbG9yIHNpdCBhbWV0IGNvbnNlY3RldHVyIGFkaXBpc2ljaW5nIGVsaXQuIERpZ25pc3NpbW9zLCBzdXNjaXBpdCEnXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICBkYXRlOiAnMTEtMDItMjAxOCcsXHJcbiAgICAgICAgICAgICAgY29udGVudDogJ0xvcmVtIGlwc3VtIGRvbG9yIHNpdCBhbWV0IGNvbnNlY3RldHVyIGFkaXBpc2ljaW5nIGVsaXQuIERpZ25pc3NpbW9zLCBzdXNjaXBpdCEnXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICBkYXRlOiAnMTEtMDMtMjAxOCcsXHJcbiAgICAgICAgICAgICAgdGl0bGU6ICdESVNUSU5DVElPTlM8YnI+ICZUUk9QSMOJRVMnLFxyXG4gICAgICAgICAgICAgIGNvbnRlbnQ6IGA8c3BhbiBjbGFzcz1cInRpbWVsaW5lX2NhcmRfc21hbGx0aXRsZVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBBZnJpY2FuIEJhbmtlciBBd2FyZHMgMjAxNVxyXG4gICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICAgICAgVHJvcGjDqWUgwqsgQmFucXVlIEFmcmljYWluZSBkZSBs4oCZQW5uw6llIMK7IGTDqWNlcm7DqSBhdSBHcm91cGUgQmFucXVlIENlbnRyYWxlIFBvcHVsYWlyZSBUcm9waMOpZSDCqyBJbmNsdXNpb24gRmluYW5jacOocmUgwrsgcmVtcG9ydMOpXHJcbiAgICAgICAgICAgICAgICAgICAgICBwYXIgbGEgZmlsaWFsZSBBdHRhd2ZpcSBNaWNyby1GaW5hbmNlLiBDYXJ0ZXNcclxuICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwidGltZWxpbmVfY2FyZF9zbWFsbHRpdGxlXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIEFmcmlxdWUgQXdhcmRzIDIwMTVcclxuICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgICAgIE9idGVudGlvbiBkdSB0cm9waMOpZSDCqyBCZXN0IElubm92YXRpdmUgQ2FyZCBQcm9ncmFtbWUgwrsgYXR0cmlidcOpIMOgIMKrIEdsb2JhbENhcmQgwrssIHVuZSBjYXJ0ZSBtb27DqXRpcXVlIHByw6lwYXnDqWUgZGVzdGluw6llXHJcbiAgICAgICAgICAgICAgICAgICAgICBhdXggdm95YWdldXJzIGRlIHBhc3NhZ2UgYXUgTWFyb2MgZXQgcXVpIGNvbnN0aXR1ZSB1biBtb3llbiBkZSBzdWJzdGl0dXRpb24gw6AgbGEgbW9ubmFpZSBmaWR1Y2lhaXJlLlxyXG4gICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJ0aW1lbGluZV9jYXJkX3NtYWxsdGl0bGVcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgTW9yb2NjbyBNYXN0ZXJDYXJkIEN1c3RvbWVycyBNZWV0aW5ncyAyMDE1XHJcbiAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgICAgICBMZSBHcm91cGUgQmFucXVlIENlbnRyYWxlIFBvcHVsYWlyZSBhIHJlbXBvcnTDqSDDoCBjZXR0ZSBvY2Nhc2lvbiBsZSB0cm9waMOpZSBkZSBjaGFtcGlvbiBuYXRpb25hbCBk4oCZYWN0aXZhdGlvbiBkZXMgY2FydGVzIGRlXHJcbiAgICAgICAgICAgICAgICAgICAgICBwYWllbWVudCBUUEUgwqsgUG9zIFVzYWdlIEFjdGl2YXRpb24gQ2hhbXBpb24gwrsuYFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICBdLFxyXG4gICAgICAgICAgcmlnaHQ6IFtcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgIGRhdGU6ICcxMS0wMy0yMDE4JyxcclxuICAgICAgICAgICAgICBjb250ZW50OiAnTG9yZW0gaXBzdW0gZG9sb3Igc2l0IGFtZXQgY29uc2VjdGV0dXIgYWRpcGlzaWNpbmcgZWxpdC4gRGlnbmlzc2ltb3MsIHN1c2NpcGl0IScsXHJcbiAgICAgICAgICAgICAgbWVkaWE6ICdhc3NldHMvaW1nL3Jlcy0yLnBuZydcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgIGRhdGU6ICcxMS0wMy0yMDE4JyxcclxuICAgICAgICAgICAgICBjb250ZW50OiAnTG9yZW0gaXBzdW0gZG9sb3Igc2l0IGFtZXQgY29uc2VjdGV0dXIgYWRpcGlzaWNpbmcgZWxpdC4gRGlnbmlzc2ltb3MsIHN1c2NpcGl0IScsXHJcbiAgICAgICAgICAgICAgbWVkaWE6ICdhc3NldHMvaW1nL2V4cGxvcmVyLW1ldGllcnMyLnBuZydcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgXVxyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHllYXI6IDIwMTQsXHJcbiAgICAgICAgYWN0aW9uczoge1xyXG4gICAgICAgICAgbGVmdDogW1xyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgZGF0ZTogJzExLTAxLTIwMTgnLFxyXG4gICAgICAgICAgICAgIGNvbnRlbnQ6ICdMb3JlbSBpcHN1bSBkb2xvciBzaXQgYW1ldCBjb25zZWN0ZXR1ciBhZGlwaXNpY2luZyBlbGl0LiBEaWduaXNzaW1vcywgc3VzY2lwaXQhJ1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgZGF0ZTogJzExLTAyLTIwMTgnLFxyXG4gICAgICAgICAgICAgIGNvbnRlbnQ6ICdMb3JlbSBpcHN1bSBkb2xvciBzaXQgYW1ldCBjb25zZWN0ZXR1ciBhZGlwaXNpY2luZyBlbGl0LiBEaWduaXNzaW1vcywgc3VzY2lwaXQhJ1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgZGF0ZTogJzExLTAzLTIwMTgnLFxyXG4gICAgICAgICAgICAgIHRpdGxlOiAnRElTVElOQ1RJT05TPGJyPiAmVFJPUEjDiUVTJyxcclxuICAgICAgICAgICAgICBjb250ZW50OiBgPHNwYW4gY2xhc3M9XCJ0aW1lbGluZV9jYXJkX3NtYWxsdGl0bGVcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgQWZyaWNhbiBCYW5rZXIgQXdhcmRzIDIwMTVcclxuICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgICAgIFRyb3Bow6llIMKrIEJhbnF1ZSBBZnJpY2FpbmUgZGUgbOKAmUFubsOpZSDCuyBkw6ljZXJuw6kgYXUgR3JvdXBlIEJhbnF1ZSBDZW50cmFsZSBQb3B1bGFpcmUgVHJvcGjDqWUgwqsgSW5jbHVzaW9uIEZpbmFuY2nDqHJlIMK7IHJlbXBvcnTDqVxyXG4gICAgICAgICAgICAgICAgICAgICAgcGFyIGxhIGZpbGlhbGUgQXR0YXdmaXEgTWljcm8tRmluYW5jZS4gQ2FydGVzXHJcbiAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInRpbWVsaW5lX2NhcmRfc21hbGx0aXRsZVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBBZnJpcXVlIEF3YXJkcyAyMDE1XHJcbiAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgICAgICBPYnRlbnRpb24gZHUgdHJvcGjDqWUgwqsgQmVzdCBJbm5vdmF0aXZlIENhcmQgUHJvZ3JhbW1lIMK7IGF0dHJpYnXDqSDDoCDCqyBHbG9iYWxDYXJkIMK7LCB1bmUgY2FydGUgbW9uw6l0aXF1ZSBwcsOpcGF5w6llIGRlc3RpbsOpZVxyXG4gICAgICAgICAgICAgICAgICAgICAgYXV4IHZveWFnZXVycyBkZSBwYXNzYWdlIGF1IE1hcm9jIGV0IHF1aSBjb25zdGl0dWUgdW4gbW95ZW4gZGUgc3Vic3RpdHV0aW9uIMOgIGxhIG1vbm5haWUgZmlkdWNpYWlyZS5cclxuICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwidGltZWxpbmVfY2FyZF9zbWFsbHRpdGxlXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIE1vcm9jY28gTWFzdGVyQ2FyZCBDdXN0b21lcnMgTWVldGluZ3MgMjAxNVxyXG4gICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICAgICAgTGUgR3JvdXBlIEJhbnF1ZSBDZW50cmFsZSBQb3B1bGFpcmUgYSByZW1wb3J0w6kgw6AgY2V0dGUgb2NjYXNpb24gbGUgdHJvcGjDqWUgZGUgY2hhbXBpb24gbmF0aW9uYWwgZOKAmWFjdGl2YXRpb24gZGVzIGNhcnRlcyBkZVxyXG4gICAgICAgICAgICAgICAgICAgICAgcGFpZW1lbnQgVFBFIMKrIFBvcyBVc2FnZSBBY3RpdmF0aW9uIENoYW1waW9uIMK7LmBcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgXSxcclxuICAgICAgICAgIHJpZ2h0OiBbXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICBkYXRlOiAnMTEtMDMtMjAxOCcsXHJcbiAgICAgICAgICAgICAgY29udGVudDogJ0xvcmVtIGlwc3VtIGRvbG9yIHNpdCBhbWV0IGNvbnNlY3RldHVyIGFkaXBpc2ljaW5nIGVsaXQuIERpZ25pc3NpbW9zLCBzdXNjaXBpdCEnLFxyXG4gICAgICAgICAgICAgIG1lZGlhOiAnYXNzZXRzL2ltZy9yZXMtMi5wbmcnXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICBkYXRlOiAnMTEtMDMtMjAxOCcsXHJcbiAgICAgICAgICAgICAgY29udGVudDogJ0xvcmVtIGlwc3VtIGRvbG9yIHNpdCBhbWV0IGNvbnNlY3RldHVyIGFkaXBpc2ljaW5nIGVsaXQuIERpZ25pc3NpbW9zLCBzdXNjaXBpdCEnLFxyXG4gICAgICAgICAgICAgIG1lZGlhOiAnYXNzZXRzL2ltZy9leHBsb3Jlci1tZXRpZXJzMi5wbmcnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIF1cclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB5ZWFyOiAyMDEzLFxyXG4gICAgICAgIGFjdGlvbnM6IHtcclxuICAgICAgICAgIGxlZnQ6IFtcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgIGRhdGU6ICcxMS0wMS0yMDE4JyxcclxuICAgICAgICAgICAgICBjb250ZW50OiAnTG9yZW0gaXBzdW0gZG9sb3Igc2l0IGFtZXQgY29uc2VjdGV0dXIgYWRpcGlzaWNpbmcgZWxpdC4gRGlnbmlzc2ltb3MsIHN1c2NpcGl0ISdcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgIGRhdGU6ICcxMS0wMi0yMDE4JyxcclxuICAgICAgICAgICAgICBjb250ZW50OiAnTG9yZW0gaXBzdW0gZG9sb3Igc2l0IGFtZXQgY29uc2VjdGV0dXIgYWRpcGlzaWNpbmcgZWxpdC4gRGlnbmlzc2ltb3MsIHN1c2NpcGl0ISdcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgIGRhdGU6ICcxMS0wMy0yMDE4JyxcclxuICAgICAgICAgICAgICB0aXRsZTogJ0RJU1RJTkNUSU9OUzxicj4gJlRST1BIw4lFUycsXHJcbiAgICAgICAgICAgICAgY29udGVudDogYDxzcGFuIGNsYXNzPVwidGltZWxpbmVfY2FyZF9zbWFsbHRpdGxlXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIEFmcmljYW4gQmFua2VyIEF3YXJkcyAyMDE1XHJcbiAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgICAgICBUcm9waMOpZSDCqyBCYW5xdWUgQWZyaWNhaW5lIGRlIGzigJlBbm7DqWUgwrsgZMOpY2VybsOpIGF1IEdyb3VwZSBCYW5xdWUgQ2VudHJhbGUgUG9wdWxhaXJlIFRyb3Bow6llIMKrIEluY2x1c2lvbiBGaW5hbmNpw6hyZSDCuyByZW1wb3J0w6lcclxuICAgICAgICAgICAgICAgICAgICAgIHBhciBsYSBmaWxpYWxlIEF0dGF3ZmlxIE1pY3JvLUZpbmFuY2UuIENhcnRlc1xyXG4gICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJ0aW1lbGluZV9jYXJkX3NtYWxsdGl0bGVcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgQWZyaXF1ZSBBd2FyZHMgMjAxNVxyXG4gICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICAgICAgT2J0ZW50aW9uIGR1IHRyb3Bow6llIMKrIEJlc3QgSW5ub3ZhdGl2ZSBDYXJkIFByb2dyYW1tZSDCuyBhdHRyaWJ1w6kgw6AgwqsgR2xvYmFsQ2FyZCDCuywgdW5lIGNhcnRlIG1vbsOpdGlxdWUgcHLDqXBhecOpZSBkZXN0aW7DqWVcclxuICAgICAgICAgICAgICAgICAgICAgIGF1eCB2b3lhZ2V1cnMgZGUgcGFzc2FnZSBhdSBNYXJvYyBldCBxdWkgY29uc3RpdHVlIHVuIG1veWVuIGRlIHN1YnN0aXR1dGlvbiDDoCBsYSBtb25uYWllIGZpZHVjaWFpcmUuXHJcbiAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInRpbWVsaW5lX2NhcmRfc21hbGx0aXRsZVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBNb3JvY2NvIE1hc3RlckNhcmQgQ3VzdG9tZXJzIE1lZXRpbmdzIDIwMTVcclxuICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgICAgIExlIEdyb3VwZSBCYW5xdWUgQ2VudHJhbGUgUG9wdWxhaXJlIGEgcmVtcG9ydMOpIMOgIGNldHRlIG9jY2FzaW9uIGxlIHRyb3Bow6llIGRlIGNoYW1waW9uIG5hdGlvbmFsIGTigJlhY3RpdmF0aW9uIGRlcyBjYXJ0ZXMgZGVcclxuICAgICAgICAgICAgICAgICAgICAgIHBhaWVtZW50IFRQRSDCqyBQb3MgVXNhZ2UgQWN0aXZhdGlvbiBDaGFtcGlvbiDCuy5gXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIF0sXHJcbiAgICAgICAgICByaWdodDogW1xyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgZGF0ZTogJzExLTAzLTIwMTgnLFxyXG4gICAgICAgICAgICAgIGNvbnRlbnQ6ICdMb3JlbSBpcHN1bSBkb2xvciBzaXQgYW1ldCBjb25zZWN0ZXR1ciBhZGlwaXNpY2luZyBlbGl0LiBEaWduaXNzaW1vcywgc3VzY2lwaXQhJyxcclxuICAgICAgICAgICAgICBtZWRpYTogJ2Fzc2V0cy9pbWcvcmVzLTIucG5nJ1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgZGF0ZTogJzExLTAzLTIwMTgnLFxyXG4gICAgICAgICAgICAgIGNvbnRlbnQ6ICdMb3JlbSBpcHN1bSBkb2xvciBzaXQgYW1ldCBjb25zZWN0ZXR1ciBhZGlwaXNpY2luZyBlbGl0LiBEaWduaXNzaW1vcywgc3VzY2lwaXQhJyxcclxuICAgICAgICAgICAgICBtZWRpYTogJ2Fzc2V0cy9pbWcvZXhwbG9yZXItbWV0aWVyczIucG5nJ1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICBdXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgeWVhcjogMjAxMixcclxuICAgICAgICBhY3Rpb25zOiB7XHJcbiAgICAgICAgICBsZWZ0OiBbXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICBkYXRlOiAnMTEtMDEtMjAxOCcsXHJcbiAgICAgICAgICAgICAgY29udGVudDogJ0xvcmVtIGlwc3VtIGRvbG9yIHNpdCBhbWV0IGNvbnNlY3RldHVyIGFkaXBpc2ljaW5nIGVsaXQuIERpZ25pc3NpbW9zLCBzdXNjaXBpdCEnXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICBkYXRlOiAnMTEtMDItMjAxOCcsXHJcbiAgICAgICAgICAgICAgY29udGVudDogJ0xvcmVtIGlwc3VtIGRvbG9yIHNpdCBhbWV0IGNvbnNlY3RldHVyIGFkaXBpc2ljaW5nIGVsaXQuIERpZ25pc3NpbW9zLCBzdXNjaXBpdCEnXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICBkYXRlOiAnMTEtMDMtMjAxOCcsXHJcbiAgICAgICAgICAgICAgdGl0bGU6ICdESVNUSU5DVElPTlM8YnI+ICZUUk9QSMOJRVMnLFxyXG4gICAgICAgICAgICAgIGNvbnRlbnQ6IGA8c3BhbiBjbGFzcz1cInRpbWVsaW5lX2NhcmRfc21hbGx0aXRsZVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBBZnJpY2FuIEJhbmtlciBBd2FyZHMgMjAxNVxyXG4gICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICAgICAgVHJvcGjDqWUgwqsgQmFucXVlIEFmcmljYWluZSBkZSBs4oCZQW5uw6llIMK7IGTDqWNlcm7DqSBhdSBHcm91cGUgQmFucXVlIENlbnRyYWxlIFBvcHVsYWlyZSBUcm9waMOpZSDCqyBJbmNsdXNpb24gRmluYW5jacOocmUgwrsgcmVtcG9ydMOpXHJcbiAgICAgICAgICAgICAgICAgICAgICBwYXIgbGEgZmlsaWFsZSBBdHRhd2ZpcSBNaWNyby1GaW5hbmNlLiBDYXJ0ZXNcclxuICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwidGltZWxpbmVfY2FyZF9zbWFsbHRpdGxlXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIEFmcmlxdWUgQXdhcmRzIDIwMTVcclxuICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgICAgIE9idGVudGlvbiBkdSB0cm9waMOpZSDCqyBCZXN0IElubm92YXRpdmUgQ2FyZCBQcm9ncmFtbWUgwrsgYXR0cmlidcOpIMOgIMKrIEdsb2JhbENhcmQgwrssIHVuZSBjYXJ0ZSBtb27DqXRpcXVlIHByw6lwYXnDqWUgZGVzdGluw6llXHJcbiAgICAgICAgICAgICAgICAgICAgICBhdXggdm95YWdldXJzIGRlIHBhc3NhZ2UgYXUgTWFyb2MgZXQgcXVpIGNvbnN0aXR1ZSB1biBtb3llbiBkZSBzdWJzdGl0dXRpb24gw6AgbGEgbW9ubmFpZSBmaWR1Y2lhaXJlLlxyXG4gICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJ0aW1lbGluZV9jYXJkX3NtYWxsdGl0bGVcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgTW9yb2NjbyBNYXN0ZXJDYXJkIEN1c3RvbWVycyBNZWV0aW5ncyAyMDE1XHJcbiAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgICAgICBMZSBHcm91cGUgQmFucXVlIENlbnRyYWxlIFBvcHVsYWlyZSBhIHJlbXBvcnTDqSDDoCBjZXR0ZSBvY2Nhc2lvbiBsZSB0cm9waMOpZSBkZSBjaGFtcGlvbiBuYXRpb25hbCBk4oCZYWN0aXZhdGlvbiBkZXMgY2FydGVzIGRlXHJcbiAgICAgICAgICAgICAgICAgICAgICBwYWllbWVudCBUUEUgwqsgUG9zIFVzYWdlIEFjdGl2YXRpb24gQ2hhbXBpb24gwrsuYFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICBdLFxyXG4gICAgICAgICAgcmlnaHQ6IFtcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgIGRhdGU6ICcxMS0wMy0yMDE4JyxcclxuICAgICAgICAgICAgICBjb250ZW50OiAnTG9yZW0gaXBzdW0gZG9sb3Igc2l0IGFtZXQgY29uc2VjdGV0dXIgYWRpcGlzaWNpbmcgZWxpdC4gRGlnbmlzc2ltb3MsIHN1c2NpcGl0IScsXHJcbiAgICAgICAgICAgICAgbWVkaWE6ICdhc3NldHMvaW1nL3Jlcy0yLnBuZydcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgIGRhdGU6ICcxMS0wMy0yMDE4JyxcclxuICAgICAgICAgICAgICBjb250ZW50OiAnTG9yZW0gaXBzdW0gZG9sb3Igc2l0IGFtZXQgY29uc2VjdGV0dXIgYWRpcGlzaWNpbmcgZWxpdC4gRGlnbmlzc2ltb3MsIHN1c2NpcGl0IScsXHJcbiAgICAgICAgICAgICAgbWVkaWE6ICdhc3NldHMvaW1nL2V4cGxvcmVyLW1ldGllcnMyLnBuZydcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgXVxyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHllYXI6IDIwMTEsXHJcbiAgICAgICAgYWN0aW9uczoge1xyXG4gICAgICAgICAgbGVmdDogW1xyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgZGF0ZTogJzExLTAxLTIwMTgnLFxyXG4gICAgICAgICAgICAgIGNvbnRlbnQ6ICdMb3JlbSBpcHN1bSBkb2xvciBzaXQgYW1ldCBjb25zZWN0ZXR1ciBhZGlwaXNpY2luZyBlbGl0LiBEaWduaXNzaW1vcywgc3VzY2lwaXQhJ1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgZGF0ZTogJzExLTAyLTIwMTgnLFxyXG4gICAgICAgICAgICAgIGNvbnRlbnQ6ICdMb3JlbSBpcHN1bSBkb2xvciBzaXQgYW1ldCBjb25zZWN0ZXR1ciBhZGlwaXNpY2luZyBlbGl0LiBEaWduaXNzaW1vcywgc3VzY2lwaXQhJ1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgZGF0ZTogJzExLTAzLTIwMTgnLFxyXG4gICAgICAgICAgICAgIHRpdGxlOiAnRElTVElOQ1RJT05TPGJyPiAmVFJPUEjDiUVTJyxcclxuICAgICAgICAgICAgICBjb250ZW50OiBgPHNwYW4gY2xhc3M9XCJ0aW1lbGluZV9jYXJkX3NtYWxsdGl0bGVcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgQWZyaWNhbiBCYW5rZXIgQXdhcmRzIDIwMTVcclxuICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgICAgIFRyb3Bow6llIMKrIEJhbnF1ZSBBZnJpY2FpbmUgZGUgbOKAmUFubsOpZSDCuyBkw6ljZXJuw6kgYXUgR3JvdXBlIEJhbnF1ZSBDZW50cmFsZSBQb3B1bGFpcmUgVHJvcGjDqWUgwqsgSW5jbHVzaW9uIEZpbmFuY2nDqHJlIMK7IHJlbXBvcnTDqVxyXG4gICAgICAgICAgICAgICAgICAgICAgcGFyIGxhIGZpbGlhbGUgQXR0YXdmaXEgTWljcm8tRmluYW5jZS4gQ2FydGVzXHJcbiAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInRpbWVsaW5lX2NhcmRfc21hbGx0aXRsZVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBBZnJpcXVlIEF3YXJkcyAyMDE1XHJcbiAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgICAgICBPYnRlbnRpb24gZHUgdHJvcGjDqWUgwqsgQmVzdCBJbm5vdmF0aXZlIENhcmQgUHJvZ3JhbW1lIMK7IGF0dHJpYnXDqSDDoCDCqyBHbG9iYWxDYXJkIMK7LCB1bmUgY2FydGUgbW9uw6l0aXF1ZSBwcsOpcGF5w6llIGRlc3RpbsOpZVxyXG4gICAgICAgICAgICAgICAgICAgICAgYXV4IHZveWFnZXVycyBkZSBwYXNzYWdlIGF1IE1hcm9jIGV0IHF1aSBjb25zdGl0dWUgdW4gbW95ZW4gZGUgc3Vic3RpdHV0aW9uIMOgIGxhIG1vbm5haWUgZmlkdWNpYWlyZS5cclxuICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwidGltZWxpbmVfY2FyZF9zbWFsbHRpdGxlXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIE1vcm9jY28gTWFzdGVyQ2FyZCBDdXN0b21lcnMgTWVldGluZ3MgMjAxNVxyXG4gICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICAgICAgTGUgR3JvdXBlIEJhbnF1ZSBDZW50cmFsZSBQb3B1bGFpcmUgYSByZW1wb3J0w6kgw6AgY2V0dGUgb2NjYXNpb24gbGUgdHJvcGjDqWUgZGUgY2hhbXBpb24gbmF0aW9uYWwgZOKAmWFjdGl2YXRpb24gZGVzIGNhcnRlcyBkZVxyXG4gICAgICAgICAgICAgICAgICAgICAgcGFpZW1lbnQgVFBFIMKrIFBvcyBVc2FnZSBBY3RpdmF0aW9uIENoYW1waW9uIMK7LmBcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgXSxcclxuICAgICAgICAgIHJpZ2h0OiBbXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICBkYXRlOiAnMTEtMDMtMjAxOCcsXHJcbiAgICAgICAgICAgICAgY29udGVudDogJ0xvcmVtIGlwc3VtIGRvbG9yIHNpdCBhbWV0IGNvbnNlY3RldHVyIGFkaXBpc2ljaW5nIGVsaXQuIERpZ25pc3NpbW9zLCBzdXNjaXBpdCEnLFxyXG4gICAgICAgICAgICAgIG1lZGlhOiAnYXNzZXRzL2ltZy9yZXMtMi5wbmcnXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICBkYXRlOiAnMTEtMDMtMjAxOCcsXHJcbiAgICAgICAgICAgICAgY29udGVudDogJ0xvcmVtIGlwc3VtIGRvbG9yIHNpdCBhbWV0IGNvbnNlY3RldHVyIGFkaXBpc2ljaW5nIGVsaXQuIERpZ25pc3NpbW9zLCBzdXNjaXBpdCEnLFxyXG4gICAgICAgICAgICAgIG1lZGlhOiAnYXNzZXRzL2ltZy9leHBsb3Jlci1tZXRpZXJzMi5wbmcnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIF1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIF1cclxuICB9XHJcblxyXG4gIGxldCBkYXRhSW5kZXggPSAxXHJcblxyXG4gIGxldCBtYXBwZWREYXRhID0gZGF0YS5wZXJpb2RzLm1hcChwZXJpb2QgPT4ge1xyXG4gICAgcmV0dXJuIGA8ZGl2IGNsYXNzPVwidGltZWxpbmVfcGVyaW9kXCI+XHJcbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJ0aW1lbGluZV9wZXJpb2RfZGF0ZVwiPiR7cGVyaW9kLnllYXJ9PC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInJvd1wiPlxyXG4gICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNvbC1tZC02IG10LTNcIj5cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgJHtwZXJpb2QuYWN0aW9ucy5sZWZ0XHJcbiAgICAgIC5tYXAoYWN0aW9uID0+IHtcclxuICAgICAgICByZXR1cm4gYDxkaXYgY2xhc3M9XCJ0aW1lbGluZV9jYXJkIHRpbWVsaW5lX2NhcmQtbGVmdFwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwidGltZWxpbmVfY2FyZF9jb250ZW50XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cCBjbGFzcz1cInRpbWVsaW5lX2NhcmRfZGF0ZVwiPiR7YWN0aW9uLmRhdGV9PC9wPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHthY3Rpb24udGl0bGUgPyAnPGgyIGNsYXNzPVwidGltZWxpbmVfY2FyZF90aXRsZVwiPicgKyBhY3Rpb24udGl0bGUgKyAnPC9oMj4nIDogJyd9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cCBjbGFzcz1cInRpbWVsaW5lX2NhcmRfdGV4dFwiPiR7YWN0aW9uLmNvbnRlbnR9PC9wPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgJHthY3Rpb24ubWVkaWEgPyBgPGEgY2xhc3M9XCJzd2lwZWJveCBzd2lwZWJveC0tdmlkZW9cIiBocmVmPVwiJHthY3Rpb24ubWVkaWF9XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPGltZyBzcmM9XCIke2FjdGlvbi5tZWRpYX1cIiBhbHQ9XCJcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC9hPmAgOiAnJ31cclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5gXHJcbiAgICAgIH0pXHJcbiAgICAgIC5qb2luKCcnKX1cclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY29sLW1kLTYgbXQtM1wiPlxyXG5cclxuICAgICAgICAgICAgICAgICAgICAke3BlcmlvZC5hY3Rpb25zLnJpZ2h0XHJcbiAgICAgIC5tYXAoYWN0aW9uID0+IHtcclxuICAgICAgICByZXR1cm4gYDxkaXYgY2xhc3M9XCJ0aW1lbGluZV9jYXJkIHRpbWVsaW5lX2NhcmQtcmlnaHRcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInRpbWVsaW5lX2NhcmRfY29udGVudFwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHAgY2xhc3M9XCJ0aW1lbGluZV9jYXJkX2RhdGVcIj4ke2FjdGlvbi5kYXRlfTwvcD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICR7YWN0aW9uLnRpdGxlID8gJzxoMiBjbGFzcz1cInRpbWVsaW5lX2NhcmRfdGl0bGVcIj4nICsgYWN0aW9uLnRpdGxlICsgJzwvaDI+JyA6ICcnfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHAgY2xhc3M9XCJ0aW1lbGluZV9jYXJkX3RleHRcIj4ke2FjdGlvbi5jb250ZW50fTwvcD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICR7YWN0aW9uLm1lZGlhID8gYDxhIGNsYXNzPVwic3dpcGVib3ggc3dpcGVib3gtLXZpZGVvXCIgaHJlZj1cIiR7YWN0aW9uLm1lZGlhfVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxpbWcgc3JjPVwiJHthY3Rpb24ubWVkaWF9XCIgYWx0PVwiXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvYT5gIDogJyd9XHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+YFxyXG4gICAgICB9KVxyXG4gICAgICAuam9pbignJyl9XHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8L2Rpdj5gXHJcbiAgfSlcclxuXHJcbiAgbGV0IHVwZGF0ZVBvc2l0aW9uID0gdHJhY2tlcihmdW5jdGlvbiAocG9zaXRpb24pIHtcclxuICAgIGRhdGFJbmRleCA9IHBvc2l0aW9uXHJcbiAgICByZW5kZXIoKVxyXG4gICAgaWYgKGRhdGFJbmRleCArIDEgPiBtYXBwZWREYXRhLmxlbmd0aCkge1xyXG4gICAgICAkKCcudGltZWxpbmVfYWN0aW9ucy1wbHVzJykuY3NzKCdkaXNwbGF5JywgJ25vbmUnKVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgJCgnLnRpbWVsaW5lX2FjdGlvbnMtcGx1cycpLmNzcygnZGlzcGxheScsICdibG9jaycpXHJcbiAgICB9XHJcbiAgfSkgLy8gaW5pdCB0aGUgdHJhY2tiYXJcclxuXHJcbiAgZnVuY3Rpb24gcmVuZGVyICgpIHtcclxuICAgIGxldCB0b1JlbmRlciA9ICcnXHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRhdGFJbmRleDsgaSsrKSB7XHJcbiAgICAgIHRvUmVuZGVyICs9IG1hcHBlZERhdGFbaV1cclxuICAgIH1cclxuICAgIGxldCBhY3Rpb25zSG9sZGVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnRpbWVsaW5lX2FjdGlvbnMnKVxyXG4gICAgaWYgKGFjdGlvbnNIb2xkZXIpIHtcclxuICAgICAgYWN0aW9uc0hvbGRlci5pbm5lckhUTUwgPSB0b1JlbmRlclxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gaW5jcmVtZW50ICgpIHtcclxuICAgIGRhdGFJbmRleCsrXHJcbiAgICBpZiAoZGF0YUluZGV4ICsgMSA+IG1hcHBlZERhdGEubGVuZ3RoKSB7XHJcbiAgICAgICQoJy50aW1lbGluZV9hY3Rpb25zLXBsdXMnKS5jc3MoJ2Rpc3BsYXknLCAnbm9uZScpXHJcbiAgICB9XHJcbiAgICB1cGRhdGVQb3NpdGlvbihkYXRhSW5kZXggLSAxKVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gc2Nyb2xsVG9MYXN0ICgpIHtcclxuICAgIGxldCBhY3Rpb25zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLnRpbWVsaW5lX3BlcmlvZCcpXHJcbiAgICBhY3Rpb25zW2FjdGlvbnMubGVuZ3RoIC0gMV0uc2Nyb2xsSW50b1ZpZXcoe1xyXG4gICAgICBiZWhhdmlvcjogJ3Ntb290aCdcclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICByZW5kZXIoKVxyXG5cclxuICAkKCcudGltZWxpbmVfYWN0aW9ucy1wbHVzJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgaW5jcmVtZW50KClcclxuICAgIHJlbmRlcigpXHJcbiAgICBzY3JvbGxUb0xhc3QoKVxyXG4gIH0pXHJcbn1cclxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XHJcbiAgICAkKCcudG9wLWhlYWRlcl9saXN0IC5saXN0LCAudG9wLWhlYWRlcl9saXN0IC5sYW5nJykub24oJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmICghJChlLnRhcmdldCkuY2xvc2VzdCgnLmRyb3Bkb3duJykubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgICQodGhpcykudG9nZ2xlQ2xhc3MoJ29wZW4nKTtcclxuICAgICAgICAkKHRoaXMpLmZpbmQoJy5kcm9wZG93bicpLnRvZ2dsZUNsYXNzKCdkLW5vbmUnKTtcclxuICAgIH0pO1xyXG5cclxuICAgICQoJyonKS5vbignY2xpY2snLCBmdW5jdGlvbihlKSB7XHJcblxyXG4gICAgICAgIGlmICghJC5jb250YWlucygkKCcudG9wLWhlYWRlcl9saXN0JylbMF0sICQoZS50YXJnZXQpWzBdKSAmJiBcclxuICAgICAgICAgICAgKCQoJy5sYW5nJykuaGFzQ2xhc3MoJ29wZW4nKSB8fFxyXG4gICAgICAgICAgICAkKCcubGlzdCcpLmhhc0NsYXNzKCdvcGVuJykpICkge1xyXG5cclxuICAgICAgICAgICAgY2xvc2VEcm9wZG93bnMoKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBmdW5jdGlvbiBjbG9zZURyb3Bkb3ducygpIHtcclxuICAgICAgICBpZiAoJCgnLnRvcC1oZWFkZXJfbGlzdCAubGlzdCcpLmhhc0NsYXNzKCdvcGVuJykpIHtcclxuICAgICAgICAgICAgJCgnLnRvcC1oZWFkZXJfbGlzdCAubGlzdCcpLnRvZ2dsZUNsYXNzKCdvcGVuJyk7XHJcbiAgICAgICAgICAgICQoJy50b3AtaGVhZGVyX2xpc3QgLmxpc3QnKS5maW5kKCcuZHJvcGRvd24nKS50b2dnbGVDbGFzcygnZC1ub25lJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoJCgnLnRvcC1oZWFkZXJfbGlzdCAubGFuZycpLmhhc0NsYXNzKCdvcGVuJykpIHtcclxuICAgICAgICAgICAgJCgnLnRvcC1oZWFkZXJfbGlzdCAubGFuZycpLnRvZ2dsZUNsYXNzKCdvcGVuJyk7XHJcbiAgICAgICAgICAgICQoJy50b3AtaGVhZGVyX2xpc3QgLmxhbmcnKS5maW5kKCcuZHJvcGRvd24nKS50b2dnbGVDbGFzcygnZC1ub25lJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59Il19
