const search = Vue.component("search", {
    template : `
                <div style="background-color:lavender;margin-top: 20px;">
                
                <input class="form-control me-2" type="search" 
                placeholder="Enter a username" aria-label="Search" 
                v-model="term" @keyup="searchterm">
                <div style="margin-top: 20px;">
                <div v-for="username in result">
                  <h6>{{username}} <button @click="getLink(username)">Go to page</button></h6>
                </div>
                </div>                
                </div>
                `,
    computed:{
        username1(){
          return Object.keys(this.usernames);
        }
    },
    data: function(){
      return{
        term:"",
        usernames:null,
        result:[],
        uname:null,
        id:null
      }
    },
    methods:{
      searchterm(){
        this.result=[]
        this.username1.map( username => {
          if(this.term.length > 0 && username.includes(this.term)){
            this.result.push(username)}
        })     
      },
      getLink(uname){
        this.getusername();
        console.log(uname);
        console.log(this.usernames[uname]);
        this.id=this.usernames[uname];
        console.log(this.id);
        this.$router.push(`/ouser/${this.id}`);
      },
      getusername(){        
          fetch(`http://127.0.0.1:5000/getusernames`,
           {method:"GET",
           headers: {
             "Content-Type":"application/json"}})
             .then(resp => resp.json())
             .then(data => {this.usernames= data;})
             .catch(error => {console.log(error);})
      }
    }, created(){this.getusername()}
  })

  export default search;