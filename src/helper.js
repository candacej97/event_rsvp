
const register = function(Handlebars) {
  const helpers = {
    // put all of your helpers inside this object
    for: function(n, block) {
      let accum = '';
      for (let i = 1; i < n+1; ++i)
          accum += block.fn(i);
      return accum;
    },
    ifEq: function(x, options) {
      const rsvpedFor = options.data.root.rsvpedFor;

      if(this == rsvpedFor) {
        return `selected="true"`;
      }
    }
  };

  if (Handlebars && typeof Handlebars.registerHelper === "function") {
    // register helpers
    for (const prop in helpers) {
        Handlebars.registerHelper(prop, helpers[prop]);
    }
  } else {
      // just return helpers object if we can't register helpers here
      return helpers;
  }

};

module.exports.register = register;
module.exports.helpers = register(null);  

// code from https://stackoverflow.com/questions/41423727/handlebars-registerhelper-serverside-with-expressjs