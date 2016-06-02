var sinon = require('sinon');

var responseObject = {
    status: sinon.stub().returns(arguments.callee),
    json: sinon.stub().returns(arguments.callee)
};

module.exports = responseObject;