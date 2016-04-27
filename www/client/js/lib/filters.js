

angular.module('app.filters').filter('brandFilter', function() {
    return function(carsList, brand) {
        if(!carsList || carsList.length==0) return carsList
        if(!brand || brand.all){ return carsList}
        var result = []
        angular.forEach(carsList,function(car){
            //if(car["vehicleLicense"]==brand["vehicleLicense"]){
            //    this.push(car)
            //}
            //if(car["brand"]==brand["brand"]){
            if(car["vehicleVersionName"]==brand["brand"]){
                this.push(car)
            }
        },result)
        return result
    };
})

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

//
//angular.module('app.filters').filter('priceFilter', function() {
//    return function(type) {
//        if(type == 'day'){ //白天租
//            return '50元/白天'
//        }else if(type == 'night'){//晚上租
//            return '50元/晚上'
//        }else{//整租
//            return '50元/天'
//        }
//    };
//})

angular.module('app.filters').filter('rentType', function() {
    return function(type) {
        if (type == 'day') {
            return '白天'
        } else if (type == 'night') {
            return '包夜'
        } else {//整租
            return '整租'
        }
    };
})

angular.module('app.filters').filter('priceUnitType', function() {
    return function(type) {
        if (type == 'day') {
            return '元/白天'
        } else if (type == 'night') {
            return '元/包夜'
        } else {//整租
            return '元/天'
        }
    };
})