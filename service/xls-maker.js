const { Parser } = require('json2csv');

exports.statementAttachment = (content)=>{
 
    const { parse } = require('json2csv');
    console.log(content)
    
    var headers = JSON.parse(JSON.stringify(content[0]))
    delete headers["_id"]
    delete headers["__v"]
    var fields = Object.keys(headers);
    
    const opts = { fields };
    try {
        const csv = parse(content, opts);
        console.log(csv)

        return[{filename: `${new Date().getTime()}.csv`,content:csv}]
    } catch (err) {
    }
    return null;
}