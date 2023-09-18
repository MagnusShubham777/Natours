class APIfeatures {
    constructor(query, queryStr) {
        this.query = query;
        this.queryStr = queryStr;
    }
    filter() {
        //1A)BASIC FILTER
        const Obj = { ...this.queryStr };
        const excludeFields = ['page', 'sort', 'limit', 'fields'];
        excludeFields.forEach(el => delete Obj[el]);


        //1B)ADVANCE FILTER

        let Objstr = JSON.stringify(Obj)
        Objstr = Objstr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
        console.log(Objstr);

        this.query = this.query.find(JSON.parse(Objstr));
        return this;


    }
    sort() {
        if (this.queryStr.sort) {
            const SortBy = this.queryStr.sort.split(',').join(' ');
            this.query = this.query.sort(SortBy);
        }
        return this;

    }
    feildLimit() {
        if (this.queryStr.fields) {
            const fields = this.queryStr.fields.split(',').join(' ');
            this.query = this.query.select(fields);

        } else {
            this.query = this.query.select('-__v');
        }
        return this;
    }
    paging() {
        const page = this.queryStr.page * 1 || 1;
        const limit = this.queryStr.limit * 1 || 100;
        const skip = (page - 1) * limit;
        this.query = this.query.skip(skip).limit(limit);
        return this;

    }
}
module.exports = APIfeatures;