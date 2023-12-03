class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  filter() {
    // console.log(req.query);
    const queryObj = { ...this.queryString }; //req.queryはオブジェクトなので、スプレッド構文でコピーする。req.queryはオブジェクトの参照なので、直接変更すると、req.queryも変更されてしまう
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);
    // console.log(req.query, queryObj);
    console.log(this.queryString);
    let queryStr = JSON.stringify(queryObj); //queryStrは文字列
    // console.log(JSON.parse(queryStr));
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`); //正規表現を使って、queryStrの中のgte,gt,lte,ltを$gte,$gt,$lte,$ltに置き換える
    // console.log(JSON.parse(queryStr));  JSON.parse(queryStr)はオブジェクト,queryStrをオブジェクトに変換する
    this.query = this.query.find(JSON.parse(queryStr)); //Tour.find()はqueryを返す
    return this; //thisはAPIFeaturesのインスタンス各メソッドの後に次のメソッドを続けて呼び出すためには、前のメソッドがオブジェクト自体（this）を返す必要がある
  }

  sort() {
    if (this.queryString.sort) {
      // console.log(req.query.sort);
      // console.log(req.query.sort.split(','));
      const sortBy = this.queryString.sort.split(',').join(' ');
      console.log(sortBy);
      this.query = this.query.sort(sortBy); // urlのクエリパラメーターにsort=price,ratingsAverageと入力すると、sort('price ratingsAverage') となり、priceでソートした後に、ratingsAverageでソートする
    } else {
      this.query = this.query.sort('-createdAt'); //sort('-price')はpriceを降順にソートする
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      console.log(fields);
      this.query = this.query.select(fields); //select('name duration price') urlのクエリパラメーターにfields=name,duration,priceと入力すると、name,duration,priceのみを取得する
    } else {
      this.query = this.query.select('-__v'); //select('-name -duration -price')はname,duration,priceを除外する
    }
    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1; //文字列を数値に変換するdefaultは1
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    // console.log(page, limit, skip);
    return this;
  }
}

module.exports = APIFeatures;
