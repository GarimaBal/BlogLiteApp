from flask import Flask, render_template, request, session, redirect, url_for, jsonify, flash, send_file
from datetime import datetime
from flask_marshmallow import Marshmallow
from flask_cors import CORS
import workers
import tasks
import json
from flask_sqlalchemy import SQLAlchemy
from flask_security import Security, SQLAlchemyUserDatastore, login_required, UserMixin, RoleMixin, current_user,logout_user
from flask_security.utils import hash_password
import time


#start
app = Flask(__name__)
CORS(app)


app.config['SECRET_KEY'] = 'thisisasecret'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///TrackerDB.sqlite3'
app.config['SECURITY_PASSWORD_SALT'] = 'thisisasecretsalt'
app.config['DEBUG']= True
app.config['CELERY_BROKER_URL'] = "redis://localhost:6379/1"
app.config['CELERY_RESULT_BACKEND'] = "redis://localhost:6379/2"



db= SQLAlchemy(app)
db.init_app(app)



#schemas start

roles_user = db.Table('roles_users',
        db.Column('user_id', db.Integer, db.ForeignKey('users.id')),
        db.Column('role_id', db.Integer, db.ForeignKey('role.id')))
        
class Role(db.Model, RoleMixin):
    id=db.Column(db.Integer, primary_key=True)
    name=db.Column(db.String(40))
    description=db.Column(db.String(255))

class users(db.Model, UserMixin):
    __tablename__ = 'users'
    id = db.Column(db.Integer,
                        primary_key=True,
                        autoincrement=True,
                        nullable=False)
    username=db.Column(db.String)
    email = db.Column(db.String, unique=True, nullable=False)
    password = db.Column(db.String, nullable=False)
    active = db.Column(db.Boolean)
    nof = db.Column(db.Integer, nullable=False, default=0)
    nop = db.Column(db.Integer, nullable=False,default=0)
    following = db.Column(db.Integer, nullable=False, default=0)
    last_seen=db.Column(db.String)
    profilepic=db.Column(db.String)
    users1 = db.relationship("user_posts", backref="users")
    roles = db.relationship('Role', 
        secondary=roles_user, backref=db.backref('users', lazy='dynamic'))
    
class user_posts(db.Model):
    __tablename__ = 'user_posts'
    post_id = db.Column(db.Integer,
                           primary_key=True,
                           autoincrement=True,
                           unique=True)
    id = db.Column(db.Integer,
                        db.ForeignKey("users.id"),
                        nullable=False)
    title = db.Column(db.String, nullable=False)
    description = db.Column(db.String, nullable=False)
    image_URL = db.Column(db.String)
    last_update = db.Column(db.String, nullable=False, default = 'NULL')
    
class follow(db.Model):
    __tablename__ = 'follow'
    logid = db.Column(db.Integer,
                      primary_key=True,
                      autoincrement=True,
                      unique=True)
    follower = db.Column(db.Integer,nullable=False)
    followee = db.Column(db.Integer, nullable=False)



ma = Marshmallow(app)

class UserDetailschema(ma.Schema):
	class Meta:
		fields = ('id', 'username', 'email', 'nof', 'nop','following')
		
class PostDetailschema(ma.Schema):
	class Meta:
		fields = ('post_id', 'id', 'title', 'description', 'image_URL', 'last_update', 'author')

class Followschema(ma.Schema):
	class Meta:
		fields = ('follower', 'followee')
		
user_schema = UserDetailschema()
#tracker_schemas = UserTrackerSchema(many=True)

post_schema = PostDetailschema()
post_schemas = PostDetailschema(many=True)

follow_schema = Followschema()

#schemas end

app.app_context().push()
user_datastore= SQLAlchemyUserDatastore(db, users, Role)
security=Security(app, user_datastore) 
   #api=Api(app)
celery=workers.celery
celery.Task=workers.ContextTask
celery.conf.update(broker_url = app.config['CELERY_BROKER_URL'],
                     result_backend = app.config['CELERY_RESULT_BACKEND'])


  
@app.route("/signup", methods = ['GET','POST'])
def signup():
    if request.method == 'POST':
      try:
        user_datastore.create_user(
        username=request.form.get('username'),
        email=request.form.get('email'),
        password=hash_password(request.form.get('password')),
        last_seen=datetime.now())
        db.session.commit()
        return redirect(url_for('dashboard'))
      except:
        flash('username and email should be unique, Please try another combinaion')
        return redirect(url_for('signup'))
        
        
    return render_template('signup.html')

@app.route("/login", methods = ['GET','POST'])
def login():
  if request.method == 'POST':
    email=request.form.get("email")  
    password= request.form.get("password")
    temp = users.query.filter_by(email = email).first()    
    id=temp.id 
    if temp is None:
      flash('no user with this email address exists')
      return redirect(url_for('signup'))
    else:
      if temp.password==password:        
        return redirect(url_for('dashboard'))
      else:
        flash('incorrect password')
        return redirect(url_for('signup'))
  return render_template("login.html")

@app.route("/logout")
def logout():
  logout_user()
  return redirect("/login")

@app.route("/", methods = ['GET'])
@login_required
def dashboard():
  return render_template('index.html')

@app.route("/getcu", methods = ['GET'])
@login_required
def get_current_user_details():
    details=users.query.filter_by(id=current_user.id).first()
    t=str(datetime.now()) 
    details.last_seen=t
    db.session.commit()
    results=user_schema.dump(details)
    return jsonify(results)

@app.route("/getcuposts", methods = ['GET'])
@login_required
def get_cuser_posts():
    postss=user_posts.query.filter_by(id=current_user.id).all()
    for post in postss:
       q=users.query.filter_by(id=post.id).first()
       post.author=q.username
    results=post_schemas.dump(postss)
    return jsonify(results)

@app.route("/getusernames", methods = ['GET'])
@login_required
def getusernames():
  usernames={}
  user=users.query.all() 
  for u in user:
     usernames[u.username]=u.id    
  return jsonify(usernames)

@app.route("/search/<email>", methods = ['GET'])
@login_required
def search(email):  
  user=users.query.filter_by(email=email).first() 
  results=user_schema.dump(user)
  return jsonify(results)

@app.route("/getuser/<int:id>", methods = ['GET'])
@login_required
def get_user_details(id):
    details=users.query.filter_by(id=id).first()
    results=user_schema.dump(details)
    return jsonify(results)

@app.route("/getuserposts/<int:id>", methods = ['GET'])
@login_required
def get_user_posts(id):
    postss=user_posts.query.filter_by(id=id).all()
    for post in postss:
       q=users.query.filter_by(id=post.id).first()
       post.author=q.username
    results=post_schemas.dump(postss)
    return jsonify(results)

@app.route("/followcheck/<int:id>", methods = ['GET'])
@login_required
def follow_check(id):
    follows=follow.query.filter_by(follower=current_user.id, followee=id).first()
    if follows==None:
      return str(False)
    else:
      return str(True)

@app.route("/follow/<int:id>", methods = ['GET'])
@login_required
def FollowUser(id):
    check=follow.query.filter_by(follower=current_user.id, followee=id).first()
    if check==None:   
      entry = follow(follower=current_user.id, followee=id)
      db.session.add(entry)    
      f1=users.query.filter_by(id=current_user.id).first()
      f1.following=f1.following+1
      f2=users.query.filter_by(id=id).first()
      f2.nof=f2.nof+1
      db.session.commit()
      return 'sucess'

@app.route("/unfollow/<int:id>", methods = ['GET'])
@login_required
def UnfollowUser(id):    
    entry = follow.query.filter_by(follower=current_user.id, followee=id).first()
    db.session.delete(entry)    
    f1=users.query.filter_by(id=current_user.id).first()
    f1.following=f1.following-1
    f2=users.query.filter_by(id=id).first()
    f2.nof=f2.nof-1
    db.session.commit()
    return 'sucess'

@app.route("/followerlist", methods = ['GET'])
@login_required
def followerlist():
  #who are the user's followers
  b=[]
  followerss=follow.query.filter_by(followee=current_user.id).all()
  for follower in followerss:
    a={}
    userr=users.query.filter_by(id=follower.follower).first()
    c=follow.query.filter_by(follower=current_user.id, followee=follower.follower).first()
    a["id"]=userr.id
    a["email"]=userr.email
    if c==None:
      a["followback"]=False
    else:
      a["followback"]=True    
    b.append(a)
  followers=json.dumps(b)
  return followers
  
@app.route("/followinglist", methods = ['GET'])
@login_required
def followinglist():
  #who the user is following
  b=[]
  followerss=follow.query.filter_by(follower=current_user.id).all()
  for follower in followerss:
    a={}
    userr=users.query.filter_by(id=follower.followee).first()
    
    a["id"]=userr.id
    a["email"]=userr.email
    a["username"]=userr.username
    
    b.append(a)
  followers=json.dumps(b)
  return followers

@app.route("/getpost/<int:post_id>", methods = ['GET']) #next return json
@login_required
def getpost(post_id):
  postss=user_posts.query.filter_by(post_id=post_id).first()
  q=users.query.filter_by(id=postss.id).first()
  postss.author=q.username
  results=post_schema.dump(postss)
  return jsonify(results)
      
@app.route("/post/blog", methods = ['POST'])
@login_required
def createpost():
  request_data=request.json  
  check=user_posts.query.filter_by(title=request_data['title'], description=request_data['description'], image_URL=request_data['imageUrl']).first()
  if check==None:
    t=str(datetime.now())
    tim = datetime.strptime(t, '%Y-%m-%d %H:%M:%S.%f') 
    entry = user_posts(id=current_user.id, title=request_data['title'], description=request_data['description'], image_URL=request_data['imageUrl'], last_update=tim)
    db.session.add(entry) 
    f2=users.query.filter_by(id=current_user.id).first()
    f2.nop=f2.nop+1
    db.session.commit()
  return 'success'

@app.route("/feed", methods = ['GET'])
@login_required
def feed():
  b=[]
  a=a=json.loads(followinglist())

  for userr in a:     
     postss = user_posts.query.filter_by(id=userr["id"]).all()
     for post in postss:
        c={}
        c["id"]=userr["id"]
        c["email"]=userr["email"]
        c["postID"]=post.post_id
        c["title"]=post.title
        c["description"]=post.description
        c["imageURL"]=post.image_URL
        b.append(c)
                
  sata=json.dumps(b)
  return sata

@app.route("/deletepost/<int:postid>", methods = ['GET'])
@login_required
def deletelog(postid):
  temp=user_posts.query.filter_by(post_id=postid).first()
  usid=temp.id
  lol=users.query.filter_by(id=usid).first()
  lol.nop=lol.nop-1
  db.session.delete(temp)
  db.session.commit()
  return 'sucess'
  
@app.route("/EditPost/<int:postid>", methods = ['POST'])
@login_required
def editpost(postid):
  request_data=request.json 
  t=str(datetime.now())
  tim = datetime.strptime(t, '%Y-%m-%d %H:%M:%S.%f') 
  thepost=user_posts.query.filter_by(post_id=postid).first()
  thepost.title=request_data['title']
  thepost.description=request_data['description']
  thepost.image_URL=request_data['imageUrl']
  thepost.last_update=tim 
  db.session.commit()
  return 'success'

@app.route("/followercsv", methods = ['GET'])
def importfollowerlistcall():
  cuid=[str(current_user.id)]
  job=tasks.importfollowerlist.apply_async(cuid)
  print('called')
  return "success",200

@app.route("/followingcsv", methods = ['GET'])
def importfollowinglistcall():
  cuid=[str(current_user.id)]
  job=tasks.importfollowinglist.apply_async(cuid)
  return "success",200

@app.route("/feedcsv", methods = ['GET'])
def importfeedcall():
   cuid=[str(current_user.id)]
   job=tasks.importfeed.apply_async(cuid)
   return 'success'
   
@app.route("/mypostscsv", methods = ['GET'])
def importmypostscall():
   cuid=[str(current_user.id)]
   job=tasks.importmyposts.apply_async(cuid)
   return 'success'

@app.route("/userpp/<int:id>")
def getprofilepiture(id):
   u=users.query.filter_by(id=id).first()
   if u.profilepic==None:
    filename = 'images/dpp.png'
    return send_file(filename, mimetype='image/png')
   elif u.profilepic[0:6]=='https:':
      return u.profilepic
   else:
    filename = u.profilepic 
    return send_file(filename, mimetype='image/png')    
  
@app.route("/postp/<int:postid>")
def getpostpicture(postid):
    p=user_posts.query.filter_by(post_id=postid).first()
    if p.image_URL==None or p.image_URL=='':
      result=getprofilepiture(p.id)
      return result
    elif p.image_URL[0:6]=='https:':
      return p.image_URL
    else:
      filename=str(p.image_URL)    
      return send_file(filename, mimetype='image/png')

@app.route("/updatepp", methods = ['POST'])
def updatepp():
   user1=users.query.filter_by(id=current_user.id).first()
   request_data=request.json
   user1.profilepic=request_data['profilepic']
   db.session.commit()
   return 'success'

   
    
if __name__=="__main__":
  app.run(host='0.0.0.0', debug=True)
