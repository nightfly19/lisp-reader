var reader = exports;

var Symbol = reader.Symbol = function(name){
    this.name = name;
};

var symbol = reader.symbol = function(name){
    return new reader.Symbol(name);
};

var symbolEquals = reader.symbolEquals = function(a, b){
    return typeof a == 'object' &&
        typeof b == 'object' &&
        a.name == b.name;
};

var reader_macros = reader.reader_macros = []

var addReaderMacro = reader.addReaderMacro = function(name, rule, callback){
    var new_reader_macro = {name: name,
                            rule: rule,
                            callback: callback}
    reader_macros.push(new_reader_macro);
    return reader;
};

var updateReaderMacro = reader.updateReaderMacro = function(name, rule, callback){
    for (var rule in reader_macros){
        var reader_macro = reader_macros[rule];
        if( reader_macro.name = name){
            reader_macro.rule = rule;
            reader_macro.callback = callback;
            return reader_macro;
        }
    };
    addReaderMacro(name, rule, callback);
};

var searchForToken = function (token_rule,input_string){
    var search = '';
    var tail = input_string;
    var last_tail = '';
    var match;
    var last_match;
    var began_matching = false;
    var stopped_matching = false;
    var eof = false;
    while (!stopped_matching && tail.length > 0){
        search = search + tail[0];
        last_tail = tail;
        tail = tail.substring(1);
        last_match = match;
        match = token_rule.exec(search);
        if(!began_matching && match){
            began_matching = true
        }
        if(began_matching && !match){
            stopped_matching = true
        }
        eof = (tail.length == 0);
    };
    if(stopped_matching){
        return {token:last_match[1], tail:last_tail}
    }
    else if (eof && began_matching){
        return {token:match[1], tail:tail}
    }
    else{
        return null;
    }
};

var emptyList = reader.emptyList = function(){
    return [];
};

var listCons = reader.listCons = function(list, element){
    list.push(element);
    return list;
};

addReaderMacro('eof', /^$/, function(input_string){return null});

addReaderMacro('whitespace', /^[\s,]/, function(){
    var whitespace_rule = /^[\s,]+$/;
    return function(input_string){
        var token = searchForToken(whitespace_rule, input_string);
        return readFromString(token.tail);
    };
}());

addReaderMacro('closing_paren', /^\)/, function(input_string){
    return {value: symbol(')'), tail:input_string.substring(1)}
});

addReaderMacro('opening_paren', /^\(/, function(){
    var closing_paren = symbol(')');
    return function(input_string){
        var tail = input_string.substring(1);
        var element = {};
        var value = reader.emptyList();
        var eof = false;
        var done = false;
        while(!element.eof && !done){
            element = readFromString(tail);
            tail = element.tail;
            if(symbolEquals(element.value, closing_paren)){
                done = true;
            }
            else{
                value = reader.listCons(value, element.value);
            }
        }
        return {value: value, tail: tail};
    };
}());

addReaderMacro('number', /^[0-9]/, function(){
    var symbol_rule = /^([0-9]+\.?[0-9]*)$/;
    return function(input_string){
        var token = searchForToken(symbol_rule, input_string);
        return token ? {value: Number(token.token), tail: token.tail} : null;
    };
}());

addReaderMacro('string', /^\"/, function(){
    var string_rule = /^"((?:(?:[^"])|(?:\\"))*)"$/;
    return function(input_string){
        var token = searchForToken(string_rule, input_string);
        return token ? {value: token.token, tail: token.tail} : null;
    };
}());

addReaderMacro('symbol', /^\S/, function(){
    var symbol_rule = /^([^\s\)]+)$/;
    return function(input_string){
        var token = searchForToken(symbol_rule, input_string);
        return token ? {value: symbol(token.token), tail: token.tail} : null;
    };
}());

//list: function(){},
//number: function(){},
//quote: function(){}
//backquote: function(){},
//object: function().
//array: function()

var innerReadFromString = reader.innerReadFromString = function(input_string){
    for (var i in reader_macros){
        var reader_macro = reader_macros[i];
        if (reader_macro.rule.test(input_string)){
            return reader_macro.callback(input_string);
        }
    };
};

var readFromString = reader.readFromString = function(input_string){
    var result = innerReadFromString(input_string);
    if (result){
        return result;
    }
    else{
        return {value: undefined,
                tail: input_string,
                eof: true};
    }
};

//console.log(readFromString('"hello" there'));
//console.log(readFromString('1234.123123 sdfsf'));
//console.log(readFromString('1234.123.123 sdfsf'));
//console.log(innerReadFromString('helloworld)   '));
//console.log(readFromString('    ,"hello"'));
console.log(readFromString('(1 2 3 4 5)more'));
