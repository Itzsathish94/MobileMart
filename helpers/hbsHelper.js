const moment = require('moment');

function incHelper(Handlebars) {

    Handlebars.registerHelper('inc', function (value) {
        return value + 1;
    });
}
function isCancelled(Handlebars) {
    Handlebars.registerHelper('statuchecker', function (value) {
        let ct=0
        let returnct= value.product.forEach((elem)=>{
            if(elem.isReturned)ct++
        })
        let allCancelled = value.product.every(product => product.isCancelled);
        
        let allReturned = value.product.every(product => product.isReturned);
        console.log(value.product,"value.product",allCancelled,allReturned)
        if(value.status=="Delivered" ){
            return new Handlebars.SafeString(`
            <button id="returnOrder" data-order-id="${value._id}" class="btn btn-sm btn-primary">Return Entire Order</button>
        `);


        }else{

        if (allCancelled || value.status == 'Cancelled') {
            return new Handlebars.SafeString('<span class="badge rounded-pill alert-danger text-danger">Order Cancelled</span>');
        } else if (ct>0) {
            return new Handlebars.SafeString('<span class="badge rounded-pill alert-info text-info">Order Returned</span>');
        } else {
            return new Handlebars.SafeString(`
                <button id="cancelOrder" data-order-id="${value._id}" class="btn btn-sm btn-primary">Cancel Entire Order</button>
            `);
        }
    }
    });
}
function signleIsCancelled(Handlebars) {
    Handlebars.registerHelper('singlestatuchecker', function (value, options) {
        if ( value.status == 'Delivered') {
            return options.fn(this)
        }else  {
            return options.inverse(this)
        }
    });
}
function isCancelled(Handlebars) {
    Handlebars.registerHelper('statuchecker',  function (value) {
        let ct=0
        let ct2=0
        let returnct= value.product.forEach((elem)=>{
            if(elem.isReturned)ct++
        })
        let returnct2= value.product.forEach((elem)=>{
            if(elem.isCancelled)ct2++
        })

        let allCancelled = value.product.every(product => product.isCancelled);
        let allReturned = value.product.every(product => product.isReturned);
        if (value.status === "Delivered") {
            return new Handlebars.SafeString(`
                <button id="returnOrder" data-order-id="${value._id}" class="btn btn-sm btn-primary">Return Order</button>
            `);
        } else if (value.status == "Returned") {
            return new Handlebars.SafeString('<span class="badge rounded-pill alert-info text-info">Order Returned</span>');
        } else {
            if (allCancelled || value.status === 'Cancelled') {
                return new Handlebars.SafeString('<span class="badge rounded-pill alert-danger text-danger">Order Cancelled</span>');
            } else if (ct>0 ) {
                return new Handlebars.SafeString('<span class="badge rounded-pill alert-info text-info">Order Returned</span>');
            } else {
                return new Handlebars.SafeString(`
                    <button id="cancelOrder" data-order-id="${value._id}" class="btn btn-sm btn-primary">Cancel Order</button>
                `);
            }
        }
    });
}

function singleIsCancelled(Handlebars) {
    Handlebars.registerHelper('singlestatuchecker', function (product, options) {
        if (product.isReturned) {
            return new Handlebars.SafeString('<span class="badge rounded-pill alert-info text-info">Returned</span>');
        } else if (product.isCancelled) {
            return new Handlebars.SafeString('<span class="badge rounded-pill alert-danger text-danger">Cancelled</span>');
        } else {
            return options.fn(this);
        }
    });
}

function eq(Handlebars){
    Handlebars.registerHelper('eq', function(a, b) {
        return a === b;
      });
    }
    function Noteq(Handlebars){
        Handlebars.registerHelper('Noteq', function(a, b) {
            return a !== b;
          });
        }

function mulHelper(Handlebars) {

    Handlebars.registerHelper('multiply', function (value1, value2) {
        return value1 * value2;
    });
}

function subHelper(Handlebars) {

    Handlebars.registerHelper('subtract', function (value1, value2) {
        return value1 - value2;
    });
}

function addHelper(Handlebars) {

    Handlebars.registerHelper('add', function (value1, value2) {
        return value1 + value2;
    });
}
function statushelper(Handlebars){
    Handlebars.registerHelper('ifeq', function (a, b, options) {
        if (a == b) { return options.fn(this); }
        return options.inverse(this);
      });
}

function formatDate(Handlebars) {

    Handlebars.registerHelper('formatDate', function (isoDate) {
        const monthYear = moment(isoDate).format('DD-MM-YYYY HH:mm:ss');

    
        return `${monthYear}`;
    });
}
function length(Handlebars) {

    Handlebars.registerHelper('length', function (value,options) {
        if (value && value.length>0){
            return options.fn(this)
        } 
        else {
            return options.inverse(this)
        }
    });
}
function isequal(Handlebars) {
    Handlebars.registerHelper('ifEquals', function (arg1, arg2, options) {
        //console.log(arg1,arg2,options)
        return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
    });
}
 function ifCondition(Handlebars){
    Handlebars.registerHelper('ifCond', function (v1, operator, v2, options) {
        switch (operator) {
            case '==':
                return (v1 == v2) ? options.fn(this) : options.inverse(this);
            case '===':
                return (v1 === v2) ? options.fn(this) : options.inverse(this);
            case '!=':
                return (v1 != v2) ? options.fn(this) : options.inverse(this);
            case '!==':
                return (v1 !== v2) ? options.fn(this) : options.inverse(this);
            case '<':
                return (v1 < v2) ? options.fn(this) : options.inverse(this);
            case '<=':
                return (v1 <= v2) ? options.fn(this) : options.inverse(this);
            case '>':
                return (v1 > v2) ? options.fn(this) : options.inverse(this);
            case '>=':
                return (v1 >= v2) ? options.fn(this) : options.inverse(this);
            case '&&':
                return (v1 && v2) ? options.fn(this) : options.inverse(this);
            case '||':
                return (v1 || v2) ? options.fn(this) : options.inverse(this);
            default:
                return options.inverse(this);
        }
    });
    
 } 
module.exports = {

    incHelper,
    mulHelper,
    subHelper,
    addHelper,
    formatDate,
    length,
    isCancelled,
    isequal,
    statushelper,
    ifCondition,
    singleIsCancelled,eq,
    Noteq,
}