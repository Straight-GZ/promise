function myPromise(executor) {
  let self = this;
  self.status = "pending"; //定义status状态
  self.onResolvedCallback = [];
  self.onRejectedCallback = [];

  function resolve(value) {
    if (value instanceof myPromise) {
      return value.then(resolve, reject);
    }
    setTimeout(() => {
      if (self.status === "pending") {
        self.status = "resolved";
        self.data = value;
        for (let i = 0; i < self.onResolvedCallback.length; i++) {
          self.onResolvedCallback[i](value);
        }
      }
    });
  }

  function reject(reason) {
    setTimeout(() => {
      if (self.status === "pending") {
        self.status = "reject";
        self.data = reason;
        for (let i = 0; i < self.onRejectedCallback.length; i++) {
          self.onRejectedCallback[i](reason);
        }
      }
    });
  }

  try {
    executor(resolve, reject);
  } catch (reason) {
    reject(reason);
  }
}

myPromise.prototype.then = function (fn1, fn2) {
  let self = this;
  let promise2;
  fn1 =
    typeof fn1 === "function"
      ? fn1
      : function (v) {
          return v;
        };
  fn2 =
    typeof fn2 === "function"
      ? fn2
      : function (r) {
          throw r;
        };

  if (self.status === "resolve") {
    return (promise2 = new myPromise((resolve, reject) => {
      setTimeout(() => {
        try {
          let x = fn1(self.data);
          resolvePromise(promise2, x, resolve, reject);
        } catch (reason) {
          reject(reason);
        }
      });
    }));
  }

  if (self.status === "rejected") {
    return (promise2 = new myPromise((resolve, reject) => {
      setTimeout(() => {
        try {
          let x = fn2(self.data);
          resolvePromise(promise2, x, resolve, reject);
        } catch (reason) {
          reject(reason);
        }
      });
    }));
  }

  if (self.status === "pending") {
    return (promise2 = new myPromise((resolve, reject) => {
      self.onResolvedCallback.push((value) => {
        try {
          let x = fn1(value);
          resolvePromise(promise2, x, resolve, reject);
        } catch (r) {
          reject(r);
        }
      });

      self.onRejectCallback.push((reason) => {
        try {
          let x = fn2(reason);
          resolvePromise(promise2, x, resolve, reject);
        } catch (r) {
          reject(r);
        }
      });
    }));
  }
};

function resolvePromise(promise2, x, resolve, reject) {
  if (promise2 === x) {
    return reject(new TypeError("....."));
  }
  if (x instanceof myPromise) {
    x.then(
      function (data) {
        resolve(data);
      },
      function (e) {
        reject(e);
      }
    );
    return;
  }
  if ((x !== null && typeof x === "object") || typeof x === "function") {
    try {
      var then = x.then;
      var called;
      if (typeof then === "function") {
        then.call(
          x,
          (y) => {
            if (called) {
              return;
            }
            called = true;
            return resolvePromise(promise2, y, resolve, reject);
          },
          (r) => {
            if (called) {
              return;
            }
            called = true;
            return reject(r);
          }
        );
      } else {
        resolve(x);
      }
    } catch (e) {
      if (called) {
        return;
      }
      return reject(e);
    }
  } else {
    resolve(x);
  }
}
window.myPromise = myPromise;
const promise = new myPromise((resolve, reject) => {
  const x = 2;
  reject(x);
});
promise.then(
  (data) => {
    console.log("data:" + data);
  },
  (err) => {
    console.log("err:" + err);
  }
);
console.log("1");
