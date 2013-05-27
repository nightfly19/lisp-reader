var tokenHunter = require("tokenhunter");

module.exports = function(){};

var Reader = module.exports;

Reader.prototype.Symbol = function(name){
    this.name = name;
};

Reader.prototype.symbolEquals = function(a, b){
    return typeof a == 'object' &&
        typeof b == 'object' &&
        a instanceof this.Symbol &&
        b instanceof this.Symbol &&
        a.name == b.name;
};

Reader.prototype.reader_macros = [];

Reader.prototype.addReaderMacro = function(name, rule, callback){
    var new_reader_macro = {name: name,
                            rule: rule,
                            callback: callback(this)}
    this.reader_macros = this.reader_macros.slice(0);
    this.reader_macros.push(new_reader_macro);
    return this;
};

Reader.prototype.updateReaderMacro = function(name, rule, callback){
    this.reader_macros = this.reader_macros.slice(0);
    for (var i in this.reader_macros){
        var reader_macro = this.reader_macros[i];
        if( reader_macro.name = name){
            this.reader_macros[rule] = {name: name,
                                        rule: rule,
                                        callback: callback(this)};
            return this;
        }
    }
    return this.addReaderMacro(name, rule, callback);
};

Reader.prototype.emptyList = function(){
    return [];
};

Reader.prototype.listCons = function(list, element){
    list.push(element);
    return list;
};

Reader.prototype.addReaderMacro('eof', /^$/, function(){
    return function(input_string){
        return {tail:input_string, error: 'eof'}
    };
});

Reader.prototype.addReaderMacro('whitespace', /^[\s,]/, function(){
    var whitespace_rule = /^[\s,]+$/;
    return function(input_string, reader){
        var token = tokenHunter(whitespace_rule, input_string);
        return reader.readFromString(token.tail);
    };
});

Reader.prototype.addReaderMacro('closing_paren', /^\)/, function(reader){
    return function(input_string){
        return {value: new reader.Symbol(')'), tail:input_string.substring(1)}
    };
});

Reader.prototype.addReaderMacro('opening_paren', /^\(/, function(reader){
    var closing_paren = new reader.Symbol(')');
    return function(input_string, reader){
        var tail = input_string.substring(1);
        var element = {};
        var value = reader.emptyList();
        var eof = false;
        var done = false;
        while(!element.error && !done){
            element = reader.readFromString(tail);
            tail = element.tail;
            if(reader.symbolEquals(element.value, closing_paren)){
                done = true;
            }
            else{
                value = reader.listCons(value, element.value);
            }
        }
        return done ? {value: value, tail: tail} : {tail: input_string, error: "eof"};
    };
});

Reader.prototype.addReaderMacro('number', /^[0-9]/, function(){
    var symbol_rule = /^([0-9]+\.?[0-9]*)$/;
    return function(input_string){
        var token = tokenHunter(symbol_rule, input_string);
        return !token.err ? {value: Number(token.token), tail: token.tail} : {tail: input_string, error: "eof"};
    };
});

Reader.prototype.addReaderMacro('string', /^\"/, function(){
    var string_rule = /^"(?:(?:[^"])|(?:\\"))*"$/;
    return function(input_string){
        var token = tokenHunter(string_rule, input_string);
        if (token.err){
            return {tail: input_string, error: "eof"};
        }
        else{
            var temp = token.token.substring(1,token.token.length - 1);
            return {value: temp, tail: token.tail};
        }
    };
});

Reader.prototype.addReaderMacro('symbol', /^[^\s\(\)\'\#\[\]\{\}]/, function(reader){
    var symbol_rule = /^([^\s\(\)\'\#\[\]\{\}]+)$/;
    return function(input_string){
        var token = tokenHunter(symbol_rule, input_string);
        return !token.err ? {value: new reader.Symbol(token.token), tail: token.tail} : {tail: input_string, error: "eof"};
    };
});

Reader.prototype.readFromString = function(input_string){
    for (var i in this.reader_macros){
        var reader_macro = this.reader_macros[i];
        if (reader_macro.rule.test(input_string)){
            return reader_macro.callback(input_string, this);
        }
    };
    return {tail:input_string, error:'illegal_input'};
};
