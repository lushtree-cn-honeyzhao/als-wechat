
angular.module('app.filters').filter('required', function() {
    return function(iterms,require) {
        var result = []
        angular.forEach(iterms,function(iterm){
            if(require==true){
                if(iterm['selected']==undefined){
                    this.push(iterm)
                }
            }else if(require==false){
                if(iterm['selected'] !=undefined){
                    this.push(iterm)
                }
            }
        },result)
        return result
    };
})
