// async version calls method on the server
exports.command = function () {
  var client = this;

  this
    .timeoutsAsyncScript(5000)
    .executeAsync(function (data, meteorCallback) {
      //return HipaaLogger.logEventObject(data);
      Meteor.call("dropEntryUsers", data, function (meteorError, meteorResult) {
        var response = (meteorError ? {
          error: meteorError
        } : {
          result: meteorResult
        });
        meteorCallback(response);
      });
    }, [], function (result) {
    }).pause(1000);
  return this;
};
