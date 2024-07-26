const mongoose=require('mongoose')

const profileSchema=mongoose.Schema({
auth:{
type:mongoose.Schema.ObjectId,
ref:'auth'
},
about:{
    type:String,
    required:true
},
coach:{
    type:mongoose.Schema.ObjectId,
    ref:'coach'
},
athleticaccomplishments:{
    type:[String]
},

socialLinks:{
    type:[{social_type:String,link:String}],
    required:true
},
player:{
    type:mongoose.Schema.ObjectId,
    ref:'player'
},
photos:{
    type:[String]
},
stats:{

    gp:{
        type:Number
    },
    fg:{
        type:Number
    },
    threep:{
        type:Number
    },
    ft:{
        type:Number
    },
    reb:{
        type:Number
    },
    ast:{
        type:Number
    },
    blk:{
        type:Number
    },
    stl:{
        type:Number
    },
    pf:{
        type:Number
    },
    to:{
        type:Number
    },
    pts:{
        type:Number 
    }
},


offers:{
type:[
    {
        university:{
            type:String,
           
        },
        logo:{
        type:String,
        },
         status:{
            type:String,

        
         },
         date:{
            type:Date,
            required:true
         }

    }
]
},
videos:{
    type:mongoose.Schema.ObjectId,
    ref:'video'
},
flaggedBy:{
    type:[
    {
        type:mongoose.Schema.ObjectId,
        ref:'auth'
    }
    ]
},
academics:{
    type:[{
        gpa:{
            type:String,
            required:true
        },
        satScore:{
            type:String,
            required:true
        },
        actScore:{
            type:String,
            required:true
        },
        ncaaId:{
            type:String,
         
        }
        
    }]
}
},{timestamps:true})
profileSchema.index({ auth: 1 });
profileSchema.index({ university: 1 });
profileSchema.index({ player: 1 });
const profileModel=mongoose.model('profile',profileSchema)
module.exports=profileModel;