const mongoose = require('mongoose')

const articleSchema = new mongoose.Schema({
    type: String,
    data: [
        {
            _id:mongoose.Schema.Types.ObjectId,
            link:String,
            title:String,
            src:String,
            img:String,
            body:String,
            date:String
        }
    ]
})

articleSchema.statics.createArticle = async function({type,link, title, src, img, body, date}){
    const id = new mongoose.Types.ObjectId()
    const update = await this.findOneAndUpdate({type},{
        $push :{
            data :{_id:id, link, title, src, img, body, date}
        }
    })
    if(update){
        return {status:"success"}
    }else{
        throw Error("Gagal")
    }
}

const Article = mongoose.model('articles', articleSchema, 'articles')
module.exports = Article