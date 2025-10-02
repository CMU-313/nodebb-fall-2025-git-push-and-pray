'use strict';

const plugin = require('../nodebb-plugin-anonymous-checkbox/library');
const should = require('should');

describe('Anonymous plugin basics', () => {
  it('marks posts as anonymous via filterPostGet', async () => {
    const hookData = {
      post: {
        pid: 1,
        tid: 1,
        content: 'Hello world',
        uid: 123,
        anonymous: 1,
        user: {
          uid: 123,
          displayname: 'Alice',
          username: 'alice',
        },
      },
    };

    const result = await plugin.filterPostGet(hookData);
    const { post } = result;

    post.should.have.property('user');
    post.user.displayname.should.equal('Anonymous');
    post.user.username.should.equal('Anonymous');
    post.anonymous.should.equal(1);
    post.isAnonymousDisplay.should.be.true;
  });
});
