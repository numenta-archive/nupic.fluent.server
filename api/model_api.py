# ----------------------------------------------------------------------
# Numenta Platform for Intelligent Computing (NuPIC)
# Copyright (C) 2014, Numenta, Inc.  Unless you have purchased from
# Numenta, Inc. a separate commercial license for this software code, the
# following terms and conditions apply:
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License version 3 as
# published by the Free Software Foundation.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
# See the GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see http://www.gnu.org/licenses.
#
# http://numenta.org/licenses/
# ----------------------------------------------------------------------

import json
import os
import web

from fluent.model import Model
from fluent.term import Term

from utils.limited_size_dict import LimitedSizeDict

urls = (
  r"/([-\w]*)/feed/([-\w]*)", "Feed",
  r"/([-\w]*)/reset", "Reset"
)

ENABLE_CACHING = False
modelCache = LimitedSizeDict(size_limit=25)



class Home:


  def GET(self):
    return "Welcome to Fluent!"



class Feed:


  def POST(self, uid, string):
    model = getModel(uid)
    term = Term().createFromString(string)
    learning = False if web.input().learning == "false" else True
    prediction = model.feedTerm(term, learning)
    model.save()

    closestStrings = prediction.closestStrings()

    web.header('Content-Type', 'application/json')
    return json.dumps([{
      "type": "term",
      "term": {
        "string": string
      }
    } for string in closestStrings])



class Reset:


  def POST(self, uid):
    model = getModel(uid)
    model.resetSequence()
    model.save()
    return ""



def getModel(uid):
  if uid in modelCache:
    return modelCache[uid]

  modelDir = _getModelDir(uid)

  if not os.path.exists(modelDir):
    os.makedirs(modelDir)

  model = Model(checkpointDir=modelDir)

  if model.hasCheckpoint():
    model.load()

  if ENABLE_CACHING:
    modelCache[uid] = model

  return model


def _getModelDir(uid):
  return "store/models/{0}".format(uid)



app = web.application(urls, globals())
