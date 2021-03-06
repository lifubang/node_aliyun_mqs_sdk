"use strict";

var _ = require('lodash');
var xml = require('./xml');
var Promise = require('mpromise');
var undef;

var Message = function(client){
  this.client = client;
};

Message.prototype.send = function(queue, data, callback){
  var self = this;
  var uri  = '/' + queue + '/messages';
  data = data || {};
  data = _.extend({
    MessageBody: data.msg || '',
    DelaySeconds: data.hold || 0,
    Priority: data.level || 8
  }, data);
  data.msg = data.level = data.hold = '';

  var promise;
  if(undef === callback){
    promise = new Promise();
    callback = function(err, data){
      if(err){
        promise.reject(err.message);
      }
      else{
        promise.resolve(null, data);
      }
    };
  }

  this.client.send('POST', {}, xml.build(data, 'Message'), uri, function(error, response, xmlStr){
    var err = error || self.client.getError(xmlStr);
    if(err){
      return callback({
        code: err.code || error,
        message: err.message || error
      });
    }

    var keyMap = [
      'MessageId',
      'MessageBodyMD5'
    ];

    var data = {};
    _.each(keyMap, function(v){
      var tag = xml.getOneTag(xmlStr, v);
      if(tag !== null){
        data[v] = tag;
      }
    });

    callback(null, data);
  });

  return promise;
};

Message.prototype.get = function(queue, wait, callback){
  wait = wait || 0;

  var self = this;
  var uri  = '/' + queue + '/messages?waitseconds=' + wait;

  var promise;
  if(undef === callback){
    promise = new Promise();
    callback = function(err, data){
      if(err){
        promise.reject(err.message);
      }
      else{
        promise.resolve(null, data);
      }
    };
  }


  this.client.send('GET', {}, '', uri, function(error, response, xmlStr){
    var err = error || self.client.getError(xmlStr);
    if(err){
      return callback({
        code: err.code || error,
        message: err.message || error
      });
    }

    var keyMap = [
      'MessageId',
      'ReceiptHandle',
      'MessageBody',
      'MessageBodyMD5',
      'EnqueueTime',
      'NextVisibleTime',
      'FirstDequeueTime',
      'DequeueCount',
      'Priority'
    ];

    var data = {};
    _.each(keyMap, function(v){
      var tag = xml.getOneTag(xmlStr, v);
      if(tag !== null){
        data[v] = tag;
      }
    });

    callback(null, data);
  });

  return promise;
};

Message.prototype.peek = function(queue, callback){

  var self = this;
  var uri  = '/' + queue + '/messages?peekonly=true';

  var promise;
  if(undef === callback){
    promise = new Promise();
    callback = function(err, data){
      if(err){
        promise.reject(err.message);
      }
      else{
        promise.resolve(null, data);
      }
    };
  }


  this.client.send('GET', {}, '', uri, function(error, response, xmlStr){
    var err = error || self.client.getError(xmlStr);
    if(err){
      return callback({
        code: err.code || error,
        message: err.message || error
      });
    }

    var keyMap = [
      'MessageId',
      'MessageBody',
      'MessageBodyMD5',
      'EnqueueTime',
      'FirstDequeueTime',
      'DequeueCount',
      'Priority'
    ];

    var data = {};
    _.each(keyMap, function(v){
      var tag = xml.getOneTag(xmlStr, v);
      if(tag !== null){
        data[v] = tag;
      }
    });

    callback(null, data);
  });

  return promise;
};

Message.prototype.remove = function(queue, receiptHandle, callback){
  var self = this;
  var uri  = '/' + queue + '/messages?ReceiptHandle=' + receiptHandle;

  var promise;
  if(undef === callback){
    promise = new Promise();
    callback = function(err, data){
      if(err){
        promise.reject(err.message);
      }
      else{
        promise.resolve(null, data);
      }
    };
  }

  this.client.send('DELETE', {}, '', uri, function(error, response, xmlStr){
    var err = error || self.client.getError(xmlStr);
    if(err){
      return callback({
        code: err.code || error,
        message: err.message || error
      });
    }
    callback(null);
  });

  return promise;
};

Message.prototype.change = function(queue, receiptHandle, visibilityTimeout, callback){
  var self = this;
  var uri  = '/' + queue + 
             '/messages?ReceiptHandle=' + receiptHandle +
             '&VisibilityTimeout=' + visibilityTimeout;

  var promise;
  if(undef === callback){
    promise = new Promise();
    callback = function(err, data){
      if(err){
        promise.reject(err.message);
      }
      else{
        promise.resolve(null, data);
      }
    };
  }

  this.client.send('PUT', {}, '', uri, function(error, response, xmlStr){
    var err = error || self.client.getError(xmlStr);
    if(err){
      return callback({
        code: err.code || error,
        message: err.message || error
      });
    }
    callback(null);

    var keyMap = [
      'ReceiptHandle',
      'NextVisibleTime'
    ];

    var data = {};
    _.each(keyMap, function(v){
      var tag = xml.getOneTag(xmlStr, v);
      if(tag !== null){
        data[v] = tag;
      }
    });

    callback(null, data);
  });

  return promise;
};

module.exports = Message;