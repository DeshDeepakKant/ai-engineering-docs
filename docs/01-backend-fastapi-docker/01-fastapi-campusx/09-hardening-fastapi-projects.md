---
id: 09-hardening-fastapi-projects
title: "Improving & Hardening a FastAPI Project: Architecture & CORS"
sidebar_label: "09. Hardening FastAPI Projects"
sidebar_position: 9
description: "Production engineering patterns: APIRouter modularization, pydantic-settings configuration, CORS middleware, and global exception handlers."
tags:
  - fastapi
  - backend
  - python
  - campusx
---

# 📹 Improving & Hardening a FastAPI Project: Architecture & CORS

<div className="video-card" style={{border: '1px solid #30363d', borderRadius: '8px', padding: '16px', marginBottom: '24px', background: 'rgba(56, 139, 253, 0.05)'}}>
  <div style={{display: 'flex', gap: '16px', flexWrap: 'wrap'}}>
    <div><strong>Instructor:</strong> Nitish Singh (CampusX)</div>
    <div><strong>Duration:</strong> 26m 40s</div>
    <div><strong>Course:</strong> Module 1 - Production Backend & Docker</div>
    <div><strong>Watch Link:</strong> <a href="https://www.youtube.com/watch?v=M17qwKnmG38" target="_blank" rel="noopener noreferrer">YouTube Lecture ↗</a></div>
  </div>
</div>


## 📌 Executive Summary

Building a single-file prototype is easy, but enterprise AI projects require:
1. **Separation of Concerns:** Splitting endpoints logically using `APIRouter`.
2. **Centralized Configuration:** Strict environment variable management using `pydantic-settings`.
3. **Cross-Origin Resource Sharing (CORS):** Allowing browser clients (React, Next.js, Vue) to consume the API safely.
4. **Resilient Error Envelopes:** Intercepting unhandled exceptions and returning consistent JSON envelopes.

---

## 🏗️ Architecture: Production File Hierarchy

```text
api_project/
├── app/
│   ├── __init__.py
│   ├── main.py                  # App instantiation, middlewares, routers
│   ├── config.py                # Pydantic Settings & ENV variables
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── health.py            # /healthz and /readyz probes
│   │   └── inference.py         # /v1/predict endpoints
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── prediction.py        # Pydantic models
│   └── services/
│       ├── __init__.py
│       └── model_service.py     # Heavy inference & ML logic
├── requirements.txt
└── Dockerfile
```

---

## 💻 Practical Code: Configuration, Routers & Middleware

### 1. `config.py`: Strict Environment Management
```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str = "Production AI Inference API"
    environment: str = "production"
    model_path: str = "artifacts/model.joblib"
    allowed_origins: list[str] = ["http://localhost:3000", "https://app.example.com"]
    max_batch_size: int = 64

    class Config:
        env_file = ".env"

settings = Settings()
```

### 2. `routers/inference.py`: Modular Routes
```python
from fastapi import APIRouter, status
from pydantic import BaseModel

router = APIRouter(prefix="/v1", tags=["Inference"])

class InputSchema(BaseModel):
    text: str

@router.post("/predict", status_code=status.HTTP_200_OK)
async def run_inference(payload: InputSchema):
    return {"result": f"Processed: {payload.text}"}
```

### 3. `main.py`: Integrating CORS & Router
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from routers import inference

app = FastAPI(title=settings.app_name)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Router
app.include_router(inference.router)
```

---

## 💡 Production Best Practices & Tips

:::tip Restrict CORS in Production
Never leave `allow_origins=["*"]` in production if your API handles credentials or authentication cookies. Explicitly specify your frontend domain origins.
:::



---

---

## 📜 Complete Lecture Transcript (English)

> **Language:** English | **Source:** `09 - Improving the FastAPI API ｜ Video 8 ｜ CampusX.en.srt` | **Total Segments:** 21 | **Word Count:** ~6,320 words

<details>
<summary><b>Click to expand full chronological transcript (21 timestamped intervals)</b></summary>

#### ⏱️ [00:00 ➔ 00:02]

Hi Guys, My name is Nitesh and welcome to my YouTube channel.  In this video also we will continue our fast API playlist. Now what are we going to do in this video ?  Before we get into this, let's take a quick recap of what we did in the last video.  So if you remember, if you watched the previous video, there we built a machine learning model on the problem of insurance premium prediction.  Basically what we were doing was we took a data set where we had user data.  Ok? About their lifestyle, about their personal information and on that basis we were trying to predict whether the insurance premium of that particular customer would be high or medium or low.  Ok?  So to make this prediction we built a random forest machine learning model and we exported that model.  Ok?  And then what did we do?  An API was built on top of this model using the Fast API. So basically we created an end point by calling slash predict.  Where if you send information about a new user, this endpoint will tell us what the insurance premium will be for that particular new user. Ok?  So we built this API and then in the last I also showed you a front end created with the help of Streamlet where we were hitting this API and sending user data there and in return we were seeing the response. We did this in the last video. Ok?  So, now going forward I have three more things to do in this playlist. This API that we have created, we have to first improve it a little bit.  Right? When you're in the industry, when you're working in a company and you're making APIs, they're a little more production grade.  They are a little

#### ⏱️ [00:02 ➔ 00:04]

better.  The API we just created is a bit basic.  So what will we do in today's video?  We will improve this API. Ok?  Once we improve this API, then in the next video we will Dockerize this entire API application with the help of Docker.  And in the last video of the playlist, we'll deploy and run that Dockerized application on AWS. Ok?  So, these are our three tasks. Going forward in the next three videos. But whatever it is, our task in today's video is to improve a little bit the API that we built in the last video. Ok?  So what are the improvements?  I have written it here. We will make almost eight different improvements and by the end of the video you will realize that you have actually improved the API that you created in the last video. Ok?  So this is a very interesting video and please watch it till the end.  Because in the next two videos we will deploy this improved API. Ok?  So with that let's start the video.  Before making improvements to the API, we run our API once and see. Ok?  So here is our project folder.  Here we have this app.   We created our API inside Py.  So let's run it once and try it out to see if things are working properly or not.  So this is how we ran the uvicon command and this started our API.  So we have to go over to Slash Docs.  So here's our API.  Let's try it once. It's a good idea.  Whenever you are resuming a project, you should try running the project once.  So try it out.  Age 35 Weight 90 Height 1.72 Income 15 LPA Smoker Lets Retired Living in True City Gurgaon and Occupation. Execute and you can see we are

#### ⏱️ [00:04 ➔ 00:06]

getting the response predicted category is high.  Ok?  So this means that right now our project and our API are working properly.  Ok?  Now from here we will start our improvements. So the first improvement that I have planned is that as of now, our API is in the project, in the folder where it is located, and we have done a lot of other work there as well.  Ok?  So earlier I taught you the fundamentals of Fast API, so its code is also written here.  The Jupyter Notebook code for the machine learning model we built is also written here.  This is some JSON file also lying here.  So basically the problem is that we have not developed our API independently.  We have just kept it in some other folder with different things.  Ok?  This is not a good idea.  When you create a Docker container for your API, you would like your API to exist independently in a folder.  Meaning it should have its own project folder.  Ok? So the first thing that we do is we will create a separate folder for our API.  Ok ?  And in that only we will do all the work related to our API. Ok?  So what I will do is first I will create a new folder.  Ok?  So here I am creating a new folder.  Let's name the folder Insurance Premium Prediction.  Ok?  And what do we have to do inside this folder ?  We need to place our app.  Paste the py file. And secondly, we also have to bring this model pkl file which is our serialized machine learning model. Because with its help we will make predictions. So what I will do is that here I have model dot PKL.  I am copying it here and opening the Insurance Premium Prediction folder and creating a new folder here.

#### ⏱️ [00:06 ➔ 00:08]

And I am naming this folder models.  Ok?  So anything related to ML model, we are putting it inside this folder.  So we put our model.pk file here.  The second thing that we have to do is that here we have to create our app.py file. Ok?  So let's do one thing for that.  First of all, we open this new folder inside VS Code.  Ok ?  And we will create this app inside VS Code itself. Now we need one more thing to run this whole thing and that is when we were working here in the old folder, we had created a virtual environment here.  You can see it by saying my env and inside this virtual environment we had installed all our libraries.  So we will need exactly the same set of libraries inside our new folder as well.  So what we can do is rather than reinstalling all the libraries.  What we can do is create a requirements.xt file.  Ok?  So basically you have to write this command pip freeze greater than requirements.xt.  As soon as you run this command, you will get a file. Here is that file.  The command execution has not yet completed.  But or it's done now. Look, here is a list of all the libraries we have used so far in our project.  Ok ?  You can see the cost API here. Here is the fast API pidantic will show you.  You will see requests because we used the requests library when creating the front end. PsychLearn will appear.  Starlet Streamlet is showing it all.  So we need this file as well.  So let's do one thing. This is our old folder.  And here's the app.py in it and here's the requirements.txt.  We need both these files inside our insurance premium folder.  Ok?  So, here we go. Now let's do one thing.  Let's open this folder inside VS Code.  Open

#### ⏱️ [00:08 ➔ 00:10]

folder.  Here is this folder.  So, you can see this is our app.py.  This Is Our Requirements.xt. Ok?  Now I will remove some things from this which are not required.  And the reason for removing it is that I can keep it also.  But what will go wrong with keeping that is that in the next video when we dockerize our application using Docker, the size of that Docker image becomes bigger.  So I am removing the unnecessary libraries. Like I'm not going to use streamlets. Similarly, I would not be using requests.  So I simply remove these two libraries. And apart from this, if there is anything that is not needed then we can remove it.  I will have to pause the video and check it once.  Butt is fine after that. For now, we have removed these two libraries.  Now here is our app.py, we will have to make a small change in it.  A, the location of this model PKL has changed a bit.  Now it's inside the models folder.  Ok?  So here we will write model sash model PKL and apart from this everything else will remain exactly the same according to me. Ok?  So now let's do one thing.  Let us run our project from inside this new folder. So we're creating a new terminal.  Here we will first create a new virtual environment. Python - MV env my environment.  The virtual environment has been created. We will activate it once. So we will write my env scripts activate.  Ok?  It got activated. Now what we will do here is that we will install all the libraries that are in the requirements.  So we will write pip install --requirements.txt Now all the libraries which are required to run this project like API idtik are getting installed. So this is the advantage of bringing requirements.xt into the picture.

#### ⏱️ [00:10 ➔ 00:12]

If we didn't bring RequireJS, we would have to manually remember which libraries we installed there. Ok?  So he is fulfilling the requirements. Let's wait until all these libraries are installed.  And guys, we have installed all the libraries.  Ok?  Now the next step is that we will try running our application once. So to run it we have to run the command with uvicon.  That is UVConnect app to app minus reload and you can see our app is running.  We have to go to Dox API Pay and you can see our API is loading.  Let's try it once. Try it out.  Age is 31 Weight is 81 Height is 1.7 Income is 10 LPA Smoking is True City is Mumbai Occupation is Retired Apart from retired I guess there were other things too Private Job Business Owner Right now since I am not able to remember what was there so let's keep Retired and execute and you can see the predict category is low. Ok?  So this API is now working fine.  But the good thing is that now we have created its own dedicated project folder and we are doing all the development inside it.  So this was our first improvement that we wanted to do.  And we are done with this one.  Now let me tell you what the next improvement we need to do is.  So there is a problem in our current API.   The problem is that when you are setting this city field, you have to write the city name in title case.  Meaning, whoever our client of API will be, he has to write the name of the city in title case.  Title case means your first letter should be capitalized and everything else should be

#### ⏱️ [00:12 ➔ 00:14]

small.  So as Mumbai is written here then it is correct.  But if you make it small m Mumbai then what will be the problem that it will not happen that any error will come. But we will treat Mumbai as a tier three city.  Look, if you go into your code here, you will see that we have defined our tier one cities in this way.  This is how we have defined our tier two cities. Now if you send small m in M ​​here, then what will happen is that this Mumbai will not match and you will consider Mumbai as a tier three city.  So basically what do we have to do ?  Here we will need to add a field validator to our pydantic model to convert the city to title case.  If it is not in title case then it will come in title case.  Ok?  So I have already written its code.  Let me show you quickly.  Here is its simple code.  I'll just paste this in here and then I'll discuss what we're doing.  So I just went here next to our pydantic model and I pasted this code here.   There is a slight indentation issue and we have not imported the field validator from pydantic, so let us import it. Field Validator Now look here the code is very simple.  As soon as we get the city, we are stripping it from our client. Which basically means that if there are any extra white spaces before or after the city name, we are removing it and then converting the city name into title case and returning it.  So what will happen now?  After adding this code, you can send it by writing Mumbai like this or by writing it in title case.  You will get the same output.  We will treat Mumbai like a tier one city. Look, the value has started coming back.  What was happening earlier was that if it was

#### ⏱️ [00:14 ➔ 00:16]

small m then the value coming was low and if it was capital m then a different value was coming. Ok?  So what did we do to get this consistency ?  Added a field validator. Now our cities will be treated properly. Ok?  So this was our second improvement which we just did.  The next problem we have with our API is that there is no home endpoint in our API.   What I mean by that is if you ever load our API and you hit its home URL.  Basically, if it is a slash URL, you will not see anything here. Ok?  This is the problem.  So, ideally what should happen is that there should be a message on your home URL stating that your company's API is hosted here.  Ok? So, what we can do is we come here in our code and we can add an end point.  App.get. And here we are adding a function by saying Home. And in this function we are simply returning a dictionary which says message and here it says insurance premium prediction API.  Ok?  Now what will happen is that if someone hits our home URL, he will see this message.  Ok?  So at least this gives us the understanding that our API is working properly. Ok?  So this is one thing we had to add.  Along with this, we should add one more thing. So basically we should add another end point here.  So what happens is that when you go to host your API on a cloud platform like AWS and if you use any service like Kubernetes or Elastic Load Balancer of AWS, then they force you to

#### ⏱️ [00:16 ➔ 00:18]

add a health check endpoint to your API. What is this health check end point?  This helps AWS know that your API is live and working properly.  So this is also recommended.  So what will we do?  We will define another end point by saying health.  And inside this we will create a function called health check. And it will simply return two or three things to you. First it will tell you the status of the API.  We will write OK here.  And apart from this you can tell many more things here. Like when was the last time your API was updated.  Apart from this, you can also tell here that you have loaded your ML model. If you are connecting to a database, you can indicate here that you have connected to the database.  Ok ?  Let's do one thing for now.  Just put the status OK and see.  Ok?  So if I go back and put slash health here and hit enter, I should be getting status okay.  So this is my health check API. Ok?  Now I know you might be thinking that both these things seem redundant. If home is the end point then why are we keeping this health end point?  The reason for this is that the first home endpoint that we have defined is human readable. We have made it for humans.  Anyone hitting our URL can see that the API is working properly. Here edge, this second one that we have made is machine readable.  We created this because some of the AWS services like Kubernetes or Elastic Load Balancer will go and hit this endpoint and if they see the status OK here, only then your API gets deployed properly on those platforms.  So the reason for adding this is simply that we have to deploy this to our endpoint, our API on cloud services

#### ⏱️ [00:18 ➔ 00:20]

and there they will force us to do this.  Ok?  So I hope you are understanding this thing.  Ok?  There's one more thing I'd like to mention here. I have written it here also.  So we have added these two new end points.  One more thing I would like to do is we also expose a model version in our health check API. It's a good practice.  Ok ?  Ok.  So basically what I want is that somehow after loading the model here, we can create a variable here saying model version and let's say the model version is 1.0.0, okay?  I have done this manually for now.   I've created a version number myself.  But generally the model version that comes here comes from a software like ML Flow. Ok?  The model registry in ML Flow is a component of the BOL.  The model registry automatically keeps track of which version of the model you currently have.  Ok? So we have created this manually for now.  But in an ideal scenario you will extract this from ML flow. So for now, let's assume our model version is 1.0.0.  So what I would like to do is I would also pass this information to my health check API. Version Model Version.  Ok?  So now what will happen is that if someone goes to our health check API, he will see both these things that the status is OK.  It means our API is running and the version is this.  So he will also keep getting the version information.  Ok?  And as I said, you can add other things here also.  The model has been loaded.  You can tell like this.  Here you can add model loaded.  And here I can write model is true.  Ok?  Above we have loaded the model here.  If this model is loaded here. ModelIs If modelIsNotNone then true will come.  If the model is a nun then it will fall.  Let's try it once. Look the model is showing loaded true.  Meaning the

#### ⏱️ [00:20 ➔ 00:22]

model powering this API has been loaded. Here is the version of that model.  The status is OK.  Meaning the API is live.  Ok? Again I am explaining this to you again and again that we have done this to make our API machine readable.  Otherwise there is no need for it. We could have managed our work from here also. Ok?  So this is a little bit of what you have to do when you're building an industry grade API. So we did this part also.  The next improvement is to make our code a little cleaner. Making it clean means that if you go to your appy file now, you will notice that we have written all the code in this single file.  Our pidentic model is inside this file.  This is where we're loading our ML model. Predictions are being made here.  And also, all the code for the Fast API is also located here. This is not a good strategy.  Ideally there should be a separation of concerns.  This means that the file containing the fast API should contain only routing code.  The pydantic model should be in a separate file.  The code for loading the ML model and making predictions should be in a separate file.  So what will we do now?  Will implement separation of concerns. So first of all what I will do is that the pedantic model that we have created, this big pedantic model that we have created, we will put it in a different file and we will load that file here.  Ok?  So what I will do is first of all I will create a new folder and I am calling this schema.  Ok?  And inside this schema I am creating a new file by the name of user input dot py.  Ok?  And now what I will do is that whatever is my code of pydantic model, I will cut that entire code. This much I will cut and I will paste it in user input.  Some errors are coming here and mostly errors are because we have kept the import of pydantic here. So I'm going to cut this one as well and paste it here.  Save then a

#### ⏱️ [00:22 ➔ 00:24]

lot of errors are gone.  I guess there will still be some errors. And those errors are that he is not getting tier one cities and tier two cities. So what I'll do is I'll grab both of these components from our original file and paste them here. Ok?  Now our user input py is working correctly.  Now what we have to do is you will notice here that the user input is no longer being identified.  So to identify it, we will write from schema dot user input we will import user input class. We have created the entire class here.  But we are loading it here and using it. No error is coming.  Let's do one thing.  Let us cross check once whether our API is working properly or not.  So we went to the docks. You Can See Home looks different. Health is looking different.  The prediction is here.  Simply go to try out. Age 31 Weight 91 Height 1.5 10 LPA City is Mumbai Retired Exec and you can see 200 predicted category medium is coming.  So this means that even after all the refactoring we just did, our API is still working properly. Ok?  So this is the first improvement that we planned that we separated the pedantic model.  What happens next is that if you go to the pedantic model here, then here we have defined tie one cities and tie two cities by making a big list like this. Ideally, you should do this in a separate file.  So what we can do is we can create one more folder.  Let's call it config and inside config, let's create a file city tear dot py and what we will do is nothing much.  We will cut this entire code and paste it here. Ok?  And here we will simply write from config dot city tier

#### ⏱️ [00:24 ➔ 00:26]

`import` tier one cities tier two cities.  Ok ?  So now what our pedantic model is also very clean.  Only the code of the pydantic model is written here.  Here the name of the city is written and here the code of the current API plus machine learning is written. Now what will we do next?  We will also separate the machine learning code from our API code. Now to isolate the machine learning code, the first thing we will do is go to our models folder where our ML model is currently located.  Here we will create a new file called predict.py and we will write all the code of prediction here. So first of all we will write the code to load the model here.  So I will cut this much code.  We will also write a version of the infact model inside our predict.py. Ok?  For this we will have to import pickles and potatoes. So we put these imports here. And next what we'll do is create a function in this file called predict.py.  Let's call it predict output. Ok?  PredictOutput will get a user input dictionary to do its work.  You will get the user input dictionary and what do you have to do here?  The first step is to convert this dictionary into a data frame. So we'll write PD dot data frame user input and we'll put it into a variable called input df. What will we do after that?  The code that we have written here, we will put this exact code here. Ok?  As soon as we got the input df, we called model.predict.  After turning around we got our output. And this is the output we are returning. Ok?  Let's save this file and go back here one more time and we'll make some changes.

#### ⏱️ [00:26 ➔ 00:28]

So the first change is that now we do n't need to convert it into a data frame here.  We simply need a dictionary and we can call it user underscore input here.  Then what will we do? We're not going to call model dot predict. We'll just call this function whatever the name is, predictOutput.  We will call predictOutput and from here we will send the user input.  This predict output will be reversed and give us our output.  That will be our prediction. Ok?  Just what do we have to do now?  This predict output function needs to be imported. So what will we do for that?  We will write this code.  from model.predict import predict.output. Ok?  So we have refactored the code.   There is one more problem.  A here it is saying the model is not true.  So if you want, you can import the model from here and at the same time you can also import the model version from this file.  Here you have the model loaded and here you also have the model version.  So we imported both these things. Now there is no error anywhere.  And what is the best thing?  Now, you won't see any machine learning code anywhere in our fast API code. Ok?  Neither are we loading the model here nor are we making it make predictions. We are now doing all this work in predict.py.  Again as I said separation of concerns.  Let's run this code once. Because we have made major changes. It's always a good idea to try out your API after a major refactoring to see if it's working properly. Age 31 91 1.72 Income 10 LPA will come to Mumbai instead of string. Occupation retired exec and there is some error.  Let me check what error is this?  Look, the error is that

#### ⏱️ [00:28 ➔ 00:30]

when we created the data frame here in predict.py, we did not specify how many days we want in our data frame. So what do you have to do? While passing this dictionary, it has to be sent in a list. Now if you go back and execute again, you will see that your API is working.  Ok?  So this was a small error.  But after resolving this, the benefit we get now is that our API is properly refactored.  There is separation of concerns and our API has become very clean.  Ok?  Let's make one more small change.  Ah, we have done all this.  Let's keep updating here once in a while. We took apart the city tier. Separated the ML logic.  Let's add one more trycat statement.  So here you will see that we are making the prediction and then returning the result.  But this prediction is dependent on the working of an external file. So, in such scenarios, you should always write try catch. Try Accept in Python.  So you will write try.  And you will do these two things inside the try. And here you will write accept exception as e.  And here you will return a JSON response whose status code will be 500 Internal Server Error and your content here will be a string of e.  Ok?  Whatever this error is, we will print it.  So we have added a try except block so that if some code breaks here, we can handle it gracefully.  Ok ?  So we have completed this one thing also.   The next improvement, guys, is that we want to make the output of our API a little richer.  Rich means we want to provide a little more information. What is happening currently is that our API is simply returning whether the insurance premium of our customer, the user, will be

#### ⏱️ [00:30 ➔ 00:32]

high, medium or low.  Right?  If you go and see the output then you would see this is what we are getting.  But what if I want to show some more things here.  Like I also want to show how much is the confidence score of being high?  Meaning what does our model think?  What is the percentage chance of it being high?  We want to tell this.  Let's say he is 73.  So we would like to not only tell that the output of the model is high but also we would like to give this confidence score.  In fact, not only that, we would also like to tell that if the model found 73 to be high, then how much did she find medium?  Let's say 17, so how much did it cost ? 10 So we want to show this whole thing to the user. Ok?  And the best part is that you can do this easily. Because you have used Random Forest model which not only gives prediction but also gives you confidence score.  Ok ?  So there is nothing special to do.  We have to go to our predict.py function and change this simple code that we have written.  Ok?  Our code will now look like this.  First of all, we will write this one thing outside this function and here user input will come in place of data. Once I write the code correctly.  Then I will explain to you what I did.  So what are we doing first?  We are extracting the names of all the output classes from this model that we have loaded here. Our output classes are High, Medium, Low.  We stored that in class labels. Ok?  Now what are we doing inside the Predict output? Creating the data frame again.  Then we are doing the same thing. Predicted classes are being taken out. Here you will get high, low or medium as answer.  The main change is here.  Here you are getting probabilities. Against All the Three Classes. What is the chance of high, what is the chance of low,

#### ⏱️ [00:32 ➔ 00:34]

what is the chance of medium?  And then we are converting it into a proper dictionary. And finally we are telling everything in return what is the predicted category ?  What is the confidence level of the predicted category ?  And what is the probability class confidence score of all the remaining classes. Ok?  So we are making these changes. Ok?  Now let me show you what difference will happen if you hit your API again after making these changes. So here is Predict Premium.  Let's go try it out once.  Age 31 91 1.72 Income 10 City Mumbai.  Now if I click on execute.  Look, this is my output now.  Look how rich he is. Predicted category is coming here. Confidence is coming at 39, high is 36, low is 39 at the highest and medium is 25.  So now instead of giving our user just a single answer, we are giving him a lot more information which he can use as per his convenience. Ok?  So I hope you understand what changes we made.  So now we just made this particular improvement that we also added confidence score to our API. And this is a good practice.  If you ever look at the machine learning API of some other company in the future, you will see that generally along with the output, you are also told the confidence score.  The last improvement I have planned is to add a response model to our API.  Now you will ask what is response model?  So till now if you have seen that in all the APIs that we have built in Fast API, we have always validated the data coming from the user as an in-client using a pydantic model, right if you look at our code then you would see that we have created this entire pydantic model only for the

#### ⏱️ [00:34 ➔ 00:36]

data that we are getting from that user.  We should be able to validate it and then use it after validating it. In Toast API you always validate the data coming in the input with the help of pydentic.  Buttst API also gives you the option to validate the data being output from your API if you wish. Again using pydantic and it is useful in many scenarios. For example, if you take our example, our output earlier was very simple. We were simply outputting a string by saying high, medium, low. But now look, after giving the confidence score, our return, our output of the API, is a very complex structure. Right?  So what you can do in such a situation is that you can also validate what is going into the output with the help of a pedantic model and to implement this whole thing we use the concept of response model. What exactly is a response model?  Written here in First API, a response model defines the structure of the data that your API endpoint will return.   The advantage of adding this is that your API docs will become cleaner.  There you will be told in advance what kind of output you can expect.  You can validate the output.  If the API does not provide the correct response, an error will be raised and any unnecessary data will also be filtered out from the response.  Ok ?  So that is why it is always recommended that if you are providing even slightly complex output through your API then you should use a response model.  To validate it.  Ok?  So first thing we'll do is we'll create a pydantic

#### ⏱️ [00:36 ➔ 00:38]

model to validate our output. So for that I will go to schema and I will create a new file.  A let's call this new file prediction underscore response dotpy.  Now inside this you have to create a pydantic model.  I'm not writing all that code by hand. I have already written it. I will paste it directly.   Let me guide you through what I did here. I have created a new class called PredictionResponse.  Now look in this we have added three fields.  One is the predicted category.  You can compare it carefully here.  Ok? First is predicted category.  Sorry this is predicted category.  followed by confidence and then class probabilities.  Ok?  These are the three things we are returning.  Now even inside that, if you pay attention, we are telling things that the predicted category will be string.   The confidence score will be a float and the class probabilities will be a dictionary with string keys and float values.  Ok?  Apart from this, we have made all three required.  A description has been added in all three and examples have also been given in all three like this. Ok?  So, this is our prediction response model created now what we will do is come to our appy and here we will write from schema dot prediction response import prediction response okay and now you don't have to do anything you simply have to come to your endpoint and write response model here and the name of the model is prediction response.  What will happen now? Automatically, when you send the output to the client, it will first be

#### ⏱️ [00:38 ➔ 00:40]

validated through this spydantic model.  If things are validated correctly then only you will see the result in the output.  Ok?  Let me try this whole thing for you once.  So now let's see what is interesting is that if you go to the docs, nothing has changed here but here you look in the schemas, you have a schema called Prediction Response in which you can expand and see that the predicted category will be visible, there we have given the description, given the example, confidence will be visible, given the description, given the example, class probabilities will be visible and we have shown its example here also, so whichever client it is, by seeing this particular thing, he will understand in which format the data will be returned to him from this API.  Ok ?  Here you also have the input one. You can easily see this also.  Ok? What do you have to do?  Have to go here again. Write out in 31 91 1.72 10 LPA Mumbai and you are getting your response. Ok? Here we can write the response instead of the predicted category. Ok?  So that here, when we click on execute again, we should see the response here and our complete response should come in this format inside the response. Ok?  So guys, this is our last improvement.  Now if you look back at this entire API, it is a proper industry grade API application. Where we improved things as much as possible. Separation of concerns has been put in place and basically the entire API has been developed very well. Now

#### ⏱️ [00:40 ➔ 00:40]

what our goal will be in the next video is that we will Dockerize this entire API application and then in the next video we will deploy that Dockerized container, that Dockerized application on AWS.  Ok?  So I hope you found today's video meaningful. First of all, you should not feel like, why did we do all this work in vain.  You could have dockerized and deployed it directly.  I really hope I was able to explain to you why it is important to do all this.  Ok?  So if you liked this video please like it.  If you have not subscribed to this channel, please do subscribe.  See you in the next video.  Bye.

</details>
