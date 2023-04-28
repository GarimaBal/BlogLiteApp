from workers import celery
from datetime import datetime, timedelta
from celery.schedules import crontab
import emaill
import sqlite3
import report
import csv
import json


@celery.on_after_finalize.connect
def dailyemail(sender, **kwargs):
    sender.add_periodic_task(crontab(hour=20, minute=30), daily.s())

@celery.on_after_finalize.connect
def monthlyemail(sender, **kwargs):
    sender.add_periodic_task(crontab(hour=20, minute=30), monthly.s())

@celery.task()
def daily():
    now=datetime.now()
    dt=timedelta(hours=24)
    conn=sqlite3.connect('TrackerDB.sqlite3')
    rows=conn.execute("SELECT * From users")
    for row in rows:
      dateformat='%Y-%m-%d %H:%M'
      t=datetime.strptime(row[8][:16], dateformat)
      if now - t > dt:
        emaill.dailyupdate(row)
    return 'daily emails sent'

@celery.task()
def monthly():
    updated_posts=0
    prev_updated_posts=0
    active_users=0
    prev_active_users=0
    data={}
    now=datetime.now()
    last_month=now-timedelta(days=30)
    last_2month=now-timedelta(days=60)
    conn=sqlite3.connect('TrackerDB.sqlite3')
    rows=conn.execute("SELECT * From users")
    for row in rows:
      dateformat='%Y-%m-%d %H:%M'
      t=datetime.strptime(row[8][:16], dateformat)
      if t>last_month and t<now:
        active_users=+1
      elif t<last_month and t>last_2month:
         prev_active_users=+1

    rows=conn.execute("SELECT * From user_posts")
    for row in rows:
        dateformat='%Y-%m-%d %H:%M'
        t=datetime.strptime(row[5][:16], dateformat)
        if t>last_month and t<now:
            updated_posts=+1
        elif t<last_month and t>last_2month:
            prev_updated_posts=+1
    
    data["active_users"]=active_users
    data["prev_active_users"]=prev_active_users
    data["updated_posts"]=updated_posts
    data["prev_updated_posts"]=prev_updated_posts
    
    if (active_users > prev_active_users):
        result = active_users-prev_active_users
        data["conslusion"]="As you can see, the number of users increased by" + str(result)
    elif (active_users < prev_active_users):
        result = prev_active_users-active_users
        data["conslusion"]="As you can see, the number of users increased by" + str(result)
    else:
        data["conslusion"]="As you can see, the number of users remained unchanged."
    report.create_pdf_report(data)
    emaill.monthlyupdate(data)
    return 'monthly emails sent'

@celery.task()
def importfeed(cuid):
    b=[]
    following=[]
    posts=[]
    conn=sqlite3.connect('TrackerDB.sqlite3')
    followerss=conn.execute("SELECT * From follow WHERE follower="+cuid)
    for follower in followerss:
       following.append(follower[2])
    for i in following:
        d=conn.execute("SELECT * From user_posts WHERE id="+str(i))
        for j in d:
            posts.append(j)
    for post in posts:
        c={}
        c["title"]=post[2]
        c["description"]=post[3]
        b.append(c)
    conn.close()
    if b != []:
        with open("feed.csv","w",newline="") as feedfile:
            writer=csv.writer(feedfile, delimiter=',')
            writer.writerow(b[0].keys())
            for row in b:
                writer.writerow(row.values())
    return "success", 200

@celery.task()
def importfollowerlist(cuid):
  b=[]
  print('called')
  conn=sqlite3.connect('TrackerDB.sqlite3')
  x=conn.execute("SELECT * From follow WHERE followee="+cuid)
  for follower in x:    
    a={}
    userr=conn.execute("SELECT * From users WHERE id="+str(follower[1]))
    for u in userr:   
        a["username"]=u[1]
        a["email"]=u[2]
        a["nop"]=u[6]
        a["last_seen"]=u[8]
        b.append(a)
    
    if b != []:
        print(b)
        with open("followers.csv","w",newline="") as followerfile:
            writer=csv.writer(followerfile, delimiter=',')
            writer.writerow(b[0].keys())
            for row in b:
                writer.writerow(row.values())

  return "success",200

@celery.task()
def importmyposts(cuid):
    posts=[]
    b=[]
    conn=sqlite3.connect('TrackerDB.sqlite3')
    d=conn.execute("SELECT * From user_posts WHERE id="+cuid)
    for j in d:
        posts.append(j)
    for post in posts:
        c={}
        c["title"]=post[2]
        c["description"]=post[3]
        b.append(c)
    conn.close()
    if b != []:
        with open("myposts.csv","w",newline="") as mypostsfile:
            writer=csv.writer(mypostsfile, delimiter=',')
            writer.writerow(b[0].keys())
            for row in b:
                writer.writerow(row.values())
    return "success", 200

@celery.task()
def importfollowinglist(cuid):
  b=[]
  conn=sqlite3.connect('TrackerDB.sqlite3')
  x=conn.execute("SELECT * From follow WHERE follower="+cuid)
  for following in x:    
    a={}
    userr=conn.execute("SELECT * From users WHERE id="+str(following[1]))
    for u in userr:   
        a["username"]=u[1]
        a["email"]=u[2]
        a["nop"]=u[6]
        a["last_seen"]=u[8]
        b.append(a)

    if b != []:
        with open("following.csv","w",newline="") as followingfile:
            writer=csv.writer(followingfile, delimiter=',')
            writer.writerow(b[0].keys())
            for row in b:
                writer.writerow(row.values())

  return "success",200

celery.conf.timezone = 'Asia/Kolkata'


    