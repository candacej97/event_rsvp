function hbsHelpers(hbs) {
    return hbs.create({
      helpers: {
        // helper function to mimic normal for-loop (looping a certain amount of times)
        for: function(n, block) {
          let accum = '';
          for (let i = 0; i < n; ++i)
              accum += block.fn(i);
          return accum;
        }
  
        // add more helpers...
      }
  
    });
  }
  
  module.exports = hbsHelpers;