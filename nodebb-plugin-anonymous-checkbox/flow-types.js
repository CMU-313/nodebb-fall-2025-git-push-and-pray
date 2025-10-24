// @flow
'use strict';

/**
 * Flow type definitions for NodeBB Anonymous Plugin
 */

export type AnonymousPostData = {|
  anonymous: boolean | string | number,
  content: string,
  tid: string,
  pid?: string,
|};

export type UserInfo = {|
  uid: number,
  username: string,
  displayname?: string,
  userslug?: string,
  picture?: string,
|};

export type PostObject = {|
  pid: string,
  tid: string,
  uid: number,
  content: string,
  timestamp: number,
  anonymous?: boolean | string | number,
  user?: UserInfo,
  username?: string,
  userslug?: string,
  isAnonymousDisplay?: boolean,
  anonymousClass?: string,
  anonymousDataAttr?: string,
|};

export type HookData = {|
  data?: AnonymousPostData,
  post?: PostObject,
  postData?: PostObject,
  composerData?: AnonymousPostData,
  templateData?: {|
    posts?: Array<PostObject>,
    anonymousCheckbox?: string,
  |},
|};

export type DatabaseInterface = {|
  setObjectField: (key: string, field: string, value: mixed) => Promise<void>,
  isSortedSetMember: (key: string, value: string) => Promise<boolean>,
  sortedSetAdd: (key: string, score: number, value: string) => Promise<void>,
  sortedSetRemove: (key: string, value: string) => Promise<void>,
|};