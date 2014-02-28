try:
  from collections import OrderedDict
except ImportError:
  # python 2.6 or earlier, use backport
  from ordereddict import OrderedDict



class LimitedSizeDict(OrderedDict):


  def __init__(self, *args, **kwds):
    self.size_limit = kwds.pop("size_limit", None)
    OrderedDict.__init__(self, *args, **kwds)
    self._check_size_limit()


  def __setitem__(self, key, value):
    OrderedDict.__setitem__(self, key, value)
    self._check_size_limit()


  def _check_size_limit(self):
    if self.size_limit is not None:
      while len(self) > self.size_limit:
        self.popitem(last=False)
